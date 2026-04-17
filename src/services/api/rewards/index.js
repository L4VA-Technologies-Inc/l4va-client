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
   * Get wallet score
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Wallet score details
   */
  static async getWalletScore(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.walletScore(walletAddress));
    return response.data;
  }

  /**
   * Get wallet reward history
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Array>} Reward history
   */
  static async getWalletHistory(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.walletHistory(walletAddress));
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
   * Get wallet rewards for specific vault
   * @param {string} walletAddress - Wallet address
   * @param {string} vaultId - Vault ID
   * @returns {Promise<Object>} Wallet vault reward details
   */
  static async getWalletVaultReward(walletAddress, vaultId, epochId) {
    const params = epochId ? { epochId } : {};
    const response = await axiosInstance.get(RewardsConfigProvider.walletVaultReward(walletAddress, vaultId), {
      params,
    });
    return response.data;
  }

  /**
   * Get all vaults associated with wallet rewards
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Wallet vaults with rewards
   */
  static async getWalletVaults(walletAddress, epochId) {
    const params = epochId ? { epochId } : {};
    const response = await axiosInstance.get(RewardsConfigProvider.walletVaults(walletAddress), { params });
    return response.data;
  }

  /**
   * Get per-epoch per-vault reward timeline for cumulative charts
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Vault timeline data
   */
  static async getWalletVaultTimeline(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.walletVaultTimeline(walletAddress));
    return response.data;
  }

  /**
   * Get per-epoch per-activity reward timeline for cumulative charts
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Activity timeline data
   */
  static async getWalletActivityTimeline(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.walletActivityTimeline(walletAddress));
    return response.data;
  }

  // ============================================================================
  // Claims Methods
  // ============================================================================

  /**
   * Get claims summary for wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Claims summary
   */
  static async getClaimsSummary(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.claimsSummary(walletAddress));
    return response.data;
  }

  /**
   * Get claimable amount for wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Claimable amount details
   */
  static async getClaimableAmount(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.claimableAmount(walletAddress));
    return response.data;
  }

  /**
   * Get claim history for wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Array>} Claim history
   */
  static async getClaimHistory(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.claimHistory(walletAddress));
    return response.data;
  }

  /**
   * Get claim transactions for wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Array>} Claim transactions
   */
  static async getClaimTransactions(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.claimTransactions(walletAddress));
    return response.data;
  }

  /**
   * Submit a claim request
   * @param {string} walletAddress - Wallet address
   * @param {Object} payload - Claim payload with signature
   * @returns {Promise<Object>} Claim response
   */
  static async submitClaim(walletAddress, payload = {}) {
    const response = await axiosInstance.post(RewardsConfigProvider.submitClaim(walletAddress), payload);
    return response.data;
  }

  /**
   * Build and submit a claim transaction (complete flow)
   * This builds the transaction, signs it server-side, and submits to blockchain.
   *
   * @param {string} walletAddress - Wallet address
   * @param {Object} options - Claim options (epochIds, claimImmediate, claimVested)
   * @returns {Promise<Object>} Transaction hash and claim details
   */
  static async buildClaimTransaction(walletAddress, options = {}) {
    const response = await axiosInstance.post(RewardsConfigProvider.buildClaim(walletAddress), options);
    return response.data;
  }

  // ============================================================================
  // Vesting Methods
  // ============================================================================

  /**
   * Get vesting summary for wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object>} Vesting summary
   */
  static async getVestingSummary(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.vestingSummary(walletAddress));
    return response.data;
  }

  /**
   * Get active vesting positions for wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Array>} Active vesting positions
   */
  static async getActiveVesting(walletAddress) {
    const response = await axiosInstance.get(RewardsConfigProvider.activeVesting(walletAddress));
    return response.data;
  }
}
