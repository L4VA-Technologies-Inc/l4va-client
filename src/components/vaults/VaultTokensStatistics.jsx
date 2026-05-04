import { useCallback, useMemo, useState } from 'react';
import { ExternalLink, Filter } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from '@tanstack/react-router';

import { useMarketStatistics } from '@/services/api/queries';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaSearchInput } from '@/components/shared/LavaInput.jsx';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useModalControls } from '@/lib/modals/modal.context';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { formatLargeNumber, formatNum, formatPercentage } from '@/utils/core.utils';
import { LavaTable } from '@/components/shared/LavaTable';

const TIME_PERIODS = ['1h', '1d', '1w', '1m'];
const TIME_PERIOD_MAP = {
  '1h': 'price_change_1h',
  '1d': 'price_change_24h',
  '1w': 'price_change_7d',
  '1m': 'price_change_30d',
};

export const VaultTokensStatistics = () => {
  const { openModal } = useModalControls();
  const { currency } = useCurrency();
  const [timePeriod, setTimePeriod] = useState('1d');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'price',
    sortOrder: 'DESC',
    ticker: '',
    minPrice: '',
    maxPrice: '',
    minFdv: '',
    maxFdv: '',
    minTvl: '',
    maxTvl: '',
    minDelta: '',
    maxDelta: '',
    minFdvPerAsset: '',
    maxFdvPerAsset: '',
  });

  const toNum = v => {
    if (v === '') return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  const apiParams = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    ticker: filters.ticker || undefined,
    currency: currency === 'ada' ? 'ada' : 'usd',
    minPrice: toNum(filters.minPrice),
    maxPrice: toNum(filters.maxPrice),
    minFdv: toNum(filters.minFdv),
    maxFdv: toNum(filters.maxFdv),
    minTvl: toNum(filters.minTvl),
    maxTvl: toNum(filters.maxTvl),
    minDelta: toNum(filters.minDelta),
    maxDelta: toNum(filters.maxDelta),
    minFdvPerAsset: toNum(filters.minFdvPerAsset),
    maxFdvPerAsset: toNum(filters.maxFdvPerAsset),
  };

  const { data, isLoading, error } = useMarketStatistics(apiParams);

  const navigate = useNavigate();

  const responseData = data?.data || data;
  const items = responseData?.items || [];

  const pagination = {
    currentPage: responseData?.page || filters.page,
    totalPages: responseData?.totalPages || 1,
    onPageChange: newPage => setFilters(prev => ({ ...prev, page: newPage })),
  };

  const handleSort = key => {
    setFilters(prev => {
      const isSameKey = prev.sortBy === key;
      const newOrder = isSameKey && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC';
      return { ...prev, sortBy: key, sortOrder: newOrder, page: 1 };
    });
  };

  const handleOpenFilters = () => {
    openModal('MarketFiltersModal', {
      onApplyFilters: handleApplyFilters,
      initialFilters: filters,
    });
  };

  const handleApplyFilters = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleTickerSearch = useCallback(value => {
    setFilters(prev => ({ ...prev, ticker: value, page: 1 }));
  }, []);

  const handleTimePeriodChange = newPeriod => {
    setTimePeriod(newPeriod);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const getPriceChangeValue = useCallback(item => item[TIME_PERIOD_MAP[timePeriod]], [timePeriod]);

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

  const columns = useMemo(
    () => [
      {
        key: 'ticker',
        header: 'Token',
        sortable: true,
        render: item => (
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
        ),
        cellClassName: 'pr-8 sm:pr-0',
      },
      {
        key: 'price',
        header: 'Price',
        sortable: true,
        render: item => (currency === 'ada' ? `₳${formatNum(item.price_ada, 4)}` : `$${formatNum(item.price_usd, 4)}`),
        cellClassName: 'text-white',
      },
      {
        key: 'priceChange',
        header: '% Change',
        sortable: true,
        sortKey: TIME_PERIOD_MAP[timePeriod],
        render: item => {
          const priceChange = getPriceChangeValue(item);
          return (
            <span className={clsx('font-medium', getPriceChangeColor(priceChange))}>
              {formatPercentage(priceChange)}
            </span>
          );
        },
      },
      {
        key: 'delta',
        header: 'FDV / TVL',
        sortable: true,
        render: item => (
          <span className={clsx('font-medium', getDeltaColor(item.delta))}>{formatLargeNumber(item.delta)}</span>
        ),
      },
      {
        key: 'fdv_per_asset',
        header: 'FDV / Asset',
        sortable: true,
        render: item => formatLargeNumber(currency === 'ada' ? item.fdv_per_asset_ada : item.fdv_per_asset_usd),
        cellClassName: 'font-medium text-white',
      },
      {
        key: 'fdv',
        header: 'FDV',
        sortable: true,
        render: item =>
          currency === 'ada' ? `₳${formatLargeNumber(item.fdv_ada)}` : `$${formatLargeNumber(item.fdv_usd)}`,
        cellClassName: 'text-white',
      },
      {
        key: 'tvl',
        header: 'TVL',
        sortable: true,
        render: item =>
          currency === 'ada' ? `₳${formatLargeNumber(item.tvl_ada)}` : `$${formatLargeNumber(item.tvl_usd)}`,
        cellClassName: 'text-white',
      },
      {
        key: 'supply',
        header: 'Supply',
        sortable: true,
        render: item => formatLargeNumber(item.supply),
        cellClassName: 'text-white',
      },
      {
        key: '_actions',
        header: '',
        render: item => (
          <PrimaryButton size="sm" onClick={() => navigate({ to: `/vaults/${item.vault_id}` })}>
            Buy
          </PrimaryButton>
        ),
      },
    ],
    [timePeriod, navigate, currency, getPriceChangeValue]
  );

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">Tokens</h2>
        <div className="text-center text-red-600 py-8">
          <p>Something went wrong</p>
        </div>
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

      <LavaTable
        columns={columns}
        data={items}
        rowKey="id"
        sort={{ key: filters.sortBy, order: filters.sortOrder }}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage="No investments found"
        pagination={pagination}
      />
    </div>
  );
};
