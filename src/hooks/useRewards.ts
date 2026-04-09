/**
 * Centralized export for all rewards-related React Query hooks
 */

// Epoch hooks
export { useEpochs, useCurrentEpoch, useEpochDetails } from './useRewardsEpochs';

// Score and history hooks
export { useWalletScore, useWalletHistory } from './useRewardsScore';

// Vault rewards hooks
export { useVaultScores, useWalletVaultReward, useWalletVaults } from './useRewardsVaults';

// Claims hooks
export {
  useClaimsSummary,
  useClaimableAmount,
  useClaimHistory,
  useClaimTransactions,
  useSubmitClaim,
} from './useRewardsClaims';

// Vesting hooks
export { useVestingSummary, useActiveVesting } from './useRewardsVesting';
