import { TapToolsConfigProvider } from './config';

import { axiosInstance } from '@/services/api';

export class TapToolsApiProvider {
  static async getWalletSummary(address) {
    const response = await axiosInstance.get(TapToolsConfigProvider.getWalletSummary(address));
    return response;
  }
}
