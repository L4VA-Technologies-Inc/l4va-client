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

  static async getVaultAssets(id, search = '', page = 1, limit = 10) {
    const response = await axiosInstance.post(VaultsConfigProvider.getVaultAssets(id), { search, page, limit });
    return response;
  }

  static async getVaultAcquiredAssets(id, page = 1, limit = 10) {
    return await axiosInstance.get(VaultsConfigProvider.getVaultAcquiredAssets(id), {
      params: { page, limit },
    });
  }

  static async viewVault(vaultId) {
    const response = await axiosInstance.post(VaultsConfigProvider.viewVault(vaultId));
    return response;
  }

  static async buildBurnTransaction(vaultId) {
    const response = await axiosInstance.post(VaultsConfigProvider.buildBurnTransaction(vaultId));
    return response;
  }

  static async publishBurnTransaction(vaultId, payload) {
    const response = await axiosInstance.post(VaultsConfigProvider.publishBurnTransaction(vaultId), payload);
    return response;
  }

  static async deleteDraft(vaultId) {
    const response = await axiosInstance.delete(VaultsConfigProvider.deleteDraft(vaultId));
    return response;
  }

  static async getVaultTokenStatistics(vaultId) {
    return await axiosInstance.get(VaultsConfigProvider.getVaultTokenStatistics(vaultId));
  }

  static async getMarketStatistics(params = {}) {
    return await axiosInstance.get(VaultsConfigProvider.getMarketStatistics(), {
      params,
    });
  }

  static async getVaultActivity(vaultId, params = {}) {
    return await axiosInstance.get(VaultsConfigProvider.getVaultActivity(vaultId), {
      params,
    });
  }
}
