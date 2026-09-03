import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  AI_VAULT_CHAT_SESSION_KEY,
  buildAiGreeting,
  buildVaultFromAiDraft,
  buildVaultImagePrompt,
  clearStoredVaultDraft,
  collectIncompleteFields,
  dropInvalidFields,
  enforceVaultCoherence,
  mergeResolvedAssets,
  readStoredVaultDraft,
  validateAiDraftFields,
  writeStoredVaultDraft,
} from './aiVault.utils';
import { createSmoothTextRevealer } from './smoothTextRevealer';

import { initialVaultState } from '@/components/vaults/constants/vaults.constants';
import { environments } from '@/constants/core.constants';
import { useNetwork } from '@/hooks/useNetwork';
import { AiApiProvider } from '@/services/api/ai';
import { CoreApiProvider } from '@/services/api/core';
import { usePresets } from '@/services/api/queries';

const MAX_CORRECTION_ATTEMPTS = 2;
const MAX_HISTORY_MESSAGES = 30;

const readSession = () => {
  try {
    const stored = sessionStorage.getItem(AI_VAULT_CHAT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Only role/content reaches the model: image widgets and attachments are UI state, not conversation.
const toHistoryPayload = history =>
  history.slice(-MAX_HISTORY_MESSAGES).map(({ role, content }) => ({ role, content }));

/** Drops a trailing image-prompt card once it has been used or superseded. */
const withoutTrailingGenerator = messages =>
  messages.length && messages[messages.length - 1].widget?.type === 'image-generator'
    ? messages.slice(0, -1)
    : messages;

export const useAiVaultBuilder = () => {
  const restored = useRef(readSession()).current;
  const { network, isRobinHood } = useNetwork();

  const [messages, setMessages] = useState(() => restored?.messages ?? [buildAiGreeting(isRobinHood)]);
  // The draft is shared with the manual create form via localStorage, so a manual edit made
  // between visits wins over this hook's own (possibly stale) session snapshot.
  const [vault, setVault] = useState(() => readStoredVaultDraft() ?? restored?.vault ?? initialVaultState);
  const [status, setStatus] = useState(restored?.status ?? 'gathering');
  const [missingFields, setMissingFields] = useState(restored?.missingFields ?? []);
  const [aiFields, setAiFields] = useState(restored?.aiFields ?? []);
  const [isSending, setIsSending] = useState(false);
  // Action the backend returned for this turn (e.g. a validated launch confirmation). Transient:
  // it belongs to the turn that produced it, so it is never persisted or restored.
  const [pendingAction, setPendingAction] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: presetsData } = usePresets();
  const presets = useMemo(() => presetsData?.data?.items || presetsData?.data || [], [presetsData]);

  const environment =
    import.meta.env.VITE_CARDANO_NETWORK === environments.MAINNET ? environments.MAINNET : environments.PREPROD;

  const persist = useCallback((next, nextVault, nextStatus, nextMissing, nextAiFields) => {
    // Keep the shared draft in sync so the manual form sees every AI/preview edit on its next mount.
    writeStoredVaultDraft(nextVault);
    try {
      sessionStorage.setItem(
        AI_VAULT_CHAT_SESSION_KEY,
        JSON.stringify({
          messages: next,
          vault: nextVault,
          status: nextStatus,
          missingFields: nextMissing,
          aiFields: nextAiFields,
        })
      );
    } catch {
      // Session storage is best-effort; losing the transcript is not fatal.
    }
  }, []);

  useEffect(() => {
    if (messages.length !== 1 || messages[0]?.role !== 'assistant') return;
    const next = buildAiGreeting(isRobinHood);
    if (messages[0].content === next.content) return;
    setMessages([next]);
  }, [isRobinHood, messages]);

  const requestTurn = useCallback(
    async (history, currentDraft, validationErrors) => {
      const { data } = await AiApiProvider.sendVaultAssistantMessage({
        messages: toHistoryPayload(history),
        chain: network,
        network: environment,
        currentDraft,
        ...(validationErrors?.length ? { validationErrors } : {}),
      });
      return data;
    },
    [network, environment]
  );

  const streamTurn = useCallback(
    async (history, currentDraft, onDelta) => {
      return AiApiProvider.streamVaultAssistantMessage(
        {
          messages: toHistoryPayload(history),
          chain: network,
          network: environment,
          currentDraft,
        },
        { onDelta }
      );
    },
    [network, environment]
  );

  const sendMessage = useCallback(
    async text => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const history = [...messages, { role: 'user', content: trimmed }];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setIsSending(true);
      setPendingAction(null);

      try {
        const revealer = createSmoothTextRevealer(content => {
          setMessages([...history, { role: 'assistant', content }]);
        });

        let response;
        try {
          response = await streamTurn(history, vault, delta => {
            revealer.push(delta);
          });
        } catch (err) {
          revealer.cancel();
          throw err;
        }

        const streamedContent = await revealer.finish();

        // A reset request replaces the draft from scratch instead of merging onto the old one.
        let base = response.resetDraft ? initialVaultState : vault;
        let draft = response.vaultDraft ?? {};
        let resolvedAssets = [...(response.resolvedAssets ?? [])];
        let candidate = mergeResolvedAssets(buildVaultFromAiDraft(base, draft, presets), resolvedAssets);
        let errors = await validateAiDraftFields(candidate, Object.keys(draft));

        // Feed the live yup errors back so a stale prompt degrades to a retry, never to a bad draft.
        for (let attempt = 0; attempt < MAX_CORRECTION_ATTEMPTS && errors.length; attempt += 1) {
          response = await requestTurn(history, vault, errors);
          base = response.resetDraft ? initialVaultState : vault;
          draft = response.vaultDraft ?? {};
          resolvedAssets = [...resolvedAssets, ...(response.resolvedAssets ?? [])];
          candidate = mergeResolvedAssets(buildVaultFromAiDraft(base, draft, presets), resolvedAssets);
          errors = await validateAiDraftFields(candidate, Object.keys(draft));
        }

        if (errors.length) {
          draft = dropInvalidFields(draft, errors);
          candidate = mergeResolvedAssets(buildVaultFromAiDraft(base, draft, presets), resolvedAssets);
        }

        const nextMessages = [
          ...history,
          {
            role: 'assistant',
            content: response.message || streamedContent,
            options: response.options ?? [],
          },
        ];
        const nextStatus = errors.length ? 'gathering' : response.status;
        const resolvedKeys = resolvedAssets.length ? ['assetsWhitelist'] : [];
        const nextAiFields = response.resetDraft
          ? [...new Set([...Object.keys(draft), ...resolvedKeys])]
          : [...new Set([...aiFields, ...Object.keys(draft), ...resolvedKeys])];

        // Derived from the vault we are about to show, never from the assistant's own report, so
        // the panel can never claim a field is missing while displaying its value.
        const nextMissingFields = await collectIncompleteFields(candidate);

        setMessages(nextMessages);
        setVault(candidate);
        // The assistant can only ask; the server decides. An action exists here only because a tool
        // ran server-side and its validation passed.
        setPendingAction(response.action ?? null);
        setStatus(nextStatus);
        setMissingFields(nextMissingFields);
        setAiFields(nextAiFields);
        persist(nextMessages, candidate, nextStatus, nextMissingFields, nextAiFields);
      } catch (err) {
        // Drop the empty/partial assistant bubble on failure so the user can retry cleanly.
        setMessages(history);
        toast.error(err?.response?.data?.message ?? err?.message ?? 'The assistant is unavailable right now.');
      } finally {
        setIsSending(false);
      }
    },
    [aiFields, isSending, messages, persist, presets, requestTurn, streamTurn, vault]
  );

  /**
   * Applies one image to the vault and shows it in the conversation. The vault and its governance
   * token always share a single image, so both fields are written together.
   */
  const applyImage = useCallback(
    async (url, content) => {
      const next = { ...vault, vaultImage: url, ftTokenImg: url };
      const nextMessages = [
        ...withoutTrailingGenerator(messages),
        { role: 'assistant', content, attachment: { type: 'vault-image', url } },
      ];
      const nextMissingFields = await collectIncompleteFields(next);

      setVault(next);
      setMessages(nextMessages);
      setMissingFields(nextMissingFields);
      persist(nextMessages, next, status, nextMissingFields, aiFields);
    },
    [aiFields, messages, persist, status, vault]
  );

  /** Opens the inline image-prompt card, prefilled from the vault built so far. */
  const startImageGeneration = useCallback(() => {
    if (isGeneratingImage || isUploadingImage) return;

    const isReplacing = !!vault.vaultImage;
    const nextMessages = [
      ...withoutTrailingGenerator(messages),
      {
        role: 'assistant',
        content: isReplacing
          ? 'Describe the image you want instead, or adjust the suggestion below.'
          : 'Describe the image you want, or use the suggestion below.',
        widget: { type: 'image-generator', prompt: buildVaultImagePrompt(vault), isReplacing },
      },
    ];

    setMessages(nextMessages);
    persist(nextMessages, vault, status, missingFields, aiFields);
  }, [aiFields, isGeneratingImage, isUploadingImage, messages, missingFields, persist, status, vault]);

  const generateImage = useCallback(
    async prompt => {
      if (!prompt?.trim() || isGeneratingImage) return;

      setIsGeneratingImage(true);
      try {
        const { data } = await AiApiProvider.generateVaultImage(prompt.trim());
        await applyImage(data.fileUrl, vault.name ? `Image added to ${vault.name}.` : 'Image added.');
      } catch (err) {
        // A failure stays local to the image card; the conversation itself is untouched.
        toast.error(err?.response?.data?.message ?? 'Could not generate the image.');
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [applyImage, isGeneratingImage, vault.name]
  );

  const uploadImage = useCallback(
    async file => {
      if (!file || isUploadingImage) return;

      setIsUploadingImage(true);
      try {
        const { data } = await CoreApiProvider.uploadImage(file, 'background');
        await applyImage(data.url, 'Image added.');
      } catch (err) {
        toast.error(err?.response?.data?.message ?? 'Could not upload the image.');
      } finally {
        setIsUploadingImage(false);
      }
    },
    [applyImage, isUploadingImage]
  );

  const clearAction = useCallback(() => setPendingAction(null), []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(AI_VAULT_CHAT_SESSION_KEY);
    clearStoredVaultDraft();
    setPendingAction(null);
    setMessages([buildAiGreeting(isRobinHood)]);
    setVault(initialVaultState);
    setStatus('gathering');
    setMissingFields([]);
    setAiFields([]);
  }, [isRobinHood]);

  // Lets the preview panel edit fields (e.g. assetsWhitelist) the assistant never sets itself.
  const updateVaultField = useCallback(
    async (field, value) => {
      const patch = field && typeof field === 'object' && value === undefined ? field : { [field]: value };
      const next = enforceVaultCoherence({ ...vault, ...patch });
      const nextMissingFields = await collectIncompleteFields(next);

      setVault(next);
      setMissingFields(nextMissingFields);
      persist(messages, next, status, nextMissingFields, aiFields);
    },
    [aiFields, messages, persist, status, vault]
  );

  return {
    messages,
    vault,
    status,
    missingFields,
    aiFields,
    isSending,
    isGeneratingImage,
    isUploadingImage,
    pendingAction,
    clearAction,
    sendMessage,
    startImageGeneration,
    generateImage,
    uploadImage,
    updateVaultField,
    reset,
  };
};
