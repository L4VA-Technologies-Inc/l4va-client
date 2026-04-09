import { useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useEpochDetails } from '@/hooks/useRewardsEpochs';
import { useWalletHistory } from '@/hooks/useRewardsScore';
import { normalizeEpoch, formatDateRange, formatRewardAmount } from '@/utils/rewards/normalizers';
import { EpochStatusBadge } from '@/components/rewards/EpochStatusBadge';
import { Card } from '@/components/ui/card';

export const EpochDetails = () => {
  const { id } = useParams({ from: '/rewards/epochs/$id' });
  const { address: walletAddress, isConnected } = useWallet();

  const { data: epochData, isLoading: isLoadingEpoch } = useEpochDetails(id);
  const { data: historyData, isLoading: isLoadingHistory } = useWalletHistory(walletAddress);

  const epoch = epochData ? normalizeEpoch(epochData) : null;
  const walletReward = historyData?.find(item => item.epochId === id);

  if (isLoadingEpoch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-700 rounded animate-pulse w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-800/50 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!epoch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <a href="/rewards/epochs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Epochs
          </a>
          <Card className="p-12">
            <div className="text-center text-gray-400">Epoch not found</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <a href="/rewards/epochs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Epochs
        </a>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-3xl font-bold text-white">
              {epoch.weekNumber ? `Week ${epoch.weekNumber}` : `Epoch ${epoch.id}`}
            </h1>
            <EpochStatusBadge status={epoch.status} />
          </div>
          <p className="text-gray-400">{formatDateRange(epoch.startDate, epoch.endDate)}</p>
        </div>

        {/* Epoch Metadata */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Epoch Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div className="text-white">
                {epoch.isActive && 'Currently Active'}
                {epoch.isProcessing && 'Processing Rewards'}
                {epoch.isFinalized && 'Finalized'}
              </div>
            </div>
            {epoch.totalEmission && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Emission</div>
                <div className="text-2xl font-bold text-purple-400">
                  {Number(epoch.totalEmission).toLocaleString()} VLRM
                </div>
              </div>
            )}
            {epoch.finalizedAt && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Finalized At</div>
                <div className="text-white">{new Date(epoch.finalizedAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Wallet Rewards */}
        {isConnected && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Rewards</h2>
            {isLoadingHistory ? (
              <div className="h-32 bg-gray-700 rounded animate-pulse" />
            ) : walletReward ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Reward</div>
                    <div className="text-3xl font-bold text-orange-400">
                      {formatRewardAmount(walletReward.totalReward)} VLRM
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Immediate</div>
                    <div className="text-2xl font-semibold text-green-400">
                      {formatRewardAmount(walletReward.immediateReward)} VLRM
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Vested</div>
                    <div className="text-2xl font-semibold text-blue-400">
                      {formatRewardAmount(walletReward.vestedReward)} VLRM
                    </div>
                  </div>
                </div>

                {walletReward.score && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Your Score</div>
                    <div className="text-xl font-semibold text-white">
                      {Number(walletReward.score).toLocaleString()}
                    </div>
                  </div>
                )}

                {(walletReward.isCapped || walletReward.capApplied) && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="text-sm text-yellow-400">⚠️ Weekly cap was applied to your rewards</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No rewards earned in this epoch</div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
