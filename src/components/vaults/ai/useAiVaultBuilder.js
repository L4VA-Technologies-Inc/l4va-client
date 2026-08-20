import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  AI_VAULT_CHAT_SESSION_KEY,
  buildVaultFromAiDraft,
  dropInvalidFields,
  validateAiDraftFields,
} from './aiVault.utils';

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
    'Tell me what you want to vault — the assets, who can join, and how long the windows should stay open. I will fill in the rest.',
};

const readSession = () => {
  try {
    const stored = sessionStorage.getItem(AI_VAULT_CHAT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAiVaultBuilder = () => {
  const restored = useRef(readSession()).current;

  const [messages, setMessages] = useState(restored?.messages ?? [GREETING]);
  const [vault, setVault] = useState(restored?.vault ?? initialVaultState);
  const [status, setStatus] = useState(restored?.status ?? 'gathering');
  const [missingFields, setMissingFields] = useState(restored?.missingFields ?? []);
  const [aiFields, setAiFields] = useState(restored?.aiFields ?? []);
  const [isSending, setIsSending] = useState(false);
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
        messages: history.slice(-MAX_HISTORY_MESSAGES).map(({ role, content }) => ({ role, content })),
        chain: network,
        network: environment,
        currentDraft,
        ...(validationErrors?.length ? { validationErrors } : {}),
      });
      return data;
    },
    [network, environment]
  );

  const sendMessage = useCallback(
    async text => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const history = [...messages, { role: 'user', content: trimmed }];
      setMessages(history);
      setIsSending(true);

      try {
        let response = await requestTurn(history, vault);
        let draft = response.vaultDraft ?? {};
        let candidate = buildVaultFromAiDraft(vault, draft, presets);
        let errors = await validateAiDraftFields(candidate, Object.keys(draft));

        // Feed the live yup errors back so a stale prompt degrades to a retry, never to a bad draft.
        for (let attempt = 0; attempt < MAX_CORRECTION_ATTEMPTS && errors.length; attempt += 1) {
          response = await requestTurn(history, vault, errors);
          draft = response.vaultDraft ?? {};
          candidate = buildVaultFromAiDraft(vault, draft, presets);
          errors = await validateAiDraftFields(candidate, Object.keys(draft));
        }

        if (errors.length) {
          draft = dropInvalidFields(draft, errors);
          candidate = buildVaultFromAiDraft(vault, draft, presets);
        }

        const nextMessages = [...history, { role: 'assistant', content: response.message }];
        const nextStatus = errors.length ? 'gathering' : response.status;
        const nextAiFields = [...new Set([...aiFields, ...Object.keys(draft)])];

        setMessages(nextMessages);
        setVault(candidate);
        setStatus(nextStatus);
        setMissingFields(response.missingFields ?? []);
        setAiFields(nextAiFields);
        persist(nextMessages, candidate, nextStatus, response.missingFields ?? [], nextAiFields);
      } catch (err) {
        toast.error(err?.response?.data?.message ?? 'The assistant is unavailable right now.');
      } finally {
        setIsSending(false);
      }
    },
    [aiFields, isSending, messages, persist, presets, requestTurn, vault]
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

  const reset = useCallback(() => {
    sessionStorage.removeItem(AI_VAULT_CHAT_SESSION_KEY);
    setMessages([GREETING]);
    setVault(initialVaultState);
    setStatus('gathering');
    setMissingFields([]);
    setAiFields([]);
  }, []);

  return {
    messages,
    vault,
    status,
    missingFields,
    aiFields,
    isSending,
    isGeneratingImage,
    isUploadingImage,
    sendMessage,
    generateImage,
    uploadImage,
    reset,
  };
};
