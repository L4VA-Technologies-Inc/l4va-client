import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Search,
  Coins,
  Users,
  Wallet,
  BarChart3,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useVaultAcquiredAssets } from '@/services/api/queries';
import { formatNumber, substringAddress, formatNum, formatLargeNumber } from '@/utils/core.utils';
import { Pagination } from '@/components/shared/Pagination.jsx';
import { LavaSearchInput, LavaSteelInput } from '@/components/shared/LavaInput.jsx';
import { useCurrency } from '@/hooks/useCurrency';

const ADA_IMAGE = '/assets/icons/ada.svg';
const ETH_IMAGE = '/assets/icons/eth.svg';

// TODO: replace mock data with real token analytics from API
const TOKEN_SUMMARY_MOCK = {
  stats: [
    { label: 'Market Cap', value: '$1.24M' },
    { label: '24h Volume', value: '$4,820' },
    { label: '24h High', value: '$0.046' },
    { label: '24h Low', value: '$0.039' },
    { label: 'All-Time High', value: '$0.089' },
    { label: 'Avg. Holding', value: '21.5K' },
  ],
  diversification: [
    { label: 'Whales', sub: '> 1% supply', holders: 12, pct: 38 },
    { label: 'Large', sub: '0.1% – 1%', holders: 68, pct: 27 },
    { label: 'Medium', sub: '0.01% – 0.1%', holders: 214, pct: 21 },
    { label: 'Small', sub: '< 0.01%', holders: 990, pct: 14 },
  ],
};

const SummaryStat = ({ label, value }) => (
  <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-steel-800 bg-steel-900/30">
    <span className="text-[11px] font-medium text-steel-400 uppercase tracking-wider leading-none">{label}</span>
    <span className="text-sm font-bold text-white leading-none">{value}</span>
  </div>
);

const TokenSummaryCard = ({ holders, liquidity }) => (
  <div className="rounded-2xl border border-steel-800 backdrop-blur-md shadow-lg shadow-black/10 p-5 md:p-6 flex flex-col gap-6">
    <div className="flex items-center gap-2 text-steel-400">
      <PieChart className="w-4 h-4 text-orange-500" />
      <span className="text-[11px] text-white font-semibold uppercase tracking-wider">Token Summary</span>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <SummaryStat label="Holders" value={holders} />
      <SummaryStat label="Liquidity" value={liquidity} />
      {TOKEN_SUMMARY_MOCK.stats.map(s => (
        <SummaryStat key={s.label} label={s.label} value={s.value} />
      ))}
    </div>

    <div className="flex flex-col gap-3">
      <span className="text-[11px] text-white font-semibold uppercase tracking-wider">
        Diversification by wallet size
      </span>
      <div className="flex flex-col gap-3">
        {TOKEN_SUMMARY_MOCK.diversification.map(d => (
          <div key={d.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">
                {d.label} <span className="text-steel-500 text-xs">({d.sub})</span>
              </span>
              <span className="text-steel-300">
                {d.holders} holders · {d.pct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-steel-800 overflow-hidden">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${d.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StatBadge = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-steel-800 w-full md:w-auto">
    <div className="p-2 rounded-lg bg-steel-800 text-primary-400">
      <Icon size={18} className="text-orange-500" />
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-medium text-white uppercase tracking-wider leading-none mb-1">{label}</span>
      <span className="text-sm font-bold text-white leading-none">{value}</span>
    </div>
  </div>
);

export const VaultAcquiredAssetsList = ({ vault }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);
  const { currencySymbol, pickByCurrency } = useCurrency();
  const isEth = vault?.chainType === 'robinhood';
  const fallbackImage = isEth ? ETH_IMAGE : ADA_IMAGE;
  const limit = 10;

  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit,
    search: '',
    minQuantity: '',
    maxQuantity: '',
  });

  const { data, isLoading, error } = useVaultAcquiredAssets(
    vault?.id,
    appliedFilters.page,
    appliedFilters.limit,
    appliedFilters.search,
    appliedFilters.minQuantity ? Number(appliedFilters.minQuantity) : undefined,
    appliedFilters.maxQuantity ? Number(appliedFilters.maxQuantity) : undefined
  );

  const assets = data?.data?.items || [];
  const pagination = data?.data
    ? {
        page: data.data.page,
        totalPages: data.data.totalPages,
        limit: data.data.limit,
        total: data.data.total || 0,
      }
    : null;

  const handleSearch = useCallback(searchText => {
    setAppliedFilters(prev => ({ ...prev, search: searchText, page: 1 }));
  }, []);

  const handleMinQuantityChange = useCallback(value => {
    setAppliedFilters(prev => ({ ...prev, minQuantity: value, page: 1 }));
  }, []);

  const handleMaxQuantityChange = useCallback(value => {
    setAppliedFilters(prev => ({ ...prev, maxQuantity: value, page: 1 }));
  }, []);

  const handlePageChange = page => {
    setAppliedFilters(prev => ({ ...prev, page }));
    setExpandedAsset(null);
  };

  const selectedTotalAcquired = pickByCurrency({
    ada: data?.data?.totalAcquired ?? 0,
    usd: data?.data?.totalAcquiredUsd ?? 0,
    eth: data?.data?.totalAcquiredEth ?? data?.data?.totalAcquired ?? 0,
  });

  const holdersValue = formatNumber(vault.tokenHolders || 0);

  const liquidityValue =
    vault.vaultStatus === 'locked'
      ? (() => {
          const val = pickByCurrency({
            ada: data?.data?.totalAdaLiquidityAda,
            usd: data?.data?.totalAdaLiquidityUsd,
            eth: data?.data?.totalAdaLiquidityEth,
          });
          return val != null ? `${currencySymbol}${formatNum(2 * val)}` : 'N/A';
        })()
      : vault.projectedLpAdaAmount || vault.projectedLpUsdAmount
        ? `${currencySymbol}${formatNum(
            2 *
              pickByCurrency({
                ada: vault.projectedLpAdaAmount,
                usd: vault.projectedLpUsdAmount,
                eth: vault.projectedLpEthAmount,
              })
          )}`
        : 'N/A';

  return (
    <div className="flex flex-col gap-6">
      {/* <div className="rounded-2xl border border-steel-800 backdrop-blur-md shadow-lg shadow-black/10">
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-steel-800/50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-steel-400">
              <Wallet className="w-4 h-4 text-orange-500" />
              <span className="text-[11px] text-white font-semibold uppercase tracking-wider">Total Acquired</span>
            </div>
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-3xl md:text-2xl font-bold tracking-tight">
                {currencySymbol}
                {formatLargeNumber(selectedTotalAcquired)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <StatBadge icon={Users} label="Holders" value={formatNumber(vault.tokenHolders || 0)} />
            <StatBadge
              icon={Coins}
              label="Liquidity"
              value={
                vault.vaultStatus === 'locked'
                  ? (() => {
                      const val = pickByCurrency({
                        ada: data?.data?.totalAdaLiquidityAda,
                        usd: data?.data?.totalAdaLiquidityUsd,
                        eth: data?.data?.totalAdaLiquidityEth,
                      });
                      return val != null ? `${currencySymbol}${formatNum(2 * val)}` : 'N/A';
                    })()
                  : vault.projectedLpAdaAmount || vault.projectedLpUsdAmount
                    ? `${currencySymbol}${formatNum(
                        2 *
                          pickByCurrency({
                            ada: vault.projectedLpAdaAmount,
                            usd: vault.projectedLpUsdAmount,
                            eth: vault.projectedLpEthAmount,
                          })
                      )}`
                    : 'N/A'
              }
            />
            <StatBadge icon={BarChart3} label="24h Volume" value="$4,820" />
            <StatBadge icon={TrendingUp} label="24h High / Low" value="$0.046 / $0.039" />
          </div>
        </div>

        <div className="p-4 md:p-5 relative overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <LavaSearchInput
              name="search"
              placeholder="Search by wallet address"
              value={appliedFilters.search}
              onChange={handleSearch}
              className="!h-[50px] !pl-4 !rounded-xl !bg-steel-900/40 !border-steel-800 hover:!border-steel-700 focus:!border-primary-500/50 transition-all !text-sm !text-steel-200 placeholder:!text-steel-500 shadow-none font-medium"
            />

            <LavaSteelInput
              name="minQuantity"
              type="number"
              placeholder="Min Quantity"
              value={appliedFilters.minQuantity}
              onChange={handleMinQuantityChange}
              className="!h-[50px] !rounded-xl !bg-steel-900/40 !border-steel-800 hover:!border-steel-700 focus:!border-primary-500/50 transition-all !text-sm !text-steel-200 placeholder:!text-steel-500 shadow-none font-medium"
            />

            <LavaSteelInput
              name="maxQuantity"
              type="number"
              placeholder="Max Quantity"
              value={appliedFilters.maxQuantity}
              onChange={handleMaxQuantityChange}
              className="!h-[50px] !rounded-xl !bg-steel-900/40 !border-steel-800 hover:!border-steel-700 focus:!border-primary-500/50 transition-all !text-sm !text-steel-200 placeholder:!text-steel-500 shadow-none font-medium"
            />
          </div>
        </div>
      </div> */}

      <TokenSummaryCard holders={holdersValue} liquidity={liquidityValue} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-dark-100 animate-pulse">Loading acquired assets...</p>
        </div>
      ) : error ? (
        <div className="text-center p-12 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500">
          {error.message}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 rounded-2xl border border-dashed border-steel-750 bg-steel-950/20">
          <Search className="w-12 h-12 text-steel-700 mb-4" />
          <p className="text-dark-100 text-lg">No assets found</p>
          <p className="text-dark-300 text-sm">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="flex w-full overflow-x-auto rounded-2xl border border-steel-750">
          <table className="w-full">
            <thead>
              <tr className="text-dark-100 text-sm border-b border-steel-750">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <React.Fragment key={asset.id}>
                  <tr
                    className={`cursor-pointer transition-all duration-300 ${
                      expandedAsset === index ? 'bg-steel-750' : 'bg-steel-850 hover:bg-steel-750'
                    }`}
                    onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
                  >
                    <td className="px-4 py-3">
                      <img
                        alt={asset.name || 'NFT'}
                        className="w-12 h-12 rounded-lg object-cover"
                        src={asset.imageUrl || fallbackImage}
                        onError={e => {
                          e.target.src = fallbackImage;
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{isEth ? 'ETH' : 'ADA'}</td>
                    <td className="px-4 py-3 capitalize">{asset.status}</td>
                    <td className="px-4 py-3">{formatNum(asset.quantity, 6)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        type="button"
                      >
                        {expandedAsset === index ? (
                          <ChevronUp className="transition-transform duration-200" size={24} />
                        ) : (
                          <ChevronDown className="transition-transform duration-200" size={24} />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedAsset === index && (
                    <tr className="bg-steel-750">
                      <td colSpan="5" className="px-4 py-2">
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                          {!isEth && (
                            <div>
                              <p className="font-medium">Policy ID:</p>
                              <div className="flex items-center gap-2">
                                <p className="break-all">{substringAddress(asset.policyId)}</p>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(asset.policyId);
                                    toast.success('Policy ID copied to clipboard');
                                  }}
                                  className="p-1 hover:bg-steel-850 rounded-md transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          {!isEth && (
                            <div>
                              <p className="font-medium">Asset ID:</p>
                              <div className="flex items-center gap-2">
                                <p className="break-all">{substringAddress(asset.assetId)}</p>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(asset.assetId);
                                    toast.success('Asset ID copied to clipboard');
                                  }}
                                  className="p-1 hover:bg-steel-850 rounded-md transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Added At:</p>
                            <p>{new Date(asset.addedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Updated At:</p>
                            <p>{new Date(asset.updatedAt).toLocaleDateString()}</p>
                          </div>
                          {asset?.description && (
                            <div className="col-span-2">
                              <p className="font-medium">Description:</p>
                              <p>{asset.description}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};
