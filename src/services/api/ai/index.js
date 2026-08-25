import { axiosInstance } from '@/services/api';
import { AiConfigProvider } from '@/services/api/ai/config';

const readSseErrorMessage = async response => {
  try {
    const data = await response.json();
    return data?.message ?? 'The assistant is unavailable right now.';
  } catch {
    return 'The assistant is unavailable right now.';
  }
};

export class AiApiProvider {
  static async getVaultCreationSpec({ chain, network }) {
    return await axiosInstance.get(AiConfigProvider.vaultCreationSpec(), { params: { chain, network } });
  }

  static async sendVaultAssistantMessage(payload) {
    return await axiosInstance.post(AiConfigProvider.vaultAssistantMessage(), payload);
  }

  /**
   * Streams the assistant reply over SSE.
   * Calls `onDelta` with each text chunk; resolves with the final `done` payload.
   */
  static async streamVaultAssistantMessage(payload, { onDelta, signal } = {}) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(AiConfigProvider.vaultAssistantMessageStream(), {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const message = await readSseErrorMessage(response);
      throw Object.assign(new Error(message), {
        response: { data: { message } },
      });
    }

    if (!response.body) {
      throw new Error('The assistant is unavailable right now.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let donePayload = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const dataLine = part
          .split('\n')
          .map(line => line.trimEnd())
          .find(line => line.startsWith('data: '));
        if (!dataLine) continue;

        let event;
        try {
          event = JSON.parse(dataLine.slice(6));
        } catch {
          continue;
        }

        if (event.type === 'delta' && typeof event.text === 'string') {
          onDelta?.(event.text);
        } else if (event.type === 'done') {
          const rest = { ...event };
          delete rest.type;
          donePayload = rest;
        } else if (event.type === 'error') {
          throw Object.assign(new Error(event.message || 'The assistant is unavailable right now.'), {
            response: { data: { message: event.message } },
          });
        }
      }
    }

    if (!donePayload) {
      throw new Error('The assistant is unavailable right now.');
    }

    return donePayload;
  }

  static async generateVaultImage(prompt) {
    return await axiosInstance.post(AiConfigProvider.vaultAssistantImage(), { prompt });
  }
}
