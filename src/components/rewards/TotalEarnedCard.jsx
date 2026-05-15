import { Trophy } from 'lucide-react';

export const TotalEarnedCard = ({
  totalEarned = 0,
  className = '',
  isLoading = false,
  showIcon = true,
  label = 'Total Earned',
  labelClassName = 'text-steel-400 text-xs font-medium uppercase tracking-wide',
  valueClassName = 'text-xl font-bold text-orange-400',
}) => {
  return (
    <div className={`bg-steel-850 border border-steel-750 rounded-2xl p-5 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        {showIcon && (
          <div className="w-11 h-11 rounded-lg bg-orange-500/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-orange-500" />
          </div>
        )}
        <div>
          <p className={labelClassName}>{label}</p>
          <p className={valueClassName}>{isLoading ? '...' : `${Number(totalEarned || 0).toLocaleString()} $L4VA`}</p>
        </div>
      </div>
    </div>
  );
};
