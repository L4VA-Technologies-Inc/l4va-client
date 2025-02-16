import { CoreConfigProvider } from './config';
import { axiosInstance } from '@/services/api';

export class CoreApiProvider {
  static async login({ signature, stakeAddress }) {
    const response = await axiosInstance.post(CoreConfigProvider.login(), {
      signature,
      stakeAddress,
    });
    return response;
  }

  static async getProfile() {
    const response = await axiosInstance.get(CoreConfigProvider.profile());
    return response;
  }
}
