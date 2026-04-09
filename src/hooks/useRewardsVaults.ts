import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch vault scores/leaderboard
 */
export const useVaultScores = (vaultId: string) => {
  return useQuery({
    queryKey: ['rewards', 'vault', vaultId, 'scores'],
    queryFn: () => RewardsApiProvider.getVaultScores(vaultId),
    enabled: !!vaultId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch wallet rewards for a specific vault
 */
export const useWalletVaultReward = (walletAddress: string, vaultId: string) => {
  return useQuery({
    queryKey: ['rewards', 'wallet', walletAddress, 'vault', vaultId],
    queryFn: () => RewardsApiProvider.getWalletVaultReward(walletAddress, vaultId),
    enabled: !!walletAddress && !!vaultId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch all vaults associated with wallet rewards
 */
export const useWalletVaults = (walletAddress: string) => {
  return useQuery({
    queryKey: ['rewards', 'wallet', walletAddress, 'vaults'],
    queryFn: () => RewardsApiProvider.getWalletVaults(walletAddress),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
