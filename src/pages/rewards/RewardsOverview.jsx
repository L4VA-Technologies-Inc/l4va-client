import { Wallet } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useCurrentEpoch } from '@/hooks/useRewardsEpochs';
import { useClaimableAmount, useClaimHistory } from '@/hooks/useRewardsClaims';
import { useVestingSummary } from '@/hooks/useRewardsVesting';
import { useWalletHistory } from '@/hooks/useRewardsScore';
import {
  normalizeEpoch,
  normalizeVestingSummary,
  normalizeClaimHistory,
  calculateTotalRewards,
} from '@/utils/rewards/normalizers';
import { RewardsSummaryCards } from '@/components/rewards/RewardsSummaryCards';
import { CurrentEpochBanner } from '@/components/rewards/CurrentEpochBanner';
import { ClaimsSummary } from '@/components/rewards/ClaimsSummary';
import { VestingSummary } from '@/components/rewards/VestingSummary';
import { Card } from '@/components/ui/card';

export const RewardsOverview = () => {
  const { address: walletAddress, isConnected } = useWallet();

  // Fetch all rewards data
  const { data: currentEpochData, isLoading: isLoadingEpoch } = useCurrentEpoch();
  const { data: claimableData, isLoading: isLoadingClaimable } = useClaimableAmount(walletAddress);
  const { data: claimHistoryData, isLoading: isLoadingClaimHistory } = useClaimHistory(walletAddress);
  const { data: vestingData, isLoading: isLoadingVesting } = useVestingSummary(walletAddress);
  const { data: historyData, isLoading: isLoadingHistory } = useWalletHistory(walletAddress);

  // Normalize data
  const currentEpoch = currentEpochData ? normalizeEpoch(currentEpochData) : null;
  const vestingSummary = vestingData ? normalizeVestingSummary(vestingData) : null;
  const claimHistory = claimHistoryData ? normalizeClaimHistory(claimHistoryData) : [];

  // Calculate totals
  const claimableAmount = claimableData?.claimableAmount || 0;
  const totalLocked = vestingSummary?.totalLocked || 0;
  const totalEarned = historyData ? calculateTotalRewards(historyData) : 0;

  // Get current epoch estimate from history
  const currentEpochEstimate = historyData?.find(item => item.epochId === currentEpoch?.id)?.totalReward || 0;

  // Check if capped
  const isCapped = historyData?.some(item => item.isCapped || item.capApplied) || false;

  // Loading state for summary cards
  const isSummaryLoading = isLoadingClaimable || isLoadingVesting || isLoadingHistory;

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Rewards</h1>
          <Card className="p-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to view your rewards</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Rewards Dashboard</h1>
          <p className="text-gray-400">Track your L4VA rewards, claims, and vesting positions</p>
        </div>

        {/* Current Epoch Banner */}
        <CurrentEpochBanner epoch={currentEpoch} isLoading={isLoadingEpoch} />

        {/* Summary Cards */}
        <RewardsSummaryCards
          claimable={claimableAmount}
          locked={totalLocked}
          currentEpochEstimate={currentEpochEstimate}
          totalEarned={totalEarned}
          nextUnlock={vestingSummary?.nextUnlock || null}
          isCapped={isCapped}
          isLoading={isSummaryLoading}
        />

        {/* Claims and Vesting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClaimsSummary
            claimableAmount={claimableAmount}
            claimHistory={claimHistory}
            isLoading={isLoadingClaimable || isLoadingClaimHistory}
          />
          <VestingSummary vestingSummary={vestingSummary} isLoading={isLoadingVesting} />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
            <a href="/rewards/epochs" className="block">
              <h3 className="font-semibold text-white mb-1">Epoch History</h3>
              <p className="text-sm text-gray-400">View your rewards by epoch</p>
            </a>
          </Card>
          <Card className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
            <a href="/rewards/vaults" className="block">
              <h3 className="font-semibold text-white mb-1">Vault Breakdown</h3>
              <p className="text-sm text-gray-400">See rewards by vault participation</p>
            </a>
          </Card>
          <Card className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
            <a href="/rewards/claims" className="block">
              <h3 className="font-semibold text-white mb-1">Claim Rewards</h3>
              <p className="text-sm text-gray-400">Manage and claim your rewards</p>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
};
