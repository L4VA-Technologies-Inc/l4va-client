import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch vesting summary for wallet
 */
export const useVestingSummary = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'vesting', walletAddress, 'summary'],
    queryFn: () => RewardsApiProvider.getVestingSummary(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Fetch active vesting positions for wallet
 */
export const useActiveVesting = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'vesting', walletAddress, 'active'],
    queryFn: () => RewardsApiProvider.getActiveVesting(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
