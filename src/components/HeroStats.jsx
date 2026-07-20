import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useStatistics } from '@/services/api/queries';
import { useCurrency } from '@/hooks/useCurrency';

const Counter = ({ value, prefix = '', decimals = 0 }) => {
  const animatedValue = useCountAnimation(value, 2000, decimals);
  return (
    <span>
      {prefix}
      {animatedValue}
    </span>
  );
};

const HeroStats = () => {
  const { data } = useStatistics();
  const stats = data?.data;
  const { currencySymbol, pickByCurrency } = useCurrency();

  const formatCurrencyValue = (adaValue, usdValue, ethValue) => {
    return pickByCurrency({ ada: adaValue, usd: usdValue, eth: ethValue }) || 0;
  };

  // Only ETH prices need fractional precision; ADA/USD stay whole numbers as before.
  const currencyDecimals = pickByCurrency({ ada: 0, usd: 0, eth: 4 });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
        <div className="text-center md:text-left">
          <p>Active Vaults</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter value={stats?.activeVaults || 0} />
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
        <div className="text-center md:text-left">
          <p>TVL</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter
              value={formatCurrencyValue(stats?.totalValueAda, stats?.totalValueUsd, stats?.totalValueEth)}
              prefix={currencySymbol}
              decimals={currencyDecimals}
            />
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
        <div className="text-center md:text-left">
          <p>Total Contributed</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter
              value={formatCurrencyValue(
                stats?.totalContributedAda,
                stats?.totalContributedUsd,
                stats?.totalContributedEth
              )}
              prefix={currencySymbol}
              decimals={currencyDecimals}
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroStats;
