import { Lock, Unlock, Calendar } from 'lucide-react';

import { formatCompactNumber } from '@/utils/core.utils';
import { formatDate, formatPercentage } from '@/utils/rewards/normalizers';

export const VestingProgress = ({ position }) => {
  const {
    totalAmount,
    vestedAmount,
    claimedAmount,
    remainingAmount,
    startDate,
    endDate,
    unlockDate,
    progressPercentage,
    daysUntilUnlock,
    isActive,
    isCompleted,
    isExpired,
  } = position;

  const statusColors = {
    active: 'from-blue-500 to-purple-500',
    completed: 'from-green-500 to-emerald-500',
    expired: 'from-gray-500 to-gray-600',
  };

  const statusColor = isCompleted ? statusColors.completed : isExpired ? statusColors.expired : statusColors.active;

  return (
    <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-white">{formatCompactNumber(totalAmount)} VLRM</span>
            {isActive && (
              <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                Active
              </div>
            )}
            {isCompleted && (
              <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                Completed
              </div>
            )}
            {isExpired && (
              <div className="px-2 py-0.5 bg-gray-500/10 border border-gray-500/30 rounded text-xs text-gray-400">
                Expired
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(startDate)} - {formatDate(endDate)}
          </div>
        </div>

        {unlockDate && daysUntilUnlock !== null && daysUntilUnlock > 0 && (
          <div className="text-right">
            <div className="text-sm font-medium text-blue-400">{daysUntilUnlock} days</div>
            <div className="text-xs text-gray-500">until unlock</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Progress: {formatPercentage(progressPercentage)}</span>
          <span>
            {formatCompactNumber(vestedAmount)} / {formatCompactNumber(totalAmount)} VLRM
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${statusColor} transition-all duration-500`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Unlock className="w-3 h-3" />
            <span className="text-xs">Vested</span>
          </div>
          <div className="font-medium text-white">{formatCompactNumber(vestedAmount)}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">Claimed</span>
          </div>
          <div className="font-medium text-green-400">{formatCompactNumber(claimedAmount)}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Lock className="w-3 h-3" />
            <span className="text-xs">Remaining</span>
          </div>
          <div className="font-medium text-blue-400">{formatCompactNumber(remainingAmount)}</div>
        </div>
      </div>

      {/* Source/Epoch Info */}
      {(position.epochId || position.vaultId || position.source) && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-2 text-xs">
          {position.epochId && (
            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded">Epoch: {position.epochId}</span>
          )}
          {position.vaultId && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
              Vault: {position.vaultId.slice(0, 8)}...
            </span>
          )}
          {position.source && (
            <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded capitalize">{position.source}</span>
          )}
        </div>
      )}
    </div>
  );
};
