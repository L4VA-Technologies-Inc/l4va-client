export class RewardsConfigProvider {
  static widgetSwap() {
    return '/api/v1/rewards/widget-swap';
  }

  // ============================================================================
  // Epoch Endpoints
  // ============================================================================

  static epochs() {
    return '/api/v1/rewards/epochs';
  }

  static currentEpoch() {
    return '/api/v1/rewards/epochs/current';
  }

  static epochDetails(id) {
    return `/api/v1/rewards/epochs/${id}`;
  }

  // ============================================================================
  // Score & History Endpoints
  // ============================================================================

  static walletScore() {
    return '/api/v1/rewards/me/score';
  }

  static alignmentDetails() {
    return '/api/v1/rewards/me/alignment';
  }

  static walletHistory() {
    return '/api/v1/rewards/me/history';
  }

  // ============================================================================
  // Vault Rewards Endpoints
  // ============================================================================

  static vaultScores(vaultId) {
    return `/api/v1/rewards/vault/${vaultId}/scores`;
  }

  static walletVaultReward(vaultId) {
    return `/api/v1/rewards/me/vault/${vaultId}`;
  }

  static walletVaults() {
    return '/api/v1/rewards/me/vaults';
  }

  static walletVaultTimeline() {
    return '/api/v1/rewards/me/timeline/vaults';
  }

  static walletActivityTimeline() {
    return '/api/v1/rewards/me/timeline/activities';
  }

  static currentEpochEstimate() {
    return '/api/v1/rewards/me/current-estimate';
  }

  // ============================================================================
  // Claims Endpoints
  // ============================================================================

  static claimsSummary() {
    return '/api/v1/rewards/me/claims';
  }

  static claimableAmount() {
    return '/api/v1/rewards/me/claims/claimable';
  }

  static claimHistory() {
    return '/api/v1/rewards/me/claims/history';
  }

  static claimTransactions() {
    return '/api/v1/rewards/me/claims/transactions';
  }

  static buildClaim() {
    return '/api/v1/rewards/me/claims/build';
  }

  static prepareClaim() {
    return '/api/v1/rewards/me/claims/prepare';
  }

  static submitClaim() {
    return '/api/v1/rewards/me/claims/submit';
  }

  static cancelClaim() {
    return '/api/v1/rewards/me/claims/cancel';
  }

  // ============================================================================
  // Vesting Endpoints
  // ============================================================================

  static vestingSummary() {
    return '/api/v1/rewards/me/vesting';
  }

  static activeVesting() {
    return '/api/v1/rewards/me/vesting/active';
  }
}
