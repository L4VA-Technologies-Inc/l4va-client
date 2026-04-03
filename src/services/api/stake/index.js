import { StakeConfigProvider } from '@/services/api/stake/config';
import { axiosInstance } from '@/services/api';

export class StakeApiProvider {
  static async buildStake(params) {
    const response = await axiosInstance.post(StakeConfigProvider.buildStake(), params);
    return response;
  }

  static async buildUnstake(params) {
    const response = await axiosInstance.post(StakeConfigProvider.buildUnstake(), params);
    return response;
  }

  static async submit(params) {
    const response = await axiosInstance.post(StakeConfigProvider.submit(), params);
    return response;
  }

  static async getMyStakedBalance() {
    const response = await axiosInstance.get(StakeConfigProvider.getBalance());
    return response;
  }
}
