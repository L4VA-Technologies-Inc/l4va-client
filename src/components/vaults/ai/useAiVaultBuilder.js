import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  AI_VAULT_CHAT_SESSION_KEY,
  buildVaultFromAiDraft,
  dropInvalidFields,
  validateAiDraftFields,
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

const GREETING = {
  role: 'assistant',
  content:
    "Tell me your strategy — the assets, who can join, and how long the windows should stay open. I'll fill in the vault config as we talk and pick sensible values for anything you don't care to specify.",
};

const readSession = () => {
  try {
    const stored = sessionStorage.getItem(AI_VAULT_CHAT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const toHistoryPayload = history =>
  history.slice(-MAX_HISTORY_MESSAGES).map(({ role, content }) => ({ role, content }));

export const useAiVaultBuilder = () => {
  const restored = useRef(readSession()).current;

  const [messages, setMessages] = useState(restored?.messages ?? [GREETING]);
  const [vault, setVault] = useState(restored?.vault ?? initialVaultState);
  const [status, setStatus] = useState(restored?.status ?? 'gathering');
  const [missingFields, setMissingFields] = useState(restored?.missingFields ?? []);
  const [aiFields, setAiFields] = useState(restored?.aiFields ?? []);
  const [isSending, setIsSending] = useState(false);
  // Action the backend returned for this turn (e.g. a validated launch confirmation). Transient:
  // it belongs to the turn that produced it, so it is never persisted or restored.
  const [pendingAction, setPendingAction] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { network } = useNetwork();
  const { data: presetsData } = usePresets();
  const presets = useMemo(() => presetsData?.data?.items || presetsData?.data || [], [presetsData]);

  const environment =
    import.meta.env.VITE_CARDANO_NETWORK === environments.MAINNET ? environments.MAINNET : environments.PREPROD;

  const persist = useCallback((next, nextVault, nextStatus, nextMissing, nextAiFields) => {
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
        let candidate = buildVaultFromAiDraft(base, draft, presets);
        let errors = await validateAiDraftFields(candidate, Object.keys(draft));

        // Feed the live yup errors back so a stale prompt degrades to a retry, never to a bad draft.
        for (let attempt = 0; attempt < MAX_CORRECTION_ATTEMPTS && errors.length; attempt += 1) {
          response = await requestTurn(history, vault, errors);
          base = response.resetDraft ? initialVaultState : vault;
          draft = response.vaultDraft ?? {};
          candidate = buildVaultFromAiDraft(base, draft, presets);
          errors = await validateAiDraftFields(candidate, Object.keys(draft));
        }

        if (errors.length) {
          draft = dropInvalidFields(draft, errors);
          candidate = buildVaultFromAiDraft(base, draft, presets);
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
        const nextAiFields = response.resetDraft
          ? Object.keys(draft)
          : [...new Set([...aiFields, ...Object.keys(draft)])];

        setMessages(nextMessages);
        setVault(candidate);
        // The assistant can only ask; the server decides. An action exists here only because a tool
        // ran server-side and its validation passed.
        setPendingAction(response.action ?? null);
        setStatus(nextStatus);
        setMissingFields(response.missingFields ?? []);
        setAiFields(nextAiFields);
        persist(nextMessages, candidate, nextStatus, response.missingFields ?? [], nextAiFields);
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

  const generateImage = useCallback(
    async prompt => {
      if (!prompt.trim() || isGeneratingImage) return;

      setIsGeneratingImage(true);
      try {
        const { data } = await AiApiProvider.generateVaultImage(prompt.trim());
        // One generated image backs both the vault image and the vault token image.
        const next = { ...vault, vaultImage: data.fileUrl, ftTokenImg: data.fileUrl };
        setVault(next);
        persist(messages, next, status, missingFields, aiFields);
      } catch (err) {
        toast.error(err?.response?.data?.message ?? 'Could not generate the image.');
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [aiFields, isGeneratingImage, messages, missingFields, persist, status, vault]
  );

  const uploadImage = useCallback(
    async file => {
      if (!file || isUploadingImage) return;

      setIsUploadingImage(true);
      try {
        const { data } = await CoreApiProvider.uploadImage(file, 'background');
        // Same rule as the AI-generated image: one asset backs both the vault and its token.
        const next = { ...vault, vaultImage: data.url, ftTokenImg: data.url };
        setVault(next);
        persist(messages, next, status, missingFields, aiFields);
      } catch (err) {
        toast.error(err?.response?.data?.message ?? 'Could not upload the image.');
      } finally {
        setIsUploadingImage(false);
      }
    },
    [aiFields, isUploadingImage, messages, missingFields, persist, status, vault]
  );

  const clearAction = useCallback(() => setPendingAction(null), []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(AI_VAULT_CHAT_SESSION_KEY);
    setPendingAction(null);
    setMessages([GREETING]);
    setVault(initialVaultState);
    setStatus('gathering');
    setMissingFields([]);
    setAiFields([]);
  }, []);

  // Lets the preview panel edit fields (e.g. assetsWhitelist) the assistant never sets itself.
  const updateVaultField = useCallback(
    (field, value) => {
      const next = { ...vault, [field]: value };
      setVault(next);
      persist(messages, next, status, missingFields, aiFields);
    },
    [aiFields, messages, missingFields, persist, status, vault]
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
    generateImage,
    uploadImage,
    updateVaultField,
    reset,
  };
};
