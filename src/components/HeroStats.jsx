import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useStatistics } from '@/services/api/queries';
import { useCurrency } from '@/hooks/useCurrency';
import { formatNum } from '@/utils/core.utils.js';

const Counter = ({ value, prefix = '' }) => {
  const animatedValue = useCountAnimation(value);
  return <span>{prefix}{animatedValue}</span>;
};

const HeroStats = () => {
  const { data } = useStatistics();
  const stats = data?.data;
  const { currency } = useCurrency();
  const currencySymbol = currency === 'ada' ? '₳' : '$';

  const formatCurrencyValue = (adaValue, usdValue) => {
    const value = currency === 'ada' ? adaValue : usdValue;
    return formatNum(value || 0);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
        <div className="text-center sm:text-left">
          <p>Active Vaults</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter value={stats?.activeVaults || 0} />
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
        <div className="text-center sm:text-left">
          <p>TVL</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter 
              value={formatCurrencyValue(stats?.totalValueAda, stats?.totalValueUsd)} 
              prefix={currencySymbol}
            />
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center text-2xl font-bold min-w-[240px]">
        <div className="text-center sm:text-left">
          <p>Total Contributed</p>
          <p className="text-orange-500 text-2xl sm:text-4xl">
            <Counter 
              value={formatCurrencyValue(stats?.totalContributedAda, stats?.totalContributedUsd)} 
              prefix={currencySymbol}
            />
          </p>
        </div>
      </div>
    </div>
  );
};


export default HeroStats;
