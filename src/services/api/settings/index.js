import { SettingsConfigProvider } from '@/services/api/settings/config';
import { axiosInstance } from '@/services/api';

export class SettingsApiProvider {
  static async getVlrmFeeSettings() {
    const response = await axiosInstance.get(SettingsConfigProvider.getVlrmFeeSettings());
    return response;
  }
}
