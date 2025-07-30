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
}
