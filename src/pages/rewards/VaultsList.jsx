import { useNavigate } from '@tanstack/react-router';
import { Wallet, Vault } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useWalletVaults } from '@/hooks/useRewardsVaults';
import { formatCompactNumber } from '@/utils/core.utils';
import { RewardSourceBadge } from '@/components/rewards/RewardSourceBadge';
import { Card } from '@/components/ui/card';

export const VaultsList = () => {
  const navigate = useNavigate();
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();

  const { data: vaultsData, isLoading } = useWalletVaults(walletAddress);
  // Data is already normalized by backend
  const vaults = vaultsData?.vaults || [];

  const handleVaultClick = vaultId => {
    navigate({ to: `/rewards/vaults/${vaultId}` });
  };

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Vault Rewards</h1>
          <Card className="p-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to view your vault rewards</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Vault Rewards</h1>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (vaults.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Vault Rewards</h1>
          <Card className="p-12">
            <div className="text-center">
              <Vault className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No Vault Rewards</h2>
              <p className="text-gray-400">Participate in vaults to start earning rewards</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totalRewards = vaults.reduce((sum, vault) => sum + (vault.totalReward || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vault Rewards</h1>
          <p className="text-gray-400">View your rewards breakdown by vault participation</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-sm text-gray-400 mb-1">Total Vaults</div>
            <div className="text-3xl font-bold text-white">{vaults.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-400 mb-1">Total Vault Rewards</div>
            <div className="text-3xl font-bold text-orange-400">{formatCompactNumber(totalRewards)} $L4VA</div>
          </Card>
        </div>

        {/* Vaults List */}
        <div className="space-y-4">
          {vaults.map(vault => (
            <Card
              key={vault.vaultId}
              className="p-5 hover:bg-gray-800/70 transition-colors cursor-pointer"
              onClick={() => handleVaultClick(vault.vaultId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">
                      {vault.vaultName || `Vault ${vault.vaultId.slice(0, 8)}...`}
                    </h3>
                    <div className="flex items-center gap-2">
                      {vault.isCreator && <RewardSourceBadge source="creator" />}
                      {vault.isParticipant && <RewardSourceBadge source="participant" />}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{vault.vaultId}</div>
                  {vault.epochCount && (
                    <div className="text-xs text-gray-600 mt-1">
                      {vault.epochCount} epoch{vault.epochCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-400">{formatCompactNumber(vault.totalReward)}</div>
                  <div className="text-sm text-gray-500">$L4VA</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
