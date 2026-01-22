export class ClaimsConfigProvider {
  static getClaims() {
    return `/api/v1/claims/my`;
  }

  static receiveClaim(claimId) {
    return `/api/v1/claims/${claimId}/build`;
  }

  static submitClaim(internalTransactionId) {
    return `/api/v1/claims/${internalTransactionId}/submit`;
  }

  // Termination Claims
  static getTerminationStatus(vaultId) {
    return `/api/v1/termination/vaults/${vaultId}/status`;
  }

  static buildTerminationClaim(claimId) {
    return `/api/v1/termination/claims/${claimId}/build`;
  }

  static submitTerminationClaim(transactionId) {
    return `/api/v1/termination/claims/${transactionId}/submit`;
  }
}
