import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch wallet score
 */
export const useWalletScore = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'score', walletAddress],
    queryFn: () => RewardsApiProvider.getWalletScore(walletAddress),
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
    queryFn: () => RewardsApiProvider.getWalletHistory(walletAddress),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
