import { axiosInstance } from '@/services/api';
import { AiConfigProvider } from '@/services/api/ai/config';

export class AiApiProvider {
  static async getVaultCreationSpec({ chain, network }) {
    return await axiosInstance.get(AiConfigProvider.vaultCreationSpec(), { params: { chain, network } });
  }

  static async sendVaultAssistantMessage(payload) {
    return await axiosInstance.post(AiConfigProvider.vaultAssistantMessage(), payload);
  }

  static async generateVaultImage(prompt) {
    return await axiosInstance.post(AiConfigProvider.vaultAssistantImage(), { prompt });
  }
}
