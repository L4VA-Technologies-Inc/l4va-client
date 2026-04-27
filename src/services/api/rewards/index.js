import { axiosInstance } from '@/services/api';
import { RewardsConfigProvider } from '@/services/api/rewards/config';

export class RewardsApiProvider {
  // ============================================================================
  // Legacy Widget Endpoint
  // ============================================================================

  static async trackWidgetSwap(payload) {
    return await axiosInstance.post(RewardsConfigProvider.widgetSwap(), payload);
  }

  // ============================================================================
  // Epoch Methods
  // ============================================================================

  /**
   * Get all epochs
   * @returns {Promise<Array>} List of all epochs
   */
  static async getEpochs() {
    const response = await axiosInstance.get(RewardsConfigProvider.epochs());
    return response.data;
  }

  /**
   * Get current active epoch
   * @returns {Promise<Object>} Current epoch details
   */
  static async getCurrentEpoch() {
    const response = await axiosInstance.get(RewardsConfigProvider.currentEpoch());
    return response.data;
  }

  /**
   * Get epoch details by ID
   * @param {string} id - Epoch ID
   * @returns {Promise<Object>} Epoch details
   */
  static async getEpochDetails(id) {
    const response = await axiosInstance.get(RewardsConfigProvider.epochDetails(id));
    return response.data;
  }

  // ============================================================================
  // Score & History Methods
  // ============================================================================

  /**
   * Get wallet score (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Wallet score details
   */
  static async getWalletScore() {
    const response = await axiosInstance.get(RewardsConfigProvider.walletScore());
    return response.data;
  }

  /**
   * Get alignment bonus details for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Alignment bonus breakdown
   */
  static async getAlignmentDetails() {
    const response = await axiosInstance.get(RewardsConfigProvider.alignmentDetails());
    return response.data;
  }

  /**
   * Get wallet reward history (uses authenticated wallet from JWT)
   * @returns {Promise<Array>} Reward history
   */
  static async getWalletHistory() {
    const response = await axiosInstance.get(RewardsConfigProvider.walletHistory());
    return response.data;
  }

  // ============================================================================
  // Vault Rewards Methods
  // ============================================================================

  /**
   * Get vault scores/leaderboard
   * @param {string} vaultId - Vault ID
   * @returns {Promise<Array>} Vault scores
   */
  static async getVaultScores(vaultId, epochId) {
    const params = epochId ? { epochId } : {};
    const response = await axiosInstance.get(RewardsConfigProvider.vaultScores(vaultId), { params });
    return response.data;
  }

  /**
   * Get wallet rewards for specific vault (uses authenticated wallet from JWT)
   * @param {string} vaultId - Vault ID
   * @param {string} [epochId] - Optional epoch ID
   * @returns {Promise<Object>} Wallet vault reward details
   */
  static async getWalletVaultReward(vaultId, epochId) {
    const params = epochId ? { epochId } : {};
    const response = await axiosInstance.get(RewardsConfigProvider.walletVaultReward(vaultId), {
      params,
    });
    return response.data;
  }

  /**
   * Get all vaults associated with wallet rewards (uses authenticated wallet from JWT)
   * @param {string} [epochId] - Optional epoch ID
   * @returns {Promise<Object>} Wallet vaults with rewards
   */
  static async getWalletVaults(epochId) {
    const params = epochId ? { epochId } : {};
    const response = await axiosInstance.get(RewardsConfigProvider.walletVaults(), { params });
    return response.data;
  }

  /**
   * Get per-epoch per-vault reward timeline for cumulative charts (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Vault timeline data
   */
  static async getWalletVaultTimeline() {
    const response = await axiosInstance.get(RewardsConfigProvider.walletVaultTimeline());
    return response.data;
  }

  /**
   * Get per-epoch per-activity reward timeline for cumulative charts (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Activity timeline data
   */
  static async getWalletActivityTimeline() {
    const response = await axiosInstance.get(RewardsConfigProvider.walletActivityTimeline());
    return response.data;
  }

  /**
   * Get current epoch reward estimate with confidence indicator (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Estimate with confidence level
   */
  static async getCurrentEpochEstimate() {
    const response = await axiosInstance.get(RewardsConfigProvider.currentEpochEstimate());
    return response.data;
  }

  // ============================================================================
  // Claims Methods
  // ============================================================================

  /**
   * Get claims summary for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Claims summary
   */
  static async getClaimsSummary() {
    const response = await axiosInstance.get(RewardsConfigProvider.claimsSummary());
    return response.data;
  }

  /**
   * Get claimable amount for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Claimable amount details
   */
  static async getClaimableAmount() {
    const response = await axiosInstance.get(RewardsConfigProvider.claimableAmount());
    return response.data;
  }

  /**
   * Get claim history for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Array>} Claim history
   */
  static async getClaimHistory() {
    const response = await axiosInstance.get(RewardsConfigProvider.claimHistory());
    return response.data;
  }

  /**
   * Get claim transactions for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Array>} Claim transactions
   */
  static async getClaimTransactions() {
    const response = await axiosInstance.get(RewardsConfigProvider.claimTransactions());
    return response.data;
  }

  /**
   * Build and submit a claim transaction (complete flow)
   * This builds the transaction, signs it server-side, and submits to blockchain.
   * Uses authenticated wallet from JWT.
   *
   * @param {Object} options - Claim options (epochIds, claimImmediate, claimVested)
   * @returns {Promise<Object>} Transaction hash and claim details
   */
  static async buildClaimTransaction(options = {}) {
    const response = await axiosInstance.post(RewardsConfigProvider.buildClaim(), options);
    return response.data;
  }

  // ============================================================================
  // Vesting Methods
  // ============================================================================

  /**
   * Get vesting summary for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Object>} Vesting summary
   */
  static async getVestingSummary() {
    const response = await axiosInstance.get(RewardsConfigProvider.vestingSummary());
    return response.data;
  }

  /**
   * Get active vesting positions for wallet (uses authenticated wallet from JWT)
   * @returns {Promise<Array>} Active vesting positions
   */
  static async getActiveVesting() {
    const response = await axiosInstance.get(RewardsConfigProvider.activeVesting());
    return response.data;
  }
}
