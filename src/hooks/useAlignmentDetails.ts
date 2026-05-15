import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch alignment bonus details for wallet
 */
export const useAlignmentDetails = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'alignment', walletAddress],
    queryFn: () => RewardsApiProvider.getAlignmentDetails(),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
