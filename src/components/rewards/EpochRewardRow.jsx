import { EpochStatusBadge } from './EpochStatusBadge';

import { formatRewardAmount, formatDateRange } from '@/utils/rewards/normalizers';

export const EpochRewardRow = ({ epoch, reward = null, score = null, onClick = null }) => {
  const hasReward = reward && reward.totalReward > 0;
  const isCapped = reward?.isCapped || reward?.capApplied || false;

  return (
    <div
      className={`p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800/70 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Epoch Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-white">{epoch.weekNumber ? `Week ${epoch.weekNumber}` : 'Epoch'}</h4>
            <EpochStatusBadge status={epoch.status} />
            {isCapped && (
              <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                Capped
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">{formatDateRange(epoch.startDate, epoch.endDate)}</div>
        </div>

        {/* Reward Info */}
        <div className="text-right">
          {hasReward ? (
            <>
              <div className="text-2xl font-bold text-white mb-1">{formatRewardAmount(reward.totalReward)} VLRM</div>
              {(reward.immediateReward > 0 || reward.vestedReward > 0) && (
                <div className="text-xs text-gray-500 space-x-3">
                  {reward.immediateReward > 0 && <span>Immediate: {formatRewardAmount(reward.immediateReward)}</span>}
                  {reward.vestedReward > 0 && <span>Vested: {formatRewardAmount(reward.vestedReward)}</span>}
                </div>
              )}
              {score !== null && score !== undefined && (
                <div className="text-xs text-gray-600 mt-1">Score: {Number(score).toLocaleString()}</div>
              )}
            </>
          ) : (
            <div className="text-gray-600">No rewards</div>
          )}
        </div>
      </div>
    </div>
  );
};
