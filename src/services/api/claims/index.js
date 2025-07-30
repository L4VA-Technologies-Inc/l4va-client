import { ClaimsConfigProvider } from '@/services/api/claims/config';
import { axiosInstance } from '@/services/api';

export class ClaimsApiProvider {
  static async getClaims() {
    const response = await axiosInstance.get(ClaimsConfigProvider.getClaims());
    return response;
  }

  static async receiveClaim(claimId) {
    const response = await axiosInstance.post(ClaimsConfigProvider.receiveClaim(claimId));
    return response;
  }

  static async submitClaim(internalTransactionId, data) {
    const response = await axiosInstance.post(ClaimsConfigProvider.submitClaim(internalTransactionId), data);
    return response;
  }
}
