import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch claims summary for wallet
 */
export const useClaimsSummary = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'claims', walletAddress, 'summary'],
    queryFn: () => RewardsApiProvider.getClaimsSummary(),
    enabled: !!walletAddress,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Fetch claimable amount for wallet
 */
export const useClaimableAmount = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'claims', walletAddress, 'claimable'],
    queryFn: () => RewardsApiProvider.getClaimableAmount(),
    enabled: !!walletAddress,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Fetch claim history for wallet
 */
export const useClaimHistory = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'claims', walletAddress, 'history'],
    queryFn: () => RewardsApiProvider.getClaimHistory(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Fetch claim transactions for wallet
 */
export const useClaimTransactions = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'claims', walletAddress, 'transactions'],
    queryFn: () => RewardsApiProvider.getClaimTransactions(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60, // 1 minute
  });
};
