import { FaucetConfigProvider } from '@/services/api/faucet/config';
import { axiosInstance } from '@/services/api';

export class FaucetApiProvider {
  static async getStatus() {
    const response = await axiosInstance.get(FaucetConfigProvider.status());
    return response;
  }

  static async claim() {
    const response = await axiosInstance.post(FaucetConfigProvider.claim());
    return response;
  }
}
