import { useMemo, useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import clsx from 'clsx';

import { useMarketStatistics } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import { LavaTabs } from '@/components/shared/LavaTabs';
import SecondaryButton from '@/components/shared/SecondaryButton.tsx';

const TIME_PERIODS = ['1h', '1d', '1w', '1m'];
const TIME_PERIOD_MAP = {
  '1h': 'price_change_percentage_1h_in_currency',
  '1d': 'price_change_percentage_24h_in_currency',
  '1w': 'price_change_percentage_7d_in_currency',
  '1m': 'price_change_percentage_30d_in_currency',
};

const formatCurrency = value => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
};

const formatNumber = value => {
  if (value === null || value === undefined) return '-';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

const formatPercentage = value => {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const calculateTVLDelta = (marketCap, priceChange) => {
  if (!marketCap || !priceChange) return null;
  const mockTVLChange = priceChange * 0.5;
  return priceChange - mockTVLChange;
};

const LoadingState = () => (
  <div className="py-8 flex items-center justify-center">
    <Spinner />
  </div>
);

const ErrorState = () => (
  <div className="text-center text-red-600 py-8">
    <p>Something went wrong</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8 text-dark-100">
    <p>No investments found</p>
  </div>
);

export const VaultTokensStatistics = () => {
  const [timePeriod, setTimePeriod] = useState('1d');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const { data, isLoading, error } = useMarketStatistics();

  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredAndSortedData = useMemo(() => {
    const responseData = data?.data || data;
    if (!responseData || !Array.isArray(responseData)) return [];

    let filtered = [...responseData];

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'priceChange') {
          const periodKey = TIME_PERIOD_MAP[timePeriod];
          aValue = a[periodKey];
          bValue = b[periodKey];
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [data, sortConfig, timePeriod]);

  const getSortIcon = columnKey => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const SortableHeader = ({ columnKey, children, className = '' }) => (
    <th
      className={clsx(
        'px-4 py-3 text-left text-dark-100 text-sm border-b border-steel-750 cursor-pointer hover:text-white transition-colors',
        className
      )}
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon(columnKey)}
      </div>
    </th>
  );

  const getPriceChangeValue = item => {
    const periodKey = TIME_PERIOD_MAP[timePeriod];
    return item[periodKey];
  };

  const getPriceChangeColor = value => {
    if (value === null || value === undefined) return 'text-dark-100';
    return value >= 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">INVESTMENTS</h2>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">INVESTMENTS</h2>
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">INVESTMENTS</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex w-full items-center justify-between">
          <LavaTabs tabs={TIME_PERIODS} activeTab={timePeriod} onTabChange={setTimePeriod} className="bg-steel-850" />
          <SecondaryButton className="w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Filter by
          </SecondaryButton>
        </div>
      </div>

      {filteredAndSortedData.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-steel-750">
          <table className="w-full">
            <thead>
              <tr className="bg-steel-850">
                <SortableHeader columnKey="name">Token</SortableHeader>
                <SortableHeader columnKey="current_price">Price</SortableHeader>
                <SortableHeader columnKey="priceChange">% Change</SortableHeader>
                <SortableHeader columnKey="market_cap">Market Cap</SortableHeader>
                <SortableHeader columnKey="market_cap">TVL Delta</SortableHeader>
                <SortableHeader columnKey="circulating_supply">Supply</SortableHeader>
                <th className="px-4 py-3 text-left text-dark-100 text-sm border-b border-steel-750">Vault</th>
                <th className="px-4 py-3 text-left text-dark-100 text-sm border-b border-steel-750">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((item, index) => {
                const priceChange = getPriceChangeValue(item);
                const tvlDelta = calculateTVLDelta(item.market_cap, priceChange);

                return (
                  <tr
                    key={item.id || index}
                    className="bg-steel-850 hover:bg-steel-750 transition-colors border-b border-steel-750 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name || item.symbol}
                            className="w-8 h-8 rounded-full"
                            onError={e => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium text-white">{item.name || '-'}</div>
                          <div className="text-sm text-dark-100 uppercase">{item.symbol || '-'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-white">{formatCurrency(item.current_price)}</td>

                    <td className={clsx('px-4 py-3 font-medium', getPriceChangeColor(priceChange))}>
                      {formatPercentage(priceChange)}
                    </td>

                    <td className="px-4 py-3 text-white">{formatNumber(item.market_cap)}</td>

                    <td className={clsx('px-4 py-3 font-medium', getPriceChangeColor(tvlDelta))}>
                      {tvlDelta !== null ? formatPercentage(tvlDelta) : '-'}
                    </td>

                    <td className="px-4 py-3 text-white">{formatNumber(item.circulating_supply)}</td>

                    <td className="px-4 py-3 text-white">12 NFTs</td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-steel-750 text-white text-sm">
                        {index % 2 === 0 ? 'Staked' : 'Listed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
