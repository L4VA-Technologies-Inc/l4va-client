import { TransactionsConfigProvider } from '@/services/api/transactions/config';
import { axiosInstance } from '@/services/api';

export class TransactionsApiProvider {
  static async buildTransaction(params) {
    const response = await axiosInstance.post(TransactionsConfigProvider.buildTransaction(), params);
    return response;
  }

  static async submitTransaction(params) {
    const response = await axiosInstance.post(TransactionsConfigProvider.submitTransaction(), params);
    return response;
  }

  static async getWaitingOwnerTransactions() {
    const response = await axiosInstance.get(TransactionsConfigProvider.waitingOwnerTransactions());
    return response;
  }

  static async generateUpdateTransaction(txId) {
    const response = await axiosInstance.post(TransactionsConfigProvider.generateUpdateTransaction(txId));
    return response;
  }

  static async submitSignedTransaction(txId, signedTx) {
    const response = await axiosInstance.post(TransactionsConfigProvider.submitSignedTransaction(txId), { signedTx });
    return response;
  }
}
