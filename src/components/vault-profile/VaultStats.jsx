import { InfoRow } from '@/components/ui/infoRow.js';
import { cn } from '@/lib/utils.js';

export const VaultStats = ({ assetValue, ftGains = 'N/A', fdv = 'N/A', fdvTvl = 'N/A', tvl = 'N/A' }) => {
  const stats = [
    {
      label: 'VAULT STAGE',
      value: assetValue ? assetValue.toUpperCase() : 'N/A',
    },
    {
      label: 'VT GAINS',
      value: ftGains,
    },
    {
      label: 'FDV',
      value: fdv,
    },
    {
      label: 'FDV / TVL',
      value: fdvTvl,
    },
    {
      label: 'TVL',
      value: tvl,
    },
  ];

  return (
    <>
      <div className="md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full hidden">
        {stats.map(stat => (
          <div key={stat.label} className="flex flex-col items-center justify-center">
            <span className="text-dark-100 text-sm font-medium mb-1 tracking-wide uppercase text-center">
              {stat.label}
            </span>
            <span className={`font-bold text-white text-center ${stat.value === 'N/A' ? 'text-dark-100' : ''}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      <div className="md:hidden">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn('flex flex-col w-full', index !== stats.length - 1 ? 'border-b-1 border-steel-750' : '')}
          >
            <InfoRow label={stat.label} value={stat.value} />
          </div>
        ))}
      </div>
    </>
  );
};
