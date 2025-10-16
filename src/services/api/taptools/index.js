import { TapToolsConfigProvider } from '@/services/api/taptools/config';
import { axiosInstance } from '@/services/api';

export class TapToolsApiProvider {
  static async getWalletAssetAmount(assetId, address) {
    return await axiosInstance.get(TapToolsConfigProvider.getWalletAssetAmount(assetId, address));
  }

  static async getWalletPolicyIds(address) {
    return await axiosInstance.get(TapToolsConfigProvider.getWalletPolicyIds(address));
  }

  static async getWalletSummaryPaginated({ address, page, limit, filter, whitelistedPolicies }) {
    return await axiosInstance.post(TapToolsConfigProvider.getWalletSummaryPaginated(), {
      address,
      page,
      limit,
      filter,
      whitelistedPolicies,
    });
  }
}
