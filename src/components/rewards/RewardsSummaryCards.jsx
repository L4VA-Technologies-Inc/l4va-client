import { Lock, TrendingUp, Trophy, Info } from 'lucide-react';

import L4vaIcon from '@/icons/l4va.svg?react';
import { formatCompactNumber } from '@/utils/core.utils';

export const RewardsSummaryCards = ({
  claimable = 0,
  locked = 0,
  currentEpochEstimate = 0,
  estimateConfidenceLabel = null,
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
      prefix: '~',
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
        const isEstimateCard = card.label === 'Current Epoch Estimate';

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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                    {isEstimateCard && estimateConfidenceLabel && (
                      <div className="group relative">
                        <Info className="w-4 h-4 text-steel-500 cursor-help hover:text-steel-400 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                          <p className="text-xs text-steel-300 font-medium">
                            Estimate Accuracy: <span className="text-white">{estimateConfidenceLabel}</span>
                          </p>
                          <p className="text-[10px] text-steel-400 mt-0.5">
                            Based on current epoch progress and activity
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                            <div className="border-4 border-transparent border-t-steel-800" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className={`text-xl font-bold text-white ${card.highlight ? 'text-orange-gradient' : ''}`}>
                    {card.prefix || ''}
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
