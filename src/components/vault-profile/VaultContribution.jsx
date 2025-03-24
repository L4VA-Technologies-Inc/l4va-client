export const VaultContribution = ({ totalRaised, target, assetValue }) => {
  const progress = (totalRaised / target) * 100;

  const stats = [
    { label: 'ASSET VALUE', value: `$${assetValue?.toLocaleString() || '0'}` },
    { label: 'FT GAINS', value: 'N/A' },
    { label: 'FDV', value: 'N/A' },
    { label: 'FDV / TVL', value: 'N/A' },
    { label: 'TVL', value: 'N/A' },
  ];

  return (
    <div className="bg-dark-600 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2">Contribution</h2>
        <div className="flex justify-between text-sm mb-2">
          <span>Total Raised: {((progress / 100) * 100).toFixed(0)}%</span>
          <span>${totalRaised?.toLocaleString()} / ${target?.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-dark-100 text-sm">{stat.label}</span>
            <span className="font-medium">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        {['Discord', 'Instagram', 'Twitter', 'Facebook'].map((platform) => (
          <button
            key={platform}
            className="flex-1 bg-dark-700 hover:bg-dark-800 rounded-lg p-2 transition-colors"
          >
            <img
              src={`/icons/${platform.toLowerCase()}.svg`}
              alt={platform}
              className="w-5 h-5 mx-auto"
            />
          </button>
        ))}
      </div>
    </div>
  );
}; 