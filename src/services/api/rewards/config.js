export class RewardsConfigProvider {
  static widgetSwap() {
    return '/api/v1/rewards/widget-swap';
  }

  // ============================================================================
  // Epoch Endpoints
  // ============================================================================

  static epochs() {
    return '/api/rewards/epochs';
  }

  static currentEpoch() {
    return '/api/rewards/epochs/current';
  }

  static epochDetails(id) {
    return `/api/rewards/epochs/${id}`;
  }

  // ============================================================================
  // Score & History Endpoints
  // ============================================================================

  static walletScore(walletAddress) {
    return `/api/rewards/score/${walletAddress}`;
  }

  static walletHistory(walletAddress) {
    return `/api/rewards/history/${walletAddress}`;
  }

  // ============================================================================
  // Vault Rewards Endpoints
  // ============================================================================

  static vaultScores(vaultId) {
    return `/api/rewards/vault/${vaultId}/scores`;
  }

  static walletVaultReward(walletAddress, vaultId) {
    return `/api/rewards/wallet/${walletAddress}/vault/${vaultId}`;
  }

  static walletVaults(walletAddress) {
    return `/api/rewards/wallet/${walletAddress}/vaults`;
  }

  // ============================================================================
  // Claims Endpoints
  // ============================================================================

  static claimsSummary(walletAddress) {
    return `/api/rewards/claims/${walletAddress}`;
  }

  static claimableAmount(walletAddress) {
    return `/api/rewards/claims/${walletAddress}/claimable`;
  }

  static claimHistory(walletAddress) {
    return `/api/rewards/claims/${walletAddress}/history`;
  }

  static claimTransactions(walletAddress) {
    return `/api/rewards/claims/${walletAddress}/transactions`;
  }

  static submitClaim(walletAddress) {
    return `/api/rewards/claims/${walletAddress}/claim`;
  }

  // ============================================================================
  // Vesting Endpoints
  // ============================================================================

  static vestingSummary(walletAddress) {
    return `/api/rewards/vesting/${walletAddress}`;
  }

  static activeVesting(walletAddress) {
    return `/api/rewards/vesting/${walletAddress}/active`;
  }

  // ============================================================================
  // Weights & Configuration
  // ============================================================================

  static weights() {
    return '/api/rewards/weights';
  }
}
