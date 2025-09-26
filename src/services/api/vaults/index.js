import { axiosInstance } from '@/services/api';
import { VaultsConfigProvider } from '@/services/api/vaults/config';
import { formatVaultData } from '@/components/vaults/utils/vaults.utils';

export class VaultsApiProvider {
  static async createVault(vaultData) {
    const response = await axiosInstance.post(VaultsConfigProvider.createVault(), vaultData);
    return response;
  }

  static async getVaults(filters) {
    return await axiosInstance.post(VaultsConfigProvider.getVaults(), filters);
  }

  static async getAcquire() {
    const response = await axiosInstance.get(VaultsConfigProvider.getAcquire());
    return response;
  }

  static async getStatistics() {
    const response = await axiosInstance.get(VaultsConfigProvider.getStatistics());
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

  static async viewVault(vaultId) {
    const response = await axiosInstance.post(VaultsConfigProvider.viewVault(vaultId));
    return response;
  }
}
