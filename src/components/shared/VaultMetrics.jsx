import MetricCard from '@/components/shared/MetricCard';
import { VaultSkeleton } from '@/components/vault-profile/VaultSkeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { formatAdaPrice, formatLargeNumber, formatPercentage, formatUsdCurrency } from '@/utils/core.utils';

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
  const { currency, currencySymbol } = useCurrency();

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

  const totalVolumeAda = calculateTotalVolume();
  const adaPrice = marketData.adaPrice != null ? Number(marketData.adaPrice) : null;
  const totalVolumeUsd =
    totalVolumeAda != null && adaPrice != null && !Number.isNaN(adaPrice) ? totalVolumeAda * adaPrice : null;

  const priceValue = currency === 'ada' ? marketData.price_ada : marketData.price_usd;
  const tvlValue = currency === 'ada' ? marketData.tvl_ada : marketData.tvl_usd;
  const fdvValue = currency === 'ada' ? marketData.fdv_ada : marketData.fdv_usd;
  const totalVolumeValue = currency === 'ada' ? totalVolumeAda : totalVolumeUsd;

  const fdvTvl = marketData.fdv_tvl != null && marketData.fdv_tvl !== '' ? Number(marketData.fdv_tvl).toFixed(2) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Price"
          value={currency === 'ada' ? `${currencySymbol}${formatAdaPrice(priceValue)}` : formatUsdCurrency(priceValue)}
        />
        <MetricCard label="Market Cap" value={formatLargeNumber(marketData.mcap)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="TVL" value={`${currencySymbol}${formatLargeNumber(tvlValue)}`} />
        <MetricCard label="24h Price Change" value={formatPercentage(marketData.price_change_24h)} />
        <MetricCard label="7d Price Change" value={formatPercentage(marketData.price_change_7d)} />
        <MetricCard label="30d Price Change" value={formatPercentage(marketData.price_change_30d)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="FDV" value={`${currencySymbol}${formatLargeNumber(fdvValue)}`} />
        <MetricCard label="FDV/TVL" value={fdvTvl ?? 'N/A'} />
        <MetricCard label="Supply" value={formatLargeNumber(marketData.supply || 0)} />
        <MetricCard
          label="Total Volume"
          value={totalVolumeValue != null ? `${currencySymbol}${formatLargeNumber(totalVolumeValue)}` : 'N/A'}
        />
      </div>
    </div>
  );
};

export default VaultMetrics;
