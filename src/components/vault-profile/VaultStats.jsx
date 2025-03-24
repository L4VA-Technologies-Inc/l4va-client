export const VaultStats = ({
  access,
  reserve,
  invested,
  invAssetVal,
  valuationType,
  ftInvestmentReserve,
  liquidityPoolContribution,
}) => {
  const stats = [
    {
      label: 'Access',
      value: access || 'Public',
    },
    {
      label: 'Reserve',
      value: reserve ? `$${reserve.toLocaleString()}` : 'N/A',
    },
    {
      label: 'Invested',
      value: invested ? `$${invested.toLocaleString()}` : '$0',
    },
    {
      label: 'Inv/Asset Val',
      value: invAssetVal || 'N/A',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-dark-100 text-sm mb-1">{stat.label}</p>
          <p className="font-medium">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}; 