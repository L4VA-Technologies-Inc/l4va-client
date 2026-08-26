import { TokensConfigProvider } from '@/services/api/tokens/config';
import { axiosInstance } from '@/services/api';

export class TokensApiProvider {
  static async getMemecoins() {
    const response = await axiosInstance.get(TokensConfigProvider.getMemecoins());
    return response.data;
  }

  static async getMemecoin(id) {
    const response = await axiosInstance.get(TokensConfigProvider.getMemecoin(id));
    return response.data;
  }

  static async getMemecoinOhlc(id, days = 7) {
    const response = await axiosInstance.get(TokensConfigProvider.getMemecoinOhlc(id), {
      params: { days },
    });
    return response.data;
  }

  static async getCardanoMemecoins() {
    const response = await axiosInstance.get(TokensConfigProvider.getCardanoMemecoins());
    return response.data;
  }

  static async getCardanoMemecoin(id) {
    const response = await axiosInstance.get(TokensConfigProvider.getCardanoMemecoin(id));
    return response.data;
  }

  static async getCardanoMemecoinOhlc(id, days = 7) {
    const response = await axiosInstance.get(TokensConfigProvider.getCardanoMemecoinOhlc(id), {
      params: { days },
    });
    return response.data;
  }

  static async getRobinhoodMemecoins() {
    const response = await axiosInstance.get(TokensConfigProvider.getRobinhoodMemecoins());
    return response.data;
  }

  static async getRobinhoodRwas() {
    const response = await axiosInstance.get(TokensConfigProvider.getRobinhoodRwas());
    return response.data;
  }

  static async getRobinhoodNfts() {
    const response = await axiosInstance.get(TokensConfigProvider.getRobinhoodNfts());
    return response.data;
  }

  static async getRobinhoodToken(address) {
    const response = await axiosInstance.get(TokensConfigProvider.getRobinhoodToken(address));
    return response.data;
  }

  static async getRobinhoodTokenOhlc(address, days = 7) {
    const response = await axiosInstance.get(TokensConfigProvider.getRobinhoodTokenOhlc(address), {
      params: { days },
    });
    return response.data;
  }

  static async getRobinhoodTokenTrades(address, limit = 40) {
    const response = await axiosInstance.get(TokensConfigProvider.getRobinhoodTokenTrades(address), {
      params: { limit },
    });
    return response.data;
  }
}
