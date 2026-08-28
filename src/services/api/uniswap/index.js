import { UniswapConfigProvider } from '@/services/api/uniswap/config';
import { axiosInstance } from '@/services/api';

export class UniswapApiProvider {
  static async getConfig() {
    const response = await axiosInstance.get(UniswapConfigProvider.getConfig());
    return response.data;
  }

  static async quote(body) {
    const response = await axiosInstance.post(UniswapConfigProvider.quote(), body);
    return response.data;
  }

  static async checkApproval(body) {
    const response = await axiosInstance.post(UniswapConfigProvider.checkApproval(), body);
    return response.data;
  }

  static async swap(body) {
    const response = await axiosInstance.post(UniswapConfigProvider.swap(), body);
    return response.data;
  }

  static async order(body) {
    const response = await axiosInstance.post(UniswapConfigProvider.order(), body);
    return response.data;
  }
}
