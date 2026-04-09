import { Link } from '@tanstack/react-router';
import { ArrowRight, Lock, Unlock } from 'lucide-react';

import { formatCompactNumber } from '@/utils/core.utils';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/rewards/normalizers';

export const VestingSummary = ({ vestingSummary, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-1/3" />
          <div className="h-12 bg-gray-700 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
        </div>
      </Card>
    );
  }

  if (!vestingSummary) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Vesting</h3>
        <div className="text-center py-8">
          <div className="text-gray-500 text-sm">No vesting positions</div>
        </div>
      </Card>
    );
  }

  const { totalVested = 0, totalLocked = 0, totalUnlocked = 0, nextUnlock, activePositions = 0 } = vestingSummary;

  const hasVestedRewards = totalVested > 0;
  const lockedPercentage = totalVested > 0 ? (totalLocked / totalVested) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Vesting</h3>
        <Link to="/rewards/vesting" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {!hasVestedRewards ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-sm">No vesting positions</div>
          <div className="text-gray-600 text-xs mt-1">Vested rewards will appear here</div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Total Vested</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-400">{formatCompactNumber(totalVested)}</span>
              <span className="text-sm text-gray-500">$L4VA</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked: {formatCompactNumber(totalLocked)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>Unlocked: {formatCompactNumber(totalUnlocked)}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${100 - lockedPercentage}%` }}
                />
              </div>
            </div>

            {/* Next Unlock Info */}
            {nextUnlock && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Next Unlock</div>
                    <div className="text-lg font-semibold text-white mt-1">
                      {formatCompactNumber(nextUnlock.amount)} $L4VA
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">On</div>
                    <div className="text-sm font-medium text-blue-400 mt-1">
                      {formatDate(nextUnlock.date, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Positions */}
            {activePositions > 0 && (
              <div className="text-center text-sm text-gray-500">
                {activePositions} active vesting {activePositions === 1 ? 'position' : 'positions'}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
