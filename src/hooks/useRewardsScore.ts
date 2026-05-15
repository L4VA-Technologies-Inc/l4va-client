import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch wallet score
 */
export const useWalletScore = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'score', walletAddress],
    queryFn: () => RewardsApiProvider.getWalletScore(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Fetch wallet reward history
 */
export const useWalletHistory = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'history', walletAddress],
    queryFn: () => RewardsApiProvider.getWalletHistory(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch wallet vault timeline for cumulative charts
 */
export const useWalletVaultTimeline = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'timeline', 'vaults', walletAddress],
    queryFn: () => RewardsApiProvider.getWalletVaultTimeline(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Fetch wallet activity timeline for cumulative charts
 */
export const useWalletActivityTimeline = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'timeline', 'activities', walletAddress],
    queryFn: () => RewardsApiProvider.getWalletActivityTimeline(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Fetch current epoch reward estimate with confidence indicator
 */
export const useCurrentEpochEstimate = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'current-estimate', walletAddress],
    queryFn: () => RewardsApiProvider.getCurrentEpochEstimate(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes - refresh more frequently for live estimate
    refetchInterval: 1000 * 60 * 3, // Auto-refetch every 3 minutes
  });
};
