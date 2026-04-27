import { Link } from '@tanstack/react-router';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { CurrentEpochInfoCard, TotalEarnedCard } from '@/components/rewards';
import { useCurrentEpoch } from '@/hooks/useRewardsEpochs';
import { useCurrentEpochEstimate, useWalletHistory } from '@/hooks/useRewardsScore';
import { formatCompactNumber } from '@/utils/core.utils';

export const ProfileRewardsLinkCard = () => {
  const { changeAddressBech32: walletAddress } = useWallet();
  const { data: epochData, isLoading: isEpochLoading } = useCurrentEpoch();
  const { data: estimateData, isLoading: isEstimateLoading } = useCurrentEpochEstimate(walletAddress);
  const { data: historyData, isLoading: isHistoryLoading } = useWalletHistory(walletAddress);

  const epoch = epochData?.epoch;
  const estimateValue = estimateData?.estimatedReward;
  const totalEarned = historyData?.history?.reduce((sum, item) => sum + (Number(item.finalReward) || 0), 0) || 0;

  return (
    <Link
      to="/rewards"
      className="group h-full rounded-2xl border border-steel-750 bg-steel-950 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] transition-colors hover:border-steel-600"
    >
      <div className="flex h-full min-h-[260px] flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] tracking-[0.12em] uppercase text-dark-100">Rewards</div>
            <div className="mt-2 text-[18px] leading-tight font-semibold text-white">L4VA rewards this week</div>
            <div className="mt-2 text-[13px] text-dark-100">Open rewards dashboard, claims and epochs</div>
          </div>
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-dark-100 transition-transform group-hover:translate-x-1 group-hover:text-white" />
        </div>

        <div className="space-y-3">
          <CurrentEpochInfoCard epoch={epoch} isLoading={isEpochLoading} showCalendarIcon={false} />

          <div className="rounded-xl border border-steel-750 bg-steel-900/50 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-dark-100">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Epoch estimate</span>
            </div>
            <div className="mt-2 text-[20px] font-semibold text-white">
              {isEstimateLoading ? '...' : `~${formatCompactNumber(estimateValue || 0)} $L4VA`}
            </div>
          </div>

          <TotalEarnedCard
            totalEarned={totalEarned}
            isLoading={isHistoryLoading}
            className="bg-steel-900/50 p-4"
            showIcon={false}
            labelClassName="text-[11px] uppercase tracking-wide text-dark-100"
            valueClassName="mt-2 text-[20px] font-semibold text-white"
          />
        </div>
      </div>
    </Link>
  );
};
