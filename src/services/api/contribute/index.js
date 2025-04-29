import { ContributeConfigProvider } from './config';

import { axiosInstance } from '@/services/api';

export class ContributeApiProvider {
  static async createContributionTx({ vaultId, assets }) {
    const response = await axiosInstance.post(ContributeConfigProvider.createTx(vaultId), {
      assets,
    });
    return response;
  }
  static async updateTransactionHash({ txId, txHash }) {
    const response = await axiosInstance.patch(ContributeConfigProvider.updateTx(txId), {
      txHash,
    });
    return response;
  }
}
