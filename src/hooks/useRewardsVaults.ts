import { useQuery } from '@tanstack/react-query';

import { RewardsApiProvider } from '@/services/api/rewards';

/**
 * Fetch vault scores/leaderboard
 */
export const useVaultScores = (vaultId: string, epochId?: string | null) => {
  return useQuery({
    queryKey: ['rewards', 'vault', vaultId, 'scores', epochId ?? null],
    queryFn: () => RewardsApiProvider.getVaultScores(vaultId, epochId || undefined),
    enabled: !!vaultId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch wallet rewards for a specific vault
 */
export const useWalletVaultReward = (walletAddress: string, vaultId: string, epochId?: string | null) => {
  return useQuery({
    queryKey: ['rewards', 'wallet', walletAddress, 'vault', vaultId, epochId ?? null],
    queryFn: () => RewardsApiProvider.getWalletVaultReward(walletAddress, vaultId, epochId || undefined),
    enabled: !!walletAddress && !!vaultId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch all vaults associated with wallet rewards
 */
export const useWalletVaults = (walletAddress: string, epochId?: string | null) => {
  return useQuery({
    queryKey: ['rewards', 'wallet', walletAddress, 'vaults', epochId ?? null],
    queryFn: () => RewardsApiProvider.getWalletVaults(walletAddress, epochId || undefined),
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
