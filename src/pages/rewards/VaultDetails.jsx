import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';
import { useState } from 'react';

import { useWalletVaultReward, useVaultScores } from '@/hooks/useRewardsVaults';
import { formatCompactNumber } from '@/utils/core.utils';
import { RewardSourceBadge, VaultLeaderboard, EpochSelector } from '@/components/rewards';

export const VaultDetails = () => {
  const navigate = useNavigate();
  const { vaultId } = useParams({ from: '/rewards/vaults/$vaultId' });
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();
  const [selectedEpochIds, setSelectedEpochIds] = useState([]);

  const activeEpochId = selectedEpochIds.length === 1 ? selectedEpochIds[0] : null;

  const {
    data: vaultRewardData,
    isLoading: isLoadingReward,
    error: rewardError,
  } = useWalletVaultReward(walletAddress, vaultId, activeEpochId);
  const { data: vaultScoresData, isLoading: isLoadingScores } = useVaultScores(vaultId, activeEpochId);

  if (isLoadingReward) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-steel-700 rounded animate-pulse w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-48 bg-steel-850 border border-steel-750 rounded-2xl animate-pulse" />
            <div className="h-64 bg-steel-850 border border-steel-750 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected || !vaultRewardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate({ to: '/rewards/vaults' })}
              className="flex items-center gap-2 text-steel-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Vaults</span>
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Vault Rewards</h1>
            <div className="flex items-center gap-4">
              <p className="text-steel-400 font-mono text-sm">{vaultId}</p>
              {isConnected && <EpochSelector selectedEpochIds={selectedEpochIds} onChange={setSelectedEpochIds} />}
            </div>
          </div>
          <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
            <div className="p-12">
              <div className="text-center text-steel-400">
                {!isConnected && <div>Please connect your wallet</div>}
                {isConnected && !walletAddress && <div>Waiting for wallet address...</div>}
                {isConnected && walletAddress && rewardError && (
                  <div>
                    <div className="text-red-400 mb-2">Error loading vault data</div>
                    <div className="text-sm">{rewardError.message || String(rewardError)}</div>
                  </div>
                )}
                {isConnected &&
                  walletAddress &&
                  !rewardError &&
                  !vaultRewardData &&
                  'No vault data found for the selected epoch'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasCreatorReward = vaultRewardData.creatorReward > 0;
  const hasParticipantReward = vaultRewardData.participantReward > 0;

  // API now returns camelCase - no transformation needed
  const leaderboardScores = vaultScoresData?.participants || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/rewards/vaults' })}
            className="flex items-center gap-2 text-steel-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Vaults</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Vault Rewards</h1>
            {vaultRewardData.role && (
              <div className="flex items-center gap-2">
                {(vaultRewardData.role === 'creator' || vaultRewardData.role === 'both') && (
                  <RewardSourceBadge source="creator" />
                )}
                {(vaultRewardData.role === 'participant' || vaultRewardData.role === 'both') && (
                  <RewardSourceBadge source="participant" />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-steel-400 font-mono text-sm">{vaultId}</p>
            <EpochSelector selectedEpochIds={selectedEpochIds} onChange={setSelectedEpochIds} />
          </div>
        </div>

        {/* Epoch indicator */}
        {vaultRewardData.epochNumber > 0 && (
          <div className="text-sm text-steel-400">
            Showing statistics for{' '}
            <span className="text-orange-400 font-medium">Epoch {vaultRewardData.epochNumber}</span>
          </div>
        )}

        {/* Total Rewards */}
        <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
          <div className="text-sm text-steel-400 mb-2">Total Vault Rewards</div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-orange-400">
              {formatCompactNumber(vaultRewardData.totalReward)}
            </span>
            <span className="text-xl text-steel-500">$L4VA</span>
          </div>
        </div>

        {/* Reward Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Creator Rewards */}
          {hasCreatorReward && (
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <RewardSourceBadge source="creator" />
                <span className="text-sm text-steel-400">Rewards</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {formatCompactNumber(vaultRewardData.creatorReward)}
              </div>
              <div className="text-sm text-steel-500 mt-1">$L4VA</div>
            </div>
          )}

          {/* Participant Rewards */}
          {hasParticipantReward && (
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <RewardSourceBadge source="participant" />
                <span className="text-sm text-steel-400">Rewards</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {formatCompactNumber(vaultRewardData.participantReward)}
              </div>
              <div className="text-sm text-steel-500 mt-1">$L4VA</div>
            </div>
          )}

          {/* Immediate Rewards */}
          {vaultRewardData.immediateReward > 0 && (
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
              <div className="text-sm text-steel-400 mb-2">Immediate</div>
              <div className="text-3xl font-bold text-green-400">
                {formatCompactNumber(vaultRewardData.immediateReward)}
              </div>
              <div className="text-sm text-steel-500 mt-1">$L4VA</div>
            </div>
          )}

          {/* Vested Rewards */}
          {vaultRewardData.vestedReward > 0 && (
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
              <div className="text-sm text-steel-400 mb-2">Vested</div>
              <div className="text-3xl font-bold text-blue-400">
                {formatCompactNumber(vaultRewardData.vestedReward)}
              </div>
              <div className="text-sm text-steel-500 mt-1">$L4VA</div>
            </div>
          )}
        </div>

        {/* Vault Leaderboard */}
        <div className="bg-steel-850 border border-steel-750 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Vault Leaderboard</h2>
          {isLoadingScores ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-steel-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <VaultLeaderboard scores={leaderboardScores} currentWalletAddress={walletAddress} />
          )}
        </div>
      </div>
    </div>
  );
};
