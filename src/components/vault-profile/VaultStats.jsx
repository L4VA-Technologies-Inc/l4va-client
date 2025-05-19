import { formatNum } from '@/utils/core.utils';

export const VaultStats = ({ access, reserve, acquired, invAssetVal }) => {
  const stats = [
    {
      label: 'Access',
      value: access || 'Public',
    },
    {
      label: 'Reserve',
      value: `$${formatNum(reserve)}`,
    },
    {
      label: 'Acquired',
      value: `$${formatNum(acquired)}`,
    },
    {
      label: 'Inv/Asset Val',
      value: invAssetVal || 'N/A',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={stat.label} className={`px-4 text-center ${index > 0 ? 'divider-left' : ''}`}>
          <p className="text-dark-100 text-sm mb-1">{stat.label}</p>
          <p className="font-medium">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};
