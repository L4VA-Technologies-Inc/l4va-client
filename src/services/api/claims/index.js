import { ClaimsConfigProvider } from '@/services/api/claims/config';
import { axiosInstance } from '@/services/api';

export class ClaimsApiProvider {
  static async getClaims(params = {}) {
    const response = await axiosInstance.get(ClaimsConfigProvider.getClaims(), { params });
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

  // Termination Claims
  static async getTerminationStatus(vaultId) {
    const response = await axiosInstance.get(ClaimsConfigProvider.getTerminationStatus(vaultId));
    return response;
  }

  static async buildTerminationClaim(claimId) {
    const response = await axiosInstance.post(ClaimsConfigProvider.buildTerminationClaim(claimId));
    return response;
  }

  static async submitTerminationClaim(params) {
    const response = await axiosInstance.post(ClaimsConfigProvider.submitTerminationClaim(params.txId), params);
    return response;
  }
}
