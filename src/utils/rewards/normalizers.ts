/**
 * Utility functions for formatting and aggregating rewards data
 *
 * This file only contains formatting and aggregation helpers.
 */

import { format, formatDistanceToNow } from 'date-fns';

// ============================================================================
// Formatting Helpers
// ============================================================================

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
