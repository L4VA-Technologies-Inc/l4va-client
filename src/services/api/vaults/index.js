import { axiosInstance } from '@/services/api';

import { VaultsConfigProvider } from '@/services/api/vaults/config';

export class VaultsApiProvider {
  static async createVault({
    name,
    type,
    privacy,
    brief,
  }) {
    const response = await axiosInstance.post(VaultsConfigProvider.createVault(), {
      name,
      type,
      privacy,
      brief,
    });
    return response;
  }

  static async getVaults() {
    const response = await axiosInstance.get(VaultsConfigProvider.getVaults());
    return response;
  }
}
