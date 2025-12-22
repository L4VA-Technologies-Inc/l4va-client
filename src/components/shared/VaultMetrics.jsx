import MetricCard from '@/components/shared/MetricCard';
import { VaultSkeleton } from '@/components/vault-profile/VaultSkeleton';
import { formatNum } from '@/utils/core.utils';

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

const VaultMetrics = ({ statistics, isLoading }) => {
  if (isLoading) {
    return <MetricsSkeleton />;
  }

  if (!statistics) {
    return null;
  }

  const formatPrice = value => {
    if (!value && value !== 0) return 'N/A';
    return `₳${formatNum(value)}`;
  };

  const formatVolume = value => {
    if (!value && value !== 0) return 'N/A';
    return `₳${formatNum(value)}`;
  };

  const formatChange = value => {
    if (!value && value !== 0) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatNum(value)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Price ADA" value={formatPrice(statistics.current_price)} />
        <MetricCard label="Daily Volume" value={formatVolume(statistics.daily_volume)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Current TVL" value={formatPrice(statistics.current_tvl)} />
        <MetricCard label="Daily Price Change" value={formatChange(statistics.daily_price_change)} />
        <MetricCard label="Daily TVL Change" value={formatChange(statistics.daily_tvl_change)} />
        <MetricCard label="Hourly Volume" value={formatVolume(statistics.hourly_volume)} />
      </div>
    </div>
  );
};

export default VaultMetrics;
