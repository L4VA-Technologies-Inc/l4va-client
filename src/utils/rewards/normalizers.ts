/**
 * Utility functions for normalizing and transforming rewards data
 */

import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

// ============================================================================
// Epoch Normalizers
// ============================================================================

export const normalizeEpoch = (epoch: any) => {
  if (!epoch) return null;

  return {
    ...epoch,
    startDate: new Date(epoch.startDate),
    endDate: new Date(epoch.endDate),
    isActive: epoch.status === 'active',
    isProcessing: epoch.status === 'processing',
    isFinalized: epoch.status === 'finalized',
  };
};

export const normalizeEpochs = (epochs: any[]) => {
  if (!Array.isArray(epochs)) return [];
  return epochs.map(normalizeEpoch);
};

// ============================================================================
// Rewards Normalizers
// ============================================================================

export const normalizeRewardHistory = (history: any[]) => {
  if (!Array.isArray(history)) return [];

  return history.map(item => ({
    ...item,
    epoch: item.epoch ? normalizeEpoch(item.epoch) : null,
    hasVestedReward: item.vestedReward > 0,
    hasImmediateReward: item.immediateReward > 0,
    rewardSplit: {
      immediate: item.immediateReward || 0,
      vested: item.vestedReward || 0,
      immediatePercentage: item.totalReward > 0 ? (item.immediateReward / item.totalReward) * 100 : 0,
      vestedPercentage: item.totalReward > 0 ? (item.vestedReward / item.totalReward) * 100 : 0,
    },
  }));
};

// ============================================================================
// Claims Normalizers
// ============================================================================

export const normalizeClaimHistory = (claims: any[]) => {
  if (!Array.isArray(claims)) return [];

  return claims.map(claim => ({
    ...claim,
    claimedAt: new Date(claim.claimedAt),
    isPending: claim.status === 'pending',
    isConfirmed: claim.status === 'confirmed',
    isFailed: claim.status === 'failed',
  }));
};

export const normalizeClaimTransactions = (transactions: any[]) => {
  if (!Array.isArray(transactions)) return [];

  return transactions.map(tx => ({
    ...tx,
    createdAt: new Date(tx.createdAt),
    confirmedAt: tx.confirmedAt ? new Date(tx.confirmedAt) : null,
    failedAt: tx.failedAt ? new Date(tx.failedAt) : null,
    isPending: tx.status === 'pending',
    isConfirmed: tx.status === 'confirmed',
    isFailed: tx.status === 'failed',
  }));
};

// ============================================================================
// Vesting Normalizers
// ============================================================================

export const normalizeVestingPosition = (position: any) => {
  if (!position) return null;

  const startDate = new Date(position.startDate);
  const endDate = new Date(position.endDate);
  const now = new Date();

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progressPercentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  return {
    ...position,
    startDate,
    endDate,
    unlockDate: position.unlockDate ? new Date(position.unlockDate) : null,
    isActive: position.status === 'active',
    isCompleted: position.status === 'completed',
    isExpired: position.status === 'expired',
    hasStarted: isPast(startDate),
    hasEnded: isPast(endDate),
    isUpcoming: isFuture(startDate),
    progressPercentage,
    daysUntilUnlock: position.unlockDate
      ? Math.max(0, Math.ceil((new Date(position.unlockDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null,
  };
};

export const normalizeVestingPositions = (positions: any[]) => {
  if (!Array.isArray(positions)) return [];
  return positions.map(normalizeVestingPosition);
};

export const normalizeVestingSummary = (summary: any) => {
  if (!summary) return null;

  return {
    ...summary,
    nextUnlock: summary.nextUnlock
      ? {
          ...summary.nextUnlock,
          date: new Date(summary.nextUnlock.date),
          daysUntil: Math.max(
            0,
            Math.ceil((new Date(summary.nextUnlock.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          ),
        }
      : null,
    hasVestedRewards: summary.totalVested > 0,
    hasLockedRewards: summary.totalLocked > 0,
    hasUnlockedRewards: summary.totalUnlocked > 0,
    lockedPercentage: summary.totalVested > 0 ? (summary.totalLocked / summary.totalVested) * 100 : 0,
    unlockedPercentage: summary.totalVested > 0 ? (summary.totalUnlocked / summary.totalVested) * 100 : 0,
  };
};

// ============================================================================
// Vault Rewards Normalizers
// ============================================================================

export const normalizeWalletVaults = (vaultsData: any) => {
  if (!vaultsData || !vaultsData.vaults) return { walletAddress: '', vaults: [] };

  return {
    ...vaultsData,
    vaults: vaultsData.vaults.map((vault: any) => ({
      ...vault,
      isCreator: vault.role === 'creator' || vault.role === 'both',
      isParticipant: vault.role === 'participant' || vault.role === 'both',
      hasBothRoles: vault.role === 'both',
    })),
  };
};

// ============================================================================
// Formatting Helpers
// ============================================================================

export const formatRewardAmount = (amount: number, decimals = 2) => {
  if (!amount || amount === 0) return '0';
  if (amount < 0.01) return '< 0.01';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (date: Date | string, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, formatStr);
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate, 'MMM dd')} - ${formatDate(endDate, 'MMM dd, yyyy')}`;
};

export const formatTimeAgo = (date: Date | string) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatPercentage = (value: number, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// ============================================================================
// Aggregation Helpers
// ============================================================================

export const calculateTotalRewards = (history: any[]) => {
  if (!Array.isArray(history)) return 0;
  return history.reduce((sum, item) => sum + (item.totalReward || 0), 0);
};

export const calculateTotalClaimable = (claimsData: any) => {
  if (!claimsData) return 0;
  return claimsData.totalClaimable || claimsData.claimableAmount || 0;
};

export const groupVestingByEpoch = (positions: any[]) => {
  if (!Array.isArray(positions)) return {};

  return positions.reduce((groups, position) => {
    const key = position.epochId || 'unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(position);
    return groups;
  }, {});
};

export const groupVestingByVault = (positions: any[]) => {
  if (!Array.isArray(positions)) return {};

  return positions.reduce((groups, position) => {
    const key = position.vaultId || 'unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(position);
    return groups;
  }, {});
};
