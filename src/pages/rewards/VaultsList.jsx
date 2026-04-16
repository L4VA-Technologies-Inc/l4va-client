import { useNavigate } from '@tanstack/react-router';
import { Wallet, Vault, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';
import { useState } from 'react';

import { useWalletVaults } from '@/hooks/useRewardsVaults';
import { formatCompactNumber } from '@/utils/core.utils';
import { RewardSourceBadge } from '@/components/rewards/RewardSourceBadge';
import { VaultsAnalytics } from '@/components/rewards/VaultsAnalytics';
import { EpochSelector } from '@/components/rewards/EpochSelector';
import { Card } from '@/components/ui/card';

export const VaultsList = () => {
  const navigate = useNavigate();
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();
  const [showVaultsList, setShowVaultsList] = useState(false);
  const [selectedEpochIds, setSelectedEpochIds] = useState([]);

  // For the API, we pass a single epochId (first selected) or null for all
  const activeEpochId = selectedEpochIds.length === 1 ? selectedEpochIds[0] : null;

  const { data: vaultsData, isLoading } = useWalletVaults(walletAddress, activeEpochId);
  // Data is already normalized by backend
  const vaults = vaultsData?.vaults || [];
  const totalRewardBeforeCap = vaultsData?.totalRewardBeforeCap || 0;
  const totalFinalReward = vaultsData?.totalFinalReward || 0;
  const wasCapped = vaultsData?.wasCapped || false;
  const capDifference = vaultsData?.capDifference || 0;

  const handleVaultClick = vaultId => {
    navigate({ to: `/rewards/vaults/${vaultId}` });
  };

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Vault Rewards</h1>
          <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
            <div className="p-12">
              <div className="text-center">
                <Wallet className="w-16 h-16 text-steel-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-steel-400">Please connect your wallet to view your vault rewards</p>
              </div>
            </div>
          </div>
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
              <div key={i} className="h-24 bg-steel-850 border border-steel-750 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state - only show if no epoch filter is active (truly no vaults)
  if (vaults.length === 0 && selectedEpochIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Vault Rewards</h1>
          <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
            <div className="p-12">
              <div className="text-center">
                <Vault className="w-16 h-16 text-steel-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">No Vault Rewards</h2>
                <p className="text-steel-400">Participate in vaults to start earning rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/rewards' })}
            className="flex items-center gap-2 text-steel-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rewards Overview</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Vault Rewards</h1>
          <div className="flex items-center gap-4">
            <p className="text-steel-400">View your rewards breakdown by vault participation</p>
            <EpochSelector selectedEpochIds={selectedEpochIds} onChange={setSelectedEpochIds} />
          </div>
        </div>

        {/* Summary */}
        {vaultsData?.epochNumber > 0 && (
          <div className="mb-4 text-sm text-steel-400">
            Showing statistics for <span className="text-orange-400 font-medium">Epoch {vaultsData.epochNumber}</span>
          </div>
        )}

        {vaults.length === 0 && selectedEpochIds.length > 0 ? (
          <div className="bg-steel-850 border border-steel-750 rounded-2xl p-8 mb-6">
            <div className="text-center text-steel-400">No vault rewards found for the selected epoch</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
                <div className="text-sm text-steel-400 mb-1">Total Vaults</div>
                <div className="text-3xl font-bold text-white">{vaults.length}</div>
              </div>
              <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
                <div className="text-sm text-steel-400 mb-1">Vault Rewards (Uncapped)</div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatCompactNumber(totalRewardBeforeCap)} $L4VA
                </div>
                {wasCapped && <div className="text-xs text-steel-500 mt-1">Before 5% cap</div>}
              </div>
              <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
                <div className="text-sm text-steel-400 mb-1">Final Rewards (After Cap)</div>
                <div className="text-3xl font-bold text-orange-400">{formatCompactNumber(totalFinalReward)} $L4VA</div>
                {wasCapped && (
                  <div className="text-xs text-red-400 mt-1">-{formatCompactNumber(capDifference)} capped</div>
                )}
              </div>
            </div>

            {/* Vaults Analytics */}
            {vaults.length > 0 && (
              <div className="mb-6">
                <VaultsAnalytics vaults={vaults} />
              </div>
            )}

            {/* Vaults List Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowVaultsList(!showVaultsList)}
                className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors"
              >
                {showVaultsList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                <span className="font-semibold">
                  {showVaultsList ? 'Hide' : 'Show'} Detailed Vault List ({vaults.length})
                </span>
              </button>
            </div>

            {/* Vaults List */}
            {showVaultsList && (
              <div className="space-y-4">
                {vaults.map(vault => (
                  <div
                    key={vault.vaultId}
                    className="bg-steel-850 border border-steel-750 rounded-2xl p-5 hover:bg-steel-800 transition-colors cursor-pointer"
                    onClick={() => handleVaultClick(vault.vaultId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">
                            {vault.vaultName || `Vault ${vault.vaultId.slice(0, 8)}...`}
                          </h3>
                          <div className="flex items-center gap-2">
                            {(vault.role === 'creator' || vault.role === 'both') && (
                              <RewardSourceBadge source="creator" />
                            )}
                            {(vault.role === 'participant' || vault.role === 'both') && (
                              <RewardSourceBadge source="participant" />
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-steel-500">{vault.vaultId}</div>
                        {vault.epochCount && (
                          <div className="text-xs text-steel-600 mt-1">
                            {vault.epochCount} epoch{vault.epochCount !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400">
                          {formatCompactNumber(vault.totalReward)}
                        </div>
                        <div className="text-sm text-steel-500">$L4VA</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
