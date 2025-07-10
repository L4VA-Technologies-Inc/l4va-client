import { formatNum } from '@/utils/core.utils';

export const VaultStats = ({ assetValue = 0, ftGains = 'N/A', fdv = 'N/A', fdvTvl = 'N/A', tvl = 'N/A' }) => {
  const stats = [
    {
      label: 'ASSET VALUE',
      value: assetValue ? `$${formatNum(assetValue)}` : 'N/A',
    },
    {
      label: 'FT GAINS',
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
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
  );
};
