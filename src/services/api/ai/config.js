export class AiConfigProvider {
  static vaultCreationSpec() {
    return '/api/v1/ai/vault-creation-spec';
  }

  static vaultAssistantMessage() {
    return '/api/v1/ai/vault-assistant/message';
  }

  static vaultAssistantMessageStream() {
    return '/api/v1/ai/vault-assistant/message/stream';
  }

  static vaultAssistantImage() {
    return '/api/v1/ai/vault-assistant/image';
  }
}
