import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch paginated epochs
 */
export const useEpochs = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['rewards', 'epochs', limit, offset],
    queryFn: () => RewardsApiProvider.getEpochs(limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch current epoch
 */
export const useCurrentEpoch = () => {
  return useQuery({
    queryKey: ['rewards', 'epochs', 'current'],
    queryFn: () => RewardsApiProvider.getCurrentEpoch(),
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Fetch epoch details by ID
 */
export const useEpochDetails = (id: string) => {
  return useQuery({
    queryKey: ['rewards', 'epochs', id],
    queryFn: () => RewardsApiProvider.getEpochDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
