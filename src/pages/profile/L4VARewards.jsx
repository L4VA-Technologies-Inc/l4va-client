import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Info, Calendar, Percent } from 'lucide-react';

import { useL4VARewards } from '@/hooks/useL4VARewards';
import { WeeklyTimeline } from '@/pages/profile/L4VARewards/WeeklyTimeline';
import { RewardsAnalytics } from '@/pages/profile/L4VARewards/RewardsAnalytics';
import { AlignmentTracker } from '@/pages/profile/L4VARewards/AlignmentTracker';
import { useModalControls } from '@/lib/modals/modal.context';
import L4vaIcon from '@/icons/l4va.svg?react';
import { formatNum } from '@/utils/core.utils';

export const L4VARewards = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { openModal } = useModalControls();
  const { weeklyEpochs, totalEarned, activityBreakdown, alignment, baseStakingApr, nextRewardDate, isLoading } =
    useL4VARewards();

  const handleClaim = async epoch => {
    setIsClaiming(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success(`Claimed ${epoch.amount} $L4VA for Week ${epoch.weekNumber}`);
    } catch (err) {
      toast.error(err.message || 'Failed to claim rewards');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimAll = async () => {
    const claimable = weeklyEpochs.filter(e => e.status === 'claimable');
    if (claimable.length === 0) return;
    setIsClaiming(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const total = claimable.reduce((s, e) => s + e.amount, 0);
      toast.success(`Claimed ${total} $L4VA across ${claimable.length} week(s)`);
    } catch (err) {
      toast.error(err.message || 'Failed to claim rewards');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="font-russo text-4xl uppercase text-white">L4VA Rewards</h2>
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-steel-400">Loading rewards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-russo text-4xl uppercase text-white">L4VA Rewards</h2>
        <button
          type="button"
          onClick={() => openModal('RewardsInfoModal')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-steel-750 text-steel-300 hover:text-white hover:border-steel-600 transition-colors text-sm"
        >
          <Info className="w-4 h-4" />
          How it works
        </button>
      </div>

      <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 md:p-6">
          <div className="rounded-xl border border-steel-750 bg-steel-900/60 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
              <L4vaIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-steel-400 text-xs font-medium uppercase tracking-wide mb-0.5">Total Earned</p>
              <p className="text-2xl font-bold text-white text-orange-gradient">{formatNum(totalEarned)} $L4VA</p>
            </div>
          </div>
          <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-steel-800 flex items-center justify-center flex-shrink-0">
              <Percent className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-steel-400 text-xs font-medium">Base Staking APR</p>
              <p className="text-xl font-bold text-white">{baseStakingApr}%</p>
            </div>
          </div>
          <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-steel-800 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-steel-400 text-xs font-medium">Next Reward</p>
              <p className="text-xl font-bold text-white">{format(nextRewardDate, 'MMM d')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-steel-750 p-6">
          <WeeklyTimeline
            weeklyEpochs={weeklyEpochs}
            onClaim={handleClaim}
            onClaimAll={handleClaimAll}
            isClaiming={isClaiming}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RewardsAnalytics totalEarned={totalEarned} activityBreakdown={activityBreakdown} />
        <AlignmentTracker alignment={alignment} />
      </div>
    </div>
  );
};
