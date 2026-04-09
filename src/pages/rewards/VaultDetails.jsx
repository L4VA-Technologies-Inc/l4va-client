import { useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { useWallet } from '@/lib/contexts/wallet.context';
import { useWalletVaultReward, useVaultScores } from '@/hooks/useRewardsVaults';
import { formatRewardAmount } from '@/utils/rewards/normalizers';
import { RewardSourceBadge } from '@/components/rewards/RewardSourceBadge';
import { VaultLeaderboard } from '@/components/rewards/VaultLeaderboard';
import { Card } from '@/components/ui/card';

export const VaultDetails = () => {
  const { vaultId } = useParams({ from: '/rewards/vaults/$vaultId' });
  const { address: walletAddress, isConnected } = useWallet();

  const { data: vaultRewardData, isLoading: isLoadingReward } = useWalletVaultReward(walletAddress, vaultId);
  const { data: vaultScoresData, isLoading: isLoadingScores } = useVaultScores(vaultId);

  if (isLoadingReward) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-700 rounded animate-pulse w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-48 bg-gray-800/50 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-800/50 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected || !vaultRewardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <a href="/rewards/vaults" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Vaults
          </a>
          <Card className="p-12">
            <div className="text-center text-gray-400">
              {!isConnected ? 'Please connect your wallet' : 'No vault data found'}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const hasCreatorReward = vaultRewardData.creatorReward > 0;
  const hasParticipantReward = vaultRewardData.participantReward > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <a href="/rewards/vaults" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Vaults
        </a>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
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
          <p className="text-gray-400 font-mono text-sm">{vaultId}</p>
        </div>

        {/* Total Rewards */}
        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="text-sm text-gray-400 mb-2">Total Vault Rewards</div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-orange-400">
              {formatRewardAmount(vaultRewardData.totalReward)}
            </span>
            <span className="text-xl text-gray-500">VLRM</span>
          </div>
        </Card>

        {/* Reward Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Creator Rewards */}
          {hasCreatorReward && (
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <RewardSourceBadge source="creator" />
                <span className="text-sm text-gray-400">Rewards</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {formatRewardAmount(vaultRewardData.creatorReward)}
              </div>
              <div className="text-sm text-gray-500 mt-1">VLRM</div>
            </Card>
          )}

          {/* Participant Rewards */}
          {hasParticipantReward && (
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <RewardSourceBadge source="participant" />
                <span className="text-sm text-gray-400">Rewards</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {formatRewardAmount(vaultRewardData.participantReward)}
              </div>
              <div className="text-sm text-gray-500 mt-1">VLRM</div>
            </Card>
          )}

          {/* Immediate Rewards */}
          {vaultRewardData.immediateReward > 0 && (
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="text-sm text-gray-400 mb-2">Immediate</div>
              <div className="text-3xl font-bold text-green-400">
                {formatRewardAmount(vaultRewardData.immediateReward)}
              </div>
              <div className="text-sm text-gray-500 mt-1">VLRM</div>
            </Card>
          )}

          {/* Vested Rewards */}
          {vaultRewardData.vestedReward > 0 && (
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <div className="text-sm text-gray-400 mb-2">Vested</div>
              <div className="text-3xl font-bold text-blue-400">{formatRewardAmount(vaultRewardData.vestedReward)}</div>
              <div className="text-sm text-gray-500 mt-1">VLRM</div>
            </Card>
          )}
        </div>

        {/* Vault Leaderboard */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Vault Leaderboard</h2>
          {isLoadingScores ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <VaultLeaderboard scores={vaultScoresData || []} currentWalletAddress={walletAddress} />
          )}
        </Card>
      </div>
    </div>
  );
};
