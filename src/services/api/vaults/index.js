import { CoreConfigProvider } from './config';
import { axiosInstance } from '@/services/api';

export class VaultsApiProvider {
  static async createVault({ signature, stakeAddress }) {
    const response = await axiosInstance.post(VaultsApiProvider.createVault(), {
      signature,
      stakeAddress,
    });
    return response;
  }
}
