import { axiosInstance } from '@/services/api';
import { VaultsConfigProvider } from '@/services/api/vaults/config';
import { formatVaultData } from '@/components/vaults/utils/vaults.utils';

export class VaultsApiProvider {
  static async createVault(vaultData) {
    const response = await axiosInstance.post(VaultsConfigProvider.createVault(), vaultData);
    return response;
  }

  static async getVaults(tab) {
    const response = await axiosInstance.get(VaultsConfigProvider.getVaults(tab));
    return response;
  }

  static async getMyDraftVaults() {
    const response = await axiosInstance.get(VaultsConfigProvider.getMyDraftVaults());
    return response;
  }

  static async getMyOpenVaults() {
    const response = await axiosInstance.get(VaultsConfigProvider.getMyOpenVaults());
    return response;
  }

  static async getMyLockedVaults() {
    const response = await axiosInstance.get(VaultsConfigProvider.getMyLockedVaults());
    return response;
  }

  static async saveDraft(vaultData) {
    const formatted = formatVaultData(vaultData);
    const response = await axiosInstance.post(VaultsConfigProvider.saveDraft(), formatted);
    return response;
  }

  static async launchVault(vaultData) {
    const response = await axiosInstance.post(VaultsConfigProvider.launchVault(), vaultData);
    return response;
  }

  static async getVault(id) {
    const response = await axiosInstance.get(VaultsConfigProvider.getVault(id));
    return response;
  }

  static async getVaultAssets(id) {
    const response = await axiosInstance.get(VaultsConfigProvider.getVaultAssets(id));
    return response;
  }

  static async getVaultAcquiredAssets(id) {
    const response = await axiosInstance.get(VaultsConfigProvider.getVaultAcquiredAssets(id));
    return response;
  }
}
