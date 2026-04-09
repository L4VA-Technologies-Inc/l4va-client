import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Calendar, Wallet } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useEpochs } from '@/hooks/useRewardsEpochs';
import { useWalletHistory } from '@/hooks/useRewardsScore';
import { EpochRewardRow } from '@/components/rewards/EpochRewardRow';
import { Card } from '@/components/ui/card';

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
          <Card className="p-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to view your epoch rewards</p>
            </div>
          </Card>
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
              <div key={i} className="h-24 bg-gray-800/50 rounded-lg animate-pulse" />
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
          <Card className="p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No Epochs Found</h2>
              <p className="text-gray-400">Epoch data will appear here once epochs are created</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Epoch History</h1>
          <p className="text-gray-400">View your rewards breakdown by epoch</p>
        </div>

        {/* Stats Summary */}
        {historyData?.history && historyData.history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-gray-400">Total Epochs</div>
              <div className="text-2xl font-bold text-white mt-1">{historyData.history.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-400">Total Earned</div>
              <div className="text-2xl font-bold text-orange-400 mt-1">
                {historyData.history.reduce((sum, item) => sum + (Number(item.finalReward) || 0), 0).toLocaleString()}{' '}
                $L4VA
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-400">Avg Per Epoch</div>
              <div className="text-2xl font-bold text-white mt-1">
                {(
                  historyData.history.reduce((sum, item) => sum + (Number(item.finalReward) || 0), 0) /
                  historyData.history.length
                ).toLocaleString()}{' '}
                $L4VA
              </div>
            </Card>
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
