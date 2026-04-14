import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Wallet, Lock, Unlock, Layers, ArrowLeft } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useVestingSummary, useActiveVesting } from '@/hooks/useRewardsVesting';
import { formatCompactNumber } from '@/utils/core.utils';
import { VestingProgress } from '@/components/rewards/VestingProgress';
import { VestingGrouped } from '@/components/rewards/VestingGrouped';
import { Card } from '@/components/ui/card';

export const VestingPage = () => {
  const navigate = useNavigate();
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'epoch', 'vault'

  const { data: vestingSummaryData, isLoading: isLoadingSummary } = useVestingSummary(walletAddress);
  const { data: activeVestingData, isLoading: isLoadingActive } = useActiveVesting(walletAddress);

  // Transform vesting data to match component expectations
  const vestingSummary = vestingSummaryData
    ? {
        ...vestingSummaryData,
        totalLocked: vestingSummaryData.totalRemaining,
        hasVestedRewards: vestingSummaryData.totalVested > 0,
        unlockedPercentage:
          vestingSummaryData.totalVested > 0
            ? (vestingSummaryData.totalUnlocked / vestingSummaryData.totalVested) * 100
            : 0,
        lockedPercentage:
          vestingSummaryData.totalVested > 0
            ? (vestingSummaryData.totalRemaining / vestingSummaryData.totalVested) * 100
            : 0,
      }
    : null;
  const activePositions = activeVestingData || [];

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Vesting</h1>
          <Card className="p-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to view your vesting positions</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/rewards' })}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rewards Overview</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Vesting</h1>
          <p className="text-gray-400">Track your vested L4VA rewards over time</p>
        </div>

        {/* Summary Cards */}
        {isLoadingSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : vestingSummary && vestingSummary.hasVestedRewards ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Total Vested</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatCompactNumber(vestingSummary.totalVested)}</div>
              <div className="text-sm text-gray-500 mt-1">$L4VA</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Unlock className="w-4 h-4" />
                <span className="text-sm">Unlocked</span>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {formatCompactNumber(vestingSummary.totalUnlocked)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {vestingSummary.unlockedPercentage ? vestingSummary.unlockedPercentage.toFixed(1) : '0'}% of total
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Locked</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">
                {formatCompactNumber(vestingSummary.totalLocked)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {vestingSummary.lockedPercentage ? vestingSummary.lockedPercentage.toFixed(1) : '0'}% of total
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No Vesting Positions</h2>
              <p className="text-gray-400">Your vested rewards will appear here</p>
            </div>
          </Card>
        )}

        {/* Active Vesting Positions */}
        {activePositions.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Active Vesting Positions ({activePositions.length})</h2>

              {/* Group By Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Group by:</span>
                <select
                  value={groupBy}
                  onChange={e => setGroupBy(e.target.value)}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="none">None</option>
                  <option value="epoch">Epoch</option>
                  <option value="vault">Vault</option>
                </select>
              </div>
            </div>

            {isLoadingActive ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : groupBy === 'none' ? (
              <div className="space-y-4">
                {activePositions.map(position => (
                  <VestingProgress key={position.id} position={position} />
                ))}
              </div>
            ) : (
              <VestingGrouped positions={activePositions} groupBy={groupBy} />
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
