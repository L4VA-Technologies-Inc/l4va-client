import MetricCard from '@/components/shared/MetricCard';
import { VaultSkeleton } from '@/components/vault-profile/VaultSkeleton';
import { formatAdaPrice, formatLargeNumber, formatPercentage } from '@/utils/core.utils';

const MetricsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-steel-900/50 rounded-lg p-3 border border-steel-800/50">
        <VaultSkeleton className="h-4 w-20 bg-steel-800 mb-2" />
        <VaultSkeleton className="h-6 w-24 bg-steel-700" />
      </div>
      <div className="bg-steel-900/50 rounded-lg p-3 border border-steel-800/50">
        <VaultSkeleton className="h-4 w-20 bg-steel-800 mb-2" />
        <VaultSkeleton className="h-6 w-24 bg-steel-700" />
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="bg-steel-900/50 rounded-lg p-3 border border-steel-800/50">
          <VaultSkeleton className="h-4 w-20 bg-steel-800 mb-2" />
          <VaultSkeleton className="h-6 w-24 bg-steel-700" />
        </div>
      ))}
    </div>
  </div>
);

const VaultMetrics = ({ marketData, isLoading }) => {
  if (isLoading) {
    return <MetricsSkeleton />;
  }

  if (!marketData) {
    return null;
  }

  // Calculate total volume from OHLCV data if available
  const calculateTotalVolume = () => {
    if (!marketData?.ohlcv || !Array.isArray(marketData.ohlcv)) return null;
    return marketData.ohlcv.reduce((sum, point) => sum + (point.volume || 0), 0);
  };

  const totalVolume = calculateTotalVolume();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Price ADA" value={`₳${formatAdaPrice(marketData.price)}`} />
        <MetricCard label="Market Cap" value={formatLargeNumber(marketData.mcap)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="TVL ADA" value={`₳${formatLargeNumber(marketData.tvl_ada)}`} />
        <MetricCard label="24h Price Change" value={formatPercentage(marketData.price_change_24h)} />
        <MetricCard label="7d Price Change" value={formatPercentage(marketData.price_change_7d)} />
        <MetricCard label="30d Price Change" value={formatPercentage(marketData.price_change_30d)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="FDV" value={formatLargeNumber(marketData.fdv)} />
        <MetricCard label="Circ Supply" value={formatLargeNumber(marketData.circSupply || 0)} />
        <MetricCard label="Total Supply" value={formatLargeNumber(marketData.totalSupply || 0)} />
        <MetricCard
          label="Total Volume"
          value={totalVolume !== null && totalVolume !== undefined ? `₳${formatLargeNumber(totalVolume)}` : 'N/A'}
        />
      </div>
    </div>
  );
};

export default VaultMetrics;
