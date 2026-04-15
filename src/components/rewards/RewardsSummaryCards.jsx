import { Lock, TrendingUp, Trophy } from 'lucide-react';

import L4vaIcon from '@/icons/l4va.svg?react';
import { formatCompactNumber } from '@/utils/core.utils';

export const RewardsSummaryCards = ({
  claimable = 0,
  locked = 0,
  currentEpochEstimate = 0,
  totalEarned = 0,
  isLoading = false,
}) => {
  const cards = [
    {
      label: 'Claimable Now',
      value: formatCompactNumber(claimable),
      suffix: '$L4VA',
      icon: L4vaIcon,
      iconBg: 'bg-orange-500/20',
      iconBorder: 'border-orange-500/20',
      iconColor: 'text-orange-500',
    },
    {
      label: 'Locked / Vested',
      value: formatCompactNumber(locked),
      suffix: '$L4VA',
      icon: Lock,
      iconBg: 'bg-blue-500/20',
      iconBorder: 'border-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Current Epoch Estimate',
      value: formatCompactNumber(currentEpochEstimate),
      suffix: '$L4VA',
      icon: TrendingUp,
      iconBg: 'bg-green-500/20',
      iconBorder: 'border-green-500/20',
      iconColor: 'text-green-500',
    },
    {
      label: 'Total Earned',
      value: formatCompactNumber(totalEarned),
      suffix: '$L4VA',
      icon: Trophy,
      iconBg: 'bg-purple-500/20',
      iconBorder: 'border-purple-500/20',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 md:p-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div key={index} className={`rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3`}>
            {isLoading ? (
              <div className="flex items-center gap-3 w-full">
                <div className={`w-11 h-11 rounded-lg bg-gray-700 animate-pulse flex-shrink-0`} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-full" />
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`w-11 h-11 rounded-lg ${card.iconBg} ${card.iconBorder} flex items-center justify-center flex-shrink-0 border`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-steel-400 text-xs font-medium uppercase tracking-wide mb-0.5">{card.label}</p>
                  <p className={`text-xl  font-bold text-white ${card.highlight ? 'text-orange-gradient' : ''}`}>
                    {card.value} {card.suffix}
                  </p>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
