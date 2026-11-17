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
 * Robinhood wallets: claim arguments and on-chain claimable amount from the
 * L4VARewardsDistributor contract. `data` is null while the distributor is not
 * configured on the backend (409) — callers then fall back to the old flow.
 */
export const useEvmDistributorClaim = (walletAddress: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['rewards', 'claims', walletAddress, 'evm-distributor'],
    queryFn: async () => {
      try {
        return await RewardsApiProvider.getEvmDistributorClaim();
      } catch (error: unknown) {
        if ((error as { response?: { status?: number } })?.response?.status === 409) return null;
        throw error;
      }
    },
    enabled: !!walletAddress && enabled,
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
