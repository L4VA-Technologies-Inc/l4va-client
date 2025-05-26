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
}
