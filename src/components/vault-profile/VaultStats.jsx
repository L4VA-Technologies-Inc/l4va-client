import { InfoRow } from '@/components/ui/infoRow.js';
import { cn } from '@/lib/utils.js';

export const VaultStats = ({
  assetValue,
  ftGains = 'N/A',
  fdv = 'N/A',
  fdvTvl = 'N/A',
  tvl = 'N/A',
  vtPrice = 'N/A',
  tokensForAcquires,
}) => {
  const stats = [
    {
      label: 'VAULT STAGE',
      value: assetValue ? assetValue.toUpperCase() : 'N/A',
    },
    {
      label: 'VT PRICE',
      value: tokensForAcquires === 0 ? 'N/A' : vtPrice,
    },
    {
      label: 'VT GAINS',
      value: ftGains,
    },
    {
      label: 'FDV',
      value: tokensForAcquires === 0 ? 'N/A' : fdv,
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
      <div className="lg:flex md:grid grid-cols-3 w-full justify-between gap-4 hidden">
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
