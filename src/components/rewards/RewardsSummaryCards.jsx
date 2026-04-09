import { Card } from '@/components/ui/card';
import { formatCompactNumber } from '@/utils/core.utils';

export const RewardsSummaryCards = ({
  claimable = 0,
  locked = 0,
  currentEpochEstimate = 0,
  totalEarned = 0,
  nextUnlock = null,
  isCapped = false,
  isLoading = false,
}) => {
  const cards = [
    {
      label: 'Claimable Now',
      value: formatCompactNumber(claimable),
      suffix: '$L4VA',
      className: 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20',
      highlight: true,
    },
    {
      label: 'Locked / Vested',
      value: formatCompactNumber(locked),
      suffix: '$L4VA',
      className: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20',
    },
    {
      label: 'Current Epoch Estimate',
      value: formatCompactNumber(currentEpochEstimate),
      suffix: '$L4VA',
      className: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20',
    },
    {
      label: 'Total Earned',
      value: formatCompactNumber(totalEarned),
      suffix: '$L4VA',
      className: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className={`p-6 ${card.className} transition-all`}>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
                <div className="h-8 bg-gray-700 rounded animate-pulse w-full" />
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">{card.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${card.highlight ? 'text-orange-400' : 'text-white'}`}>
                    {card.value}
                  </span>
                  <span className="text-sm text-gray-500">{card.suffix}</span>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextUnlock && (
          <Card className="p-4 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Next Unlock</div>
                <div className="text-xl font-semibold text-white mt-1">
                  {formatCompactNumber(nextUnlock.amount)} $L4VA
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">In</div>
                <div className="text-lg font-medium text-blue-400 mt-1">{nextUnlock.daysUntil} days</div>
              </div>
            </div>
          </Card>
        )}

        {isCapped && (
          <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <div>
                <div className="text-sm font-semibold text-yellow-400">Cap Applied</div>
                <div className="text-xs text-gray-400 mt-1">Your rewards have reached the weekly cap</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
