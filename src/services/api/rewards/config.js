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

  static walletScore(walletAddress) {
    return `/api/v1/rewards/score/${walletAddress}`;
  }

  static walletHistory(walletAddress) {
    return `/api/v1/rewards/history/${walletAddress}`;
  }

  // ============================================================================
  // Vault Rewards Endpoints
  // ============================================================================

  static vaultScores(vaultId) {
    return `/api/v1/rewards/vault/${vaultId}/scores`;
  }

  static walletVaultReward(walletAddress, vaultId) {
    return `/api/v1/rewards/wallet/${walletAddress}/vault/${vaultId}`;
  }

  static walletVaults(walletAddress) {
    return `/api/v1/rewards/wallet/${walletAddress}/vaults`;
  }

  // ============================================================================
  // Claims Endpoints
  // ============================================================================

  static claimsSummary(walletAddress) {
    return `/api/v1/rewards/claims/${walletAddress}`;
  }

  static claimableAmount(walletAddress) {
    return `/api/v1/rewards/claims/${walletAddress}/claimable`;
  }

  static claimHistory(walletAddress) {
    return `/api/v1/rewards/claims/${walletAddress}/history`;
  }

  static claimTransactions(walletAddress) {
    return `/api/v1/rewards/claims/${walletAddress}/transactions`;
  }

  static submitClaim(walletAddress) {
    return `/api/v1/rewards/claims/${walletAddress}/claim`;
  }

  // ============================================================================
  // Vesting Endpoints
  // ============================================================================

  static vestingSummary(walletAddress) {
    return `/api/v1/rewards/vesting/${walletAddress}`;
  }

  static activeVesting(walletAddress) {
    return `/api/v1/rewards/vesting/${walletAddress}/active`;
  }

  // ============================================================================
  // Weights & Configuration
  // ============================================================================

  static weights() {
    return '/api/v1/rewards/weights';
  }
}
