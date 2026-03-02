import { useCallback, useState, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, ExternalLink, Filter } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from '@tanstack/react-router';

import { useMarketStatistics } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { Pagination } from '@/components/shared/Pagination';
import { LavaSearchInput } from '@/components/shared/LavaInput.jsx';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useModalControls } from '@/lib/modals/modal.context';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { formatLargeNumber, formatUsdCurrency, formatPercentage } from '@/utils/core.utils';

const TIME_PERIODS = ['1h', '1d', '1w', '1m'];
const TIME_PERIOD_MAP = {
  '1h': 'price_change_1h',
  '1d': 'price_change_24h',
  '1w': 'price_change_7d',
  '1m': 'price_change_30d',
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
  const { openModal } = useModalControls();
  const { currency } = useCurrency();
  const [timePeriod, setTimePeriod] = useState('1d');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'mcap',
    sortOrder: 'DESC',
    unit: '',
    minPrice: '',
    maxPrice: '',
    minMcap: '',
    maxMcap: '',
    minTvl: '',
    maxTvl: '',
    minDelta: '',
    maxDelta: '',
    tvlCurrency: currency,
  });

  const { data, isLoading, error } = useMarketStatistics(filters);

  const navigate = useNavigate();

  useEffect(() => {
    const newCurrency = currency === 'ada' ? 'ada' : 'usd';
    setFilters(prev => ({
      ...prev,
      tvlCurrency: newCurrency,
    }));
  }, [currency]);

  const responseData = data?.data || data;
  const items = responseData?.items || [];

  const pagination = {
    currentPage: responseData?.page || filters.page,
    totalPages: responseData?.totalPages || 1,
    totalItems: responseData?.total || 0,
  };

  const handleSort = key => {
    setFilters(prev => {
      const isSameKey = prev.sortBy === key;
      const newOrder = isSameKey && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC';
      return {
        ...prev,
        sortBy: key,
        sortOrder: newOrder,
        page: 1,
      };
    });
  };

  const handleOpenFilters = () => {
    openModal('MarketFiltersModal', {
      onApplyFilters: handleApplyFilters,
      initialFilters: filters,
    });
  };

  const handleApplyFilters = newFilters => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleTickerSearch = useCallback(value => {
    setFilters(prev => ({
      ...prev,
      ticker: value,
      page: 1,
    }));
  }, []);

  const handleTimePeriodChange = newPeriod => {
    setTimePeriod(newPeriod);
    setFilters(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const getPriceChangeValue = item => {
    const periodKey = TIME_PERIOD_MAP[timePeriod];
    return item[periodKey];
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const getPriceChangeColor = value => {
    if (value === null || value === undefined || value === '') return 'text-dark-100';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return 'text-dark-100';
    return numValue >= 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  const getDeltaColor = value => {
    if (value === null || value === undefined || value === '') return 'text-dark-100';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return 'text-dark-100';
    return numValue > 100
      ? 'bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent'
      : 'text-emerald-500';
  };

  const getSortIcon = columnKey => {
    if (filters.sortBy !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return filters.sortOrder === 'ASC' ? (
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

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">Tokens</h2>
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">Tokens</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex-1 w-full sm:w-auto">
          <LavaTabs
            className="overflow-x-auto text-sm md:text-base w-full"
            tabs={TIME_PERIODS}
            activeTab={timePeriod}
            onTabChange={handleTimePeriodChange}
          />
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-4">
          <LavaSearchInput name="ticker" placeholder="Search by ticker" onChange={handleTickerSearch} />
          <SecondaryButton className="w-full sm:w-auto" onClick={handleOpenFilters}>
            <Filter className="w-4 h-4" />
            Filter by
          </SecondaryButton>
        </div>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-steel-750">
            <table className="w-full">
              <thead>
                <tr className="bg-steel-850">
                  <SortableHeader columnKey="ticker">Token</SortableHeader>
                  <SortableHeader columnKey="price">Price</SortableHeader>
                  <SortableHeader columnKey={TIME_PERIOD_MAP[timePeriod]}>% Change</SortableHeader>
                  <SortableHeader columnKey="delta">Mkt Cap / TVL (%)</SortableHeader>
                  <SortableHeader columnKey="mcap">Market Cap</SortableHeader>
                  <SortableHeader columnKey="tvl">TVL</SortableHeader>
                  <SortableHeader columnKey="circSupply">Supply</SortableHeader>
                  <th className="px-4 py-3 text-left text-dark-100 text-sm border-b border-steel-750"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const priceChange = getPriceChangeValue(item);

                  return (
                    <tr
                      key={item.unit || index}
                      className="bg-steel-850 hover:bg-steel-750 transition-colors border-b border-steel-750 last:border-b-0"
                    >
                      <td className="px-4 pr-8 sm:pr-0 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item?.token_image || '/favicon/favicon.ico'}
                            alt={item.ticker || '-'}
                            className="w-8 h-8 rounded-full"
                            onError={e => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-medium text-white uppercase">{item.ticker || '-'}</div>
                            <button
                              onClick={() => navigate({ to: `/vaults/${item.vault_id}` })}
                              className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
                            >
                              Vault
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-white">{formatUsdCurrency(item.price)}</td>

                      <td className={clsx('px-4 py-3 font-medium', getPriceChangeColor(priceChange))}>
                        {formatPercentage(priceChange)}
                      </td>

                      <td className={clsx('px-4 py-3 font-medium', getDeltaColor(item.delta))}>
                        {formatLargeNumber(item.delta)}%
                      </td>

                      <td className="px-4 py-3 text-white">{formatLargeNumber(item.mcap)}</td>

                      <td className="px-4 py-3 text-white">
                        {currency === 'ada'
                          ? `₳${formatLargeNumber(item.tvl_ada)}`
                          : `$${formatLargeNumber(item.tvl_usd)}`}
                      </td>

                      <td className="px-4 py-3 text-white">{formatLargeNumber(item.circSupply)}</td>

                      <td className="px-4 py-3">
                        <PrimaryButton size="sm" onClick={() => navigate({ to: `/vaults/${item.vault_id}` })}>
                          Buy
                        </PrimaryButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};
