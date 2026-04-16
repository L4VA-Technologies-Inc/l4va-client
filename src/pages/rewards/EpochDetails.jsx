import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Calendar, TrendingUp, Award, Lock, Unlock } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useEpochDetails } from '@/hooks/useRewardsEpochs';
import { useWalletHistory } from '@/hooks/useRewardsScore';
import { formatDateRange } from '@/utils/rewards/normalizers';
import { EpochStatusBadge } from '@/components/rewards/EpochStatusBadge';
import { formatCompactNumber } from '@/utils/core.utils';

export const EpochDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/rewards/epochs/$id' });
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();

  const { data: epochData, isLoading: isLoadingEpoch } = useEpochDetails(id);
  const { data: historyData, isLoading: isLoadingHistory } = useWalletHistory(walletAddress);

  // Data is already normalized by backend
  const epoch = epochData || null;
  const walletReward = historyData?.history?.find(item => item.epochId === id);

  if (isLoadingEpoch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-700 rounded animate-pulse w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-steel-850 rounded-2xl animate-pulse" />
            <div className="h-64 bg-steel-850 rounded-2xl animate-pulse" />
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
          <div className="bg-steel-850 border border-steel-750 rounded-2xl p-12">
            <div className="text-center text-steel-400">Epoch not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '/rewards/epochs' })}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Epochs
        </button>

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
        <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden mb-6">
          <div className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Epoch Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Status</p>
                  <p className="text-lg font-semibold text-white">
                    {epoch.isActive && 'Currently Active'}
                    {epoch.isProcessing && 'Processing Rewards'}
                    {epoch.isFinalized && 'Finalized'}
                  </p>
                </div>
              </div>
              {epoch.totalEmission && (
                <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Total Emission</p>
                    <p className="text-xl font-bold text-white">{Number(epoch.totalEmission).toLocaleString()} $L4VA</p>
                  </div>
                </div>
              )}
            </div>
            {epoch.finalizedAt && (
              <div className="mt-4 rounded-xl border border-steel-750 bg-steel-900/40 p-4">
                <p className="text-steel-400 text-xs font-medium uppercase tracking-wide mb-1">Finalized At</p>
                <p className="text-white">{new Date(epoch.finalizedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Rewards */}
        {isConnected && (
          <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
            <div className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Your Rewards</h2>
              {isLoadingHistory ? (
                <div className="h-32 bg-gray-700 rounded animate-pulse" />
              ) : walletReward ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-steel-750 bg-steel-900/60 p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-orange-500/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Total Reward</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {formatCompactNumber(walletReward.finalReward)} $L4VA
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-green-500/20 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Unlock className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Immediate</p>
                        <p className="text-xl font-semibold text-green-400">
                          {formatCompactNumber(walletReward.immediateReward)} $L4VA
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Vested</p>
                        <p className="text-xl font-semibold text-blue-400">
                          {formatCompactNumber(walletReward.vestedReward)} $L4VA
                        </p>
                      </div>
                    </div>
                  </div>

                  {walletReward.score && (
                    <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4">
                      <p className="text-steel-400 text-xs font-medium uppercase tracking-wide mb-1">Your Score</p>
                      <p className="text-xl font-semibold text-white">{Number(walletReward.score).toLocaleString()}</p>
                    </div>
                  )}

                  {walletReward.wasCapped && (
                    <div className="rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30">
                      <div className="text-sm text-yellow-400">⚠️ Weekly cap was applied to your rewards</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-steel-500">No rewards earned in this epoch</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
