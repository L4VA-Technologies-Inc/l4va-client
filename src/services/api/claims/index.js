import { ClaimsConfigProvider } from '@/services/api/claims/config';
import { axiosInstance } from '@/services/api';

export class ClaimsApiProvider {
  static async getClaims() {
    const response = await axiosInstance.get(ClaimsConfigProvider.getClaims());
    return response;
  }
}
