import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Calendar, Wallet, ArrowLeft, TrendingUp, Trophy } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useEpochs } from '@/hooks/useRewardsEpochs';
import { useWalletHistory } from '@/hooks/useRewardsScore';
import { EpochRewardRow } from '@/components/rewards/EpochRewardRow';

export const EpochsList = () => {
  const navigate = useNavigate();
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();

  const { data: epochsData, isLoading: isLoadingEpochs } = useEpochs();
  const { data: historyData, isLoading: isLoadingHistory } = useWalletHistory(walletAddress);

  // Data is already normalized by backend
  const epochs = epochsData?.epochs || [];

  // Create a map of epoch rewards for quick lookup
  const rewardsByEpoch = React.useMemo(() => {
    if (!historyData?.history) return new Map();
    return new Map(historyData.history.map(item => [item.epochId, item]));
  }, [historyData]);

  const handleEpochClick = epochId => {
    navigate({ to: `/rewards/epochs/${epochId}` });
  };

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Epoch History</h1>
          <div className="bg-steel-850 border border-steel-750 rounded-2xl p-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-steel-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-steel-400">Please connect your wallet to view your epoch rewards</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingEpochs) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Epoch History</h1>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-steel-850 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!epochs || epochs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Epoch History</h1>
          <div className="bg-steel-850 border border-steel-750 rounded-2xl p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-steel-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No Epochs Found</h2>
              <p className="text-steel-400">Epoch data will appear here once epochs are created</p>
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
            className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rewards Overview</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Epoch History</h1>
          <p className="text-gray-400">View your rewards breakdown by epoch</p>
        </div>

        {/* Stats Summary */}
        {historyData?.history && historyData.history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Total Epochs</p>
                  <p className="text-2xl font-bold text-white">{historyData.history.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-orange-500/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Total Earned</p>
                  <p className="text-xl font-bold text-orange-400">
                    {historyData.history
                      .reduce((sum, item) => sum + (Number(item.finalReward) || 0), 0)
                      .toLocaleString()}{' '}
                    $L4VA
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-green-500/20 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Avg Per Epoch</p>
                  <p className="text-xl font-bold text-white">
                    {(
                      historyData.history.reduce((sum, item) => sum + (Number(item.finalReward) || 0), 0) /
                      historyData.history.length
                    ).toLocaleString()}{' '}
                    $L4VA
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Epochs List */}
        <div className="space-y-4">
          {epochs.map(epoch => {
            const reward = rewardsByEpoch.get(epoch.id);
            return (
              <EpochRewardRow
                key={epoch.id}
                epoch={epoch}
                reward={reward}
                score={reward?.score}
                onClick={() => handleEpochClick(epoch.id)}
              />
            );
          })}
        </div>

        {isLoadingHistory && (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">Loading reward history...</div>
          </div>
        )}
      </div>
    </div>
  );
};
