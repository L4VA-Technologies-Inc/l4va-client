import { axiosInstance } from '@/services/api';
import { RewardsConfigProvider } from '@/services/api/rewards/config';

export class RewardsApiProvider {
  static async trackWidgetSwap(payload) {
    return await axiosInstance.post(RewardsConfigProvider.widgetSwap(), payload);
  }
}
