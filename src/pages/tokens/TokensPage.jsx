import { useEffect, useMemo, useState } from 'react';
import { Flame, ShieldCheck, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from '@tanstack/react-router';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { Pagination } from '@/components/shared/Pagination';
import { Spinner } from '@/components/Spinner';
import { useCurrency } from '@/hooks/useCurrency';
import { useNetwork } from '@/hooks/useNetwork';
import { useCardanoMemecoins, useRobinhoodMemecoins, useRobinhoodNfts, useRobinhoodRwas } from '@/services/api/queries';
import { formatTokenMoney, pickTokenAmount } from '@/utils/tokenMoney';

const LIST_TABS = ['Trending', 'Top', 'Gainers', 'New'];
const RH_TABS = ['Memecoins', 'RWAs', 'NFTs'];
const PAGE_SIZE = 10;

const formatChange = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
};

const ChangeText = ({ value, className }) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return <span className={clsx('text-dark-100', className)}>—</span>;
  }
  const n = Number(value);
  return <span className={clsx(n >= 0 ? 'text-emerald-400' : 'text-rose-400', className)}>{formatChange(n)}</span>;
};

const TokenImage = ({ src, alt, size = 'sm' }) => (
  <img
    src={src || '/favicon/favicon.ico'}
    alt={alt || ''}
    className={clsx('rounded-full object-cover bg-steel-750 shrink-0', size === 'sm' ? 'w-6 h-6' : 'w-10 h-10')}
    onError={e => {
      e.currentTarget.src = '/favicon/favicon.ico';
    }}
  />
);

const Sparkline = ({ points, positive }) => {
  if (!points?.length) {
    return <span className="text-dark-100 text-xs">—</span>;
  }

  const sampled = points.length > 48 ? points.filter((_, i) => i % Math.ceil(points.length / 48) === 0) : points;

  const width = 88;
  const height = 28;
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const coords = sampled
    .map((p, i) => {
      const x = (i / (sampled.length - 1 || 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={positive ? '#34D399' : '#F87171'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords}
      />
    </svg>
  );
};

const RangeBar = ({ low, high, price, formatMoney }) => {
  if (low == null || high == null || price == null || high === low) {
    return <span className="text-dark-100 text-xs">—</span>;
  }
  const pos = Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));

  return (
    <div className="min-w-[120px]">
      <div className="relative h-1.5 rounded-full bg-steel-750">
        <div className="absolute inset-y-0 left-0 rounded-full bg-steel-600" style={{ width: `${pos}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-white"
          style={{ left: `calc(${pos}% - 5px)` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-dark-100">
        <span>{formatMoney(low)}</span>
        <span>{formatMoney(high)}</span>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, children }) => (
  <div className="bg-steel-850 border border-steel-750 rounded-2xl p-4 flex flex-col min-h-[260px]">
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-sm font-medium text-white">{title}</h3>
    </div>
    <div className="flex-1 space-y-2.5">{children}</div>
  </div>
);

const TokenMiniRow = ({ image, ticker, fdv, change, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm w-full text-left rounded-lg px-0.5 -mx-0.5 py-0.5 hover:bg-steel-800/80 transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-2 min-w-0">
      <TokenImage src={image} alt={ticker} />
      <span className="truncate font-medium text-white uppercase">{ticker}</span>
    </div>
    <span className="text-dark-100 text-xs tabular-nums">{fdv}</span>
    <div className="w-14 text-right">
      <ChangeText value={change} className="text-xs tabular-nums" />
    </div>
  </button>
);

export const TokensPage = () => {
  const navigate = useNavigate();
  const { isRobinHood: isRobinhood } = useNetwork();
  const { currency, currencySymbol, pickByCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('Trending');
  const [rhTab, setRhTab] = useState('Memecoins');
  const [page, setPage] = useState(1);

  const formatTokenField = (token, field, opts) => {
    const map = {
      price: { usd: 'price_usd', eth: 'price_eth', ada: 'price_ada' },
      fdv: { usd: 'fdv', eth: 'fdv_eth', ada: 'fdv_ada' },
      mcap: { usd: 'market_cap', eth: 'market_cap_eth', ada: 'market_cap_ada' },
      volume: { usd: 'volume_24h', eth: 'volume_24h_eth', ada: 'volume_24h_ada' },
      liquidity: { usd: 'liquidity_usd', eth: 'liquidity_eth', ada: 'liquidity_ada' },
      high: { usd: 'high_24h', eth: 'high_24h_eth', ada: 'high_24h_ada' },
      low: { usd: 'low_24h', eth: 'low_24h_eth', ada: 'low_24h_ada' },
    };
    if (field === 'fdv') {
      const fdv = pickTokenAmount(token, pickByCurrency, map.fdv);
      const mcap = pickTokenAmount(token, pickByCurrency, map.mcap);
      return formatTokenMoney(fdv ?? mcap, currency, currencySymbol, opts);
    }
    return formatTokenMoney(pickTokenAmount(token, pickByCurrency, map[field]), currency, currencySymbol, opts);
  };

  const globalQuery = useCardanoMemecoins(!isRobinhood);
  const rhMemesQuery = useRobinhoodMemecoins(isRobinhood && rhTab === 'Memecoins');
  const rhRwasQuery = useRobinhoodRwas(isRobinhood && rhTab === 'RWAs');
  const rhNftsQuery = useRobinhoodNfts(isRobinhood && rhTab === 'NFTs');

  const activeRhQuery = rhTab === 'RWAs' ? rhRwasQuery : rhTab === 'NFTs' ? rhNftsQuery : rhMemesQuery;

  const tokens = isRobinhood ? activeRhQuery.data || [] : globalQuery.data || [];
  const isLoading = isRobinhood ? activeRhQuery.isLoading : globalQuery.isLoading;
  const error = isRobinhood ? activeRhQuery.error : globalQuery.error;

  const openToken = id => {
    navigate({ to: '/tokens/$id', params: { id } });
  };

  // Reset pagination when header chain switches
  useEffect(() => {
    setPage(1);
    setActiveTab('Trending');
  }, [isRobinhood]);

  const sorted = useMemo(() => {
    const items = [...tokens];
    if (isRobinhood && rhTab === 'NFTs') {
      return items.sort((a, b) => (b.holders_count ?? 0) - (a.holders_count ?? 0));
    }
    if (activeTab === 'Gainers') {
      return items.sort((a, b) => (b.change_24h ?? -Infinity) - (a.change_24h ?? -Infinity));
    }
    if (activeTab === 'New') {
      return items.reverse();
    }
    if (activeTab === 'Top') {
      return items.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
    }
    return items.sort((a, b) => (b.volume_24h ?? 0) - (a.volume_24h ?? 0));
  }, [tokens, activeTab, isRobinhood, rhTab]);

  const trending = useMemo(
    () =>
      [...tokens]
        .sort((a, b) => (b.volume_24h ?? b.holders_count ?? 0) - (a.volume_24h ?? a.holders_count ?? 0))
        .slice(0, 6),
    [tokens]
  );
  const graduated = useMemo(
    () =>
      [...tokens]
        .sort((a, b) => (b.market_cap ?? b.holders_count ?? 0) - (a.market_cap ?? a.holders_count ?? 0))
        .slice(6, 12),
    [tokens]
  );
  const gainers = useMemo(
    () => [...tokens].sort((a, b) => (b.change_24h ?? -Infinity) - (a.change_24h ?? -Infinity)).slice(0, 6),
    [tokens]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = tab => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleRhTabChange = tab => {
    setRhTab(tab);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">Tokens</h2>
        <div className="text-center text-rose-400 py-8">Failed to load market data</div>
      </div>
    );
  }

  const isNftTable = isRobinhood && rhTab === 'NFTs';

  return (
    <div className="flex flex-col gap-6 pb-10">
      <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">Tokens</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <SummaryCard title="Trending">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] uppercase tracking-wide text-dark-100 mb-1 px-0.5">
            <span>Name</span>
            <span>{isNftTable ? 'Holders' : 'FDV'}</span>
            <span className="w-14 text-right">24H Δ</span>
          </div>
          {trending.map(item => (
            <TokenMiniRow
              key={item.id}
              image={item.image}
              ticker={item.symbol}
              fdv={isNftTable ? String(item.holders_count ?? '—') : formatTokenField(item, 'fdv')}
              change={item.change_24h}
              onClick={() => openToken(item.id)}
            />
          ))}
        </SummaryCard>

        <SummaryCard title="Just Graduated">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] uppercase tracking-wide text-dark-100 mb-1 px-0.5">
            <span>Name</span>
            <span>{isNftTable ? 'Holders' : 'FDV'}</span>
            <span className="w-14 text-right">24H Δ</span>
          </div>
          {graduated.map(item => (
            <TokenMiniRow
              key={item.id}
              image={item.image}
              ticker={item.symbol}
              fdv={isNftTable ? String(item.holders_count ?? '—') : formatTokenField(item, 'fdv')}
              change={item.change_24h}
              onClick={() => openToken(item.id)}
            />
          ))}
        </SummaryCard>

        <SummaryCard title="Gainers">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] uppercase tracking-wide text-dark-100 mb-1 px-0.5">
            <span>Name</span>
            <span>FDV</span>
            <span className="w-14 text-right">24H Δ</span>
          </div>
          {gainers.map(item => (
            <TokenMiniRow
              key={item.id}
              image={item.image}
              ticker={item.symbol}
              fdv={formatTokenField(item, 'fdv')}
              change={item.change_24h}
              onClick={() => openToken(item.id)}
            />
          ))}
        </SummaryCard>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {isRobinhood ? (
          <LavaTabs
            tabs={RH_TABS}
            activeTab={rhTab}
            onTabChange={handleRhTabChange}
            className="overflow-x-auto text-sm md:text-base bg-steel-850/50 p-1"
            activeTabClassName="text-primary"
          />
        ) : (
          <LavaTabs
            tabs={LIST_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="overflow-x-auto text-sm md:text-base bg-steel-850/50 p-1"
            activeTabClassName="text-primary"
          />
        )}
        {/* <div className="flex items-center gap-2 w-full sm:w-auto">
          <SecondaryButton size="sm" className="gap-2">
            <Clock className="w-4 h-4" />
            24H
          </SecondaryButton>
          <SecondaryButton size="sm" className="px-3">
            <Filter className="w-4 h-4" />
          </SecondaryButton>
          <SecondaryButton size="sm" className="gap-1.5">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>10</span>
            <span className="text-dark-100">+</span>
          </SecondaryButton>
        </div> */}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-steel-750">
        {isNftTable ? (
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="bg-steel-850 border-b border-steel-750 text-xs text-dark-100 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Holders</th>
                <th className="px-4 py-3 font-medium">Supply</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(token => (
                <tr
                  key={token.id}
                  onClick={() => openToken(token.id)}
                  className="bg-steel-850 hover:bg-steel-800/80 border-b border-steel-750 last:border-b-0 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <TokenImage src={token.image} alt={token.name} size="md" />
                      <div>
                        <div className="font-medium text-white">{token.name || '—'}</div>
                        <div className="text-xs text-dark-100 uppercase">{token.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-white">{token.type || '—'}</td>
                  <td className="px-4 py-4 text-sm text-white tabular-nums">{token.holders_count ?? '—'}</td>
                  <td className="px-4 py-4 text-sm text-dark-100 tabular-nums">{token.total_supply ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="bg-steel-850 border-b border-steel-750 text-xs text-dark-100 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price / %Δ</th>
                <th className="px-4 py-3 font-medium">FDV</th>
                <th className="px-4 py-3 font-medium">Vol</th>
                <th className="px-4 py-3 font-medium">{isRobinhood ? 'Liquidity' : 'Last 24h'}</th>
                <th className="px-4 py-3 font-medium">{isRobinhood ? 'Holders' : '24h Range'}</th>
                <th className="px-4 py-3 font-medium">Mcap</th>
                <th className="px-4 py-3 font-medium text-center">Buy</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(token => {
                const positive = (token.change_24h ?? 0) >= 0;
                return (
                  <tr
                    key={token.id}
                    onClick={() => openToken(token.id)}
                    className="bg-steel-850 hover:bg-steel-800/80 border-b border-steel-750 last:border-b-0 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <TokenImage src={token.image} alt={token.name} size="md" />
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-steel-850 flex items-center justify-center">
                            <Flame className="w-2.5 h-2.5 text-orange-400" />
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white truncate max-w-[140px]">{token.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </div>
                          <span className="text-xs text-dark-100 uppercase">{token.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white text-sm tabular-nums">
                        {formatTokenField(token, 'price', { price: true })}
                      </div>
                      <ChangeText value={token.change_24h} className="text-xs tabular-nums" />
                    </td>
                    <td className="px-4 py-4 text-sm text-white tabular-nums">{formatTokenField(token, 'fdv')}</td>
                    <td className="px-4 py-4 text-sm text-white tabular-nums">{formatTokenField(token, 'volume')}</td>
                    <td className="px-4 py-4 text-sm text-white tabular-nums">
                      {isRobinhood ? (
                        formatTokenField(token, 'liquidity')
                      ) : (
                        <Sparkline points={token.sparkline} positive={positive} />
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-white tabular-nums">
                      {isRobinhood ? (
                        (token.holders_count ?? '—')
                      ) : (
                        <RangeBar
                          low={pickTokenAmount(token, pickByCurrency, {
                            usd: 'low_24h',
                            eth: 'low_24h_eth',
                            ada: 'low_24h_ada',
                          })}
                          high={pickTokenAmount(token, pickByCurrency, {
                            usd: 'high_24h',
                            eth: 'high_24h_eth',
                            ada: 'high_24h_ada',
                          })}
                          price={pickTokenAmount(token, pickByCurrency, {
                            usd: 'price_usd',
                            eth: 'price_eth',
                            ada: 'price_ada',
                          })}
                          formatMoney={v => formatTokenMoney(v, currency, currencySymbol, { price: true })}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-white tabular-nums">{formatTokenField(token, 'mcap')}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openToken(token.id);
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/40 text-orange-400 hover:bg-orange-500/25 transition-colors"
                        aria-label={`Open ${token.symbol}`}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};
