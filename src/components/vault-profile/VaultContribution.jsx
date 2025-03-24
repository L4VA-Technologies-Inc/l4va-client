export const VaultContribution = ({ totalRaised, target, assetValue }) => {
  const progress = (totalRaised / target) * 100;

  const stats = [
    { label: 'ASSET VALUE', value: 'N/A' },
    { label: 'FT GAINS', value: 'N/A' },
    { label: 'FDV', value: 'N/A' },
    { label: 'FDV / TVL', value: 'N/A' },
    { label: 'TVL', value: 'N/A' },
  ];

  return (
    <div>
      <h2 className="text-[20px] font-medium">
        Contribution
      </h2>
    </div>
  );
}; 