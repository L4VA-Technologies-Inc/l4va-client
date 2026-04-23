import { Link } from '@tanstack/react-router';
import { ArrowRight, Lock, Unlock, Calendar } from 'lucide-react';

import { HoverHelp } from '@/components/shared/HoverHelp';
import { formatCompactNumber } from '@/utils/core.utils';
import { formatDate } from '@/utils/rewards/normalizers';

const VESTING_HINT = `Your rewards unlock gradually over time to ensure long-term alignment. Track locked and unlocked amounts here.`;

export const VestingSummary = ({ vestingSummary, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5 md:p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-1/3" />
          <div className="h-12 bg-gray-700 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
        </div>
      </div>
    );
  }

  if (!vestingSummary) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Vesting</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-steel-500 text-sm">No vesting positions</div>
        </div>
      </div>
    );
  }

  const { totalVested = 0, totalLocked = 0, totalUnlocked = 0, nextUnlock, activePositions = 0 } = vestingSummary;

  const hasVestedRewards = totalVested > 0;
  const lockedPercentage = totalVested > 0 ? (totalLocked / totalVested) * 100 : 0;

  return (
    <div className="bg-steel-850 border border-steel-750 rounded-2xl overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Vesting</h3>
            <HoverHelp hint={VESTING_HINT} />
          </div>
          <Link
            to="/rewards/vesting"
            className="text-sm text-white hover:text-orange-500 transition-colors flex items-center gap-1"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!hasVestedRewards ? (
          <div className="text-center py-8">
            <div className="text-steel-500 text-sm">No vesting positions</div>
            <div className="text-steel-600 text-xs mt-1">Vested rewards will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Vested Card */}
            <div className="rounded-xl border border-steel-750 bg-steel-900/60 p-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-steel-400 text-xs font-medium uppercase tracking-wide mb-0.5">Total Vested</p>
                <p className="text-2xl font-bold text-white">{formatCompactNumber(totalVested)} $L4VA</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4">
              <div className="flex items-center justify-between text-xs text-steel-400 mb-3">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked: {formatCompactNumber(totalLocked)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>Unlocked: {formatCompactNumber(totalUnlocked)}</span>
                </div>
              </div>
              <div className="h-2 bg-steel-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                  style={{ width: `${100 - lockedPercentage}%` }}
                />
              </div>
            </div>

            {/* Next Unlock Info */}
            {nextUnlock && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-green-500/20 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Next Unlock</p>
                  <p className="text-lg font-semibold text-white">{formatCompactNumber(nextUnlock.amount)} $L4VA</p>
                </div>
                <div className="text-right">
                  <p className="text-steel-400 text-xs font-medium">On</p>
                  <p className="text-sm font-medium text-green-400">{formatDate(nextUnlock.date, 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}

            {/* Active Positions */}
            {activePositions > 0 && (
              <div className="text-center text-sm text-steel-500 pt-2">
                {activePositions} active vesting {activePositions === 1 ? 'position' : 'positions'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
