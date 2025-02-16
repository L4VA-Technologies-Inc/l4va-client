import { axiosInstance } from '@/services/api';

import { VaultsConfigProvider } from '@/services/api/vaults/config';

export class VaultsApiProvider {
  static async createVault({
    name,
    type,
    privacy,
    description,
  }) {
    const response = await axiosInstance.post(VaultsConfigProvider.createVault(), {
      name,
      type,
      privacy,
      description,
    });
    return response;
  }

  static async getVaults() {
    const response = await axiosInstance.get(VaultsConfigProvider.getVaults());
    return response;
  }
}
