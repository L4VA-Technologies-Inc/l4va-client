import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch claims summary for wallet
 */
export const useClaimsSummary = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'claims', walletAddress, 'summary'],
    queryFn: () => RewardsApiProvider.getClaimsSummary(walletAddress),
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
    queryFn: () => RewardsApiProvider.getClaimableAmount(walletAddress),
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
    queryFn: () => RewardsApiProvider.getClaimHistory(walletAddress),
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
    queryFn: () => RewardsApiProvider.getClaimTransactions(walletAddress),
    enabled: !!walletAddress,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Submit a claim request
 */
export const useSubmitClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletAddress, payload }: { walletAddress: string; payload: any }) =>
      RewardsApiProvider.submitClaim(walletAddress, payload),
    onSuccess: (data, variables) => {
      // Invalidate all claim-related queries for the wallet
      queryClient.invalidateQueries({
        queryKey: ['rewards', 'claims', variables.walletAddress],
      });

      // Invalidate vesting queries as they may be affected
      queryClient.invalidateQueries({
        queryKey: ['rewards', 'vesting', variables.walletAddress],
      });

      // Invalidate rewards summary/history
      queryClient.invalidateQueries({
        queryKey: ['rewards', 'history', variables.walletAddress],
      });
    },
  });
};
