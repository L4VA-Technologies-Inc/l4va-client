import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch all epochs
 */
export const useEpochs = () => {
  return useQuery({
    queryKey: ['rewards', 'epochs'],
    queryFn: () => RewardsApiProvider.getEpochs(),
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
