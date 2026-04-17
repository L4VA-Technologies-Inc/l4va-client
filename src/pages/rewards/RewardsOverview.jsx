import { Wallet, Info, History, Vault } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { useCurrentEpoch } from '@/hooks/useRewardsEpochs';
import { useClaimableAmount } from '@/hooks/useRewardsClaims';
import { useVestingSummary } from '@/hooks/useRewardsVesting';
import {
  useWalletHistory,
  useWalletScore,
  useWalletVaultTimeline,
  useWalletActivityTimeline,
  useCurrentEpochEstimate,
} from '@/hooks/useRewardsScore';
import { RewardsSummaryCards } from '@/components/rewards/RewardsSummaryCards';
import { CurrentEpochBanner } from '@/components/rewards/CurrentEpochBanner';
import { VestingSummary } from '@/components/rewards/VestingSummary';
import { RewardsAnalytics } from '@/components/rewards/RewardsAnalytics';
import { RewardsCumulativeByVault, RewardsCumulativeByActivity } from '@/components/rewards/RewardsCumulativeCharts';
import { RewardsInfoModal } from '@/components/modals/RewardsInfoModal';
import { Card } from '@/components/ui/card';
import { ClaimButton } from '@/components/rewards/ClaimButton';
import { formatCompactNumber } from '@/utils/core.utils';

export const RewardsOverview = () => {
  const navigate = useNavigate();
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Fetch all rewards data
  const { data: currentEpochData, isLoading: isLoadingEpoch } = useCurrentEpoch();
  const { data: claimableData, isLoading: isLoadingClaimable } = useClaimableAmount(walletAddress);
  const { data: vestingData, isLoading: isLoadingVesting } = useVestingSummary(walletAddress);
  const { data: historyData, isLoading: isLoadingHistory } = useWalletHistory(walletAddress);
  const { data: walletScoreData, isLoading: isLoadingScore } = useWalletScore(walletAddress);
  const { data: vaultTimelineData, isLoading: isLoadingVaultTimeline } = useWalletVaultTimeline(walletAddress);
  const { data: activityTimelineData, isLoading: isLoadingActivityTimeline } = useWalletActivityTimeline(walletAddress);
  const { data: estimateData } = useCurrentEpochEstimate(walletAddress);

  console.log('🔍 RewardsOverview Data:', {
    currentEpochData,
    claimableData,
    vestingData,
    historyData,
    walletScoreData,
  });

  // Transform activity breakdown for analytics chart
  const activityBreakdown = useMemo(() => {
    if (!walletScoreData?.breakdown) return [];

    // Activity type labels with user-friendly names
    const activityLabels = {
      asset_contribution: 'Vault Deposits',
      token_acquire: 'Token Acquisitions',
      expansion_asset_contribution: 'Expansion Deposits',
      expansion_token_purchase: 'Expansion Tokens',
      lp_position_update: 'LP Positions',
      widget_swap: 'Widget Swaps',
      governance_proposal: 'Proposals',
      governance_vote: 'Governance Votes',
    };

    // Transform breakdown object to array format for RewardsAnalytics
    const breakdown = Object.entries(walletScoreData.breakdown)
      .filter(([, amount]) => amount > 0)
      .map(([activityType, amount]) => ({
        id: activityType,
        label: activityLabels[activityType] || activityType,
        amount: Number(amount),
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    return breakdown;
  }, [walletScoreData]);

  // Transform vesting data to match component expectations
  const vestingSummary = useMemo(() => {
    if (!vestingData) return null;

    return {
      ...vestingData,
      totalLocked: vestingData.totalRemaining, // Map totalRemaining to totalLocked for component
      activePositions: vestingData.activePositionsCount,
    };
  }, [vestingData]);

  // Calculate totals
  const claimableAmount = claimableData?.totalClaimable || 0;
  const totalLocked = vestingSummary?.totalLocked || 0;
  const totalEarned = historyData?.history?.reduce((sum, item) => sum + (Number(item.finalReward) || 0), 0) || 0;

  // Get current epoch estimate
  const currentEpochEstimate = estimateData?.estimatedReward || 0;

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Rewards Dashboard</h1>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
              aria-label="How rewards work"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400">Track your L4VA rewards, claims, and vesting positions</p>
        </div>
        <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
          {/* Current Epoch Banner */}
          <CurrentEpochBanner epoch={currentEpochData?.epoch} isLoading={isLoadingEpoch} />

          {/* Summary Cards */}
          <RewardsSummaryCards
            claimable={claimableAmount}
            locked={totalLocked}
            currentEpochEstimate={currentEpochEstimate}
            estimateConfidenceLabel={estimateData?.confidenceLabel}
            totalEarned={totalEarned}
            nextUnlock={vestingSummary?.nextUnlock || null}
            isLoading={isSummaryLoading}
          />

          {/* Claim Section */}
          {claimableAmount > 0 && (
            <div className="border-t border-steel-750 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide mb-1">Ready to Claim</p>
                  <p className="text-3xl font-bold text-orange-gradient">
                    {formatCompactNumber(claimableAmount)} $L4VA
                  </p>
                </div>
                <ClaimButton
                  walletAddress={walletAddress}
                  claimableAmount={claimableAmount}
                  className="w-full sm:w-auto px-8 py-3 text-lg"
                />
              </div>
            </div>
          )}
        </div>
        {/* Activity Analytics */}
        {activityBreakdown.length > 0 && !isLoadingScore && <RewardsAnalytics activityBreakdown={activityBreakdown} />}

        {/* Cumulative Rewards Charts */}
        <RewardsCumulativeByVault
          timeline={vaultTimelineData?.timeline}
          isLoading={isLoadingVaultTimeline}
          onVaultClick={vaultId => navigate({ to: `/vaults/${vaultId}` })}
        />
        <RewardsCumulativeByActivity timeline={activityTimelineData?.timeline} isLoading={isLoadingActivityTimeline} />

        {/* Vesting Summary */}
        <VestingSummary vestingSummary={vestingSummary} isLoading={isLoadingVesting} />

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div
            className="bg-steel-850 border border-steel-750 rounded-2xl p-5 hover:bg-steel-800 transition-colors cursor-pointer"
            onClick={() => navigate({ to: '/rewards/epochs' })}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-orange-500/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-0.5">Epoch History</h3>
                <p className="text-sm text-steel-400">View your rewards by epoch</p>
              </div>
            </div>
          </div>
          <div
            className="bg-steel-850 border border-steel-750 rounded-2xl p-5 hover:bg-steel-800 transition-colors cursor-pointer"
            onClick={() => navigate({ to: '/rewards/vaults' })}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Vault className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-0.5">Vault Breakdown</h3>
                <p className="text-sm text-steel-400">See rewards by vault participation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Modal */}
        <RewardsInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      </div>
    </div>
  );
};
