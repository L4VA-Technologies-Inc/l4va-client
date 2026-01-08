import { TapToolsConfigProvider } from '@/services/api/taptools/config';
import { axiosInstance } from '@/services/api';

export class TapToolsApiProvider {
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
