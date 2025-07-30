import MetricCard from '@/components/shared/MetricCard';

const VaultMetrics = ({ metrics = {} }) => {
  const defaultMetrics = {
    priceADA: '144 ₳',
    dailyVolume: '2 279 ₳',
    owners: '1 622',
    supply: '6 500',
    marketCap: '936 000 ₳',
    totalVolume: '10.43M ₳',
    listed: '459 (7.06%)',
    sales: '14 593',
    athSale: '33 750 ₳',
    maxFloor: '1 975 ₳',
    ...metrics,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Price ADA" value={defaultMetrics.priceADA} />
        <MetricCard label="Daily Volume" value={defaultMetrics.dailyVolume} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Owners" value={defaultMetrics.owners} />
        <MetricCard label="Supply" value={defaultMetrics.supply} />
        <MetricCard label="Market Cap" value={defaultMetrics.marketCap} />
        <MetricCard label="Total Volume" value={defaultMetrics.totalVolume} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Listed" value={defaultMetrics.listed} />
        <MetricCard label="Sales" value={defaultMetrics.sales} />
        <MetricCard label="ATH Sale" value={defaultMetrics.athSale} />
        <MetricCard label="Max Floor" value={defaultMetrics.maxFloor} />
      </div>
    </div>
  );
};

export default VaultMetrics;
