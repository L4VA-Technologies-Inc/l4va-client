import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { Link, useNavigate } from '@tanstack/react-router';

import VaultChart from '@/components/shared/VaultChart';
import { Spinner } from '@/components/Spinner';
import { SwapComponent } from '@/components/swap/Swap';
import { UniswapSwapPanel } from '@/components/swap/UniswapSwapPanel';
import { useCurrency } from '@/hooks/useCurrency';
import { useNetwork } from '@/hooks/useNetwork';
import { useTokenDetail, useTokenOhlc, useTokenTrades } from '@/services/api/queries';
import { formatTokenMoney, pickTokenAmount } from '@/utils/tokenMoney';

const INTERVALS = [
  { label: '1h' },
  { label: '1d' },
  { label: '1w' },
  { label: '1m' },
  { label: '3m' },
  { label: '1y' },
];

const SOURCE_LABEL = {
  vault: 'Vault',
  robinhood: 'Robinhood',
  cardano: 'Cardano',
  coingecko: 'CoinGecko',
};

const OVERVIEW_LABEL = {
  mcap: 'Mcap',
  fdv: 'FDV',
  liquidity: 'Liquidity',
  holders: 'Holders',
  volume: '24h Vol',
  high: '24h High',
  low: '24h Low',
};

const AMOUNT_KEYS = {
  price: { usd: 'price_usd', eth: 'price_eth', ada: 'price_ada' },
  fdv: { usd: 'fdv', eth: 'fdv_eth', ada: 'fdv_ada' },
  mcap: { usd: 'market_cap', eth: 'market_cap_eth', ada: 'market_cap_ada' },
  volume: { usd: 'volume_24h', eth: 'volume_24h_eth', ada: 'volume_24h_ada' },
  liquidity: { usd: 'liquidity_usd', eth: 'liquidity_eth', ada: 'liquidity_ada' },
  high: { usd: 'high_24h', eth: 'high_24h_eth', ada: 'high_24h_ada' },
  low: { usd: 'low_24h', eth: 'low_24h_eth', ada: 'low_24h_ada' },
};

const formatChange = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
};

const formatTokenAmount = value => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `${(n / 1000).toFixed(2)}K`;
  if (abs >= 1) return n.toFixed(2);
  if (abs >= 0.0001) return n.toFixed(4);
  return n.toPrecision(3);
};

const formatAgo = iso => {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
};

export const TokenDetailPage = ({ tokenId }) => {
  const [interval, setInterval] = useState(INTERVALS[1]);
  const [copied, setCopied] = useState(false);
  const { currency, currencySymbol, pickByCurrency } = useCurrency();
  const { network } = useNetwork();
  const navigate = useNavigate();
  const networkOnOpenRef = useRef(network);

  useEffect(() => {
    if (network !== networkOnOpenRef.current) {
      navigate({ to: '/tokens', replace: true });
    }
  }, [network, navigate]);

  const detailQuery = useTokenDetail(tokenId);
  const token = detailQuery.data;
  const chartQuery = useTokenOhlc(tokenId, interval.label);
  const tradesQuery = useTokenTrades(tokenId, 40, Boolean(token?.has_live_trades));

  const ticker = (token?.symbol || '').toUpperCase();
  const copyValue = token?.copy_value || tokenId;
  const copyLabel = copyValue.length > 22 ? `${copyValue.slice(0, 10)}…${copyValue.slice(-8)}` : copyValue;
  const ohlcvData = Array.isArray(chartQuery.data?.ohlcv) ? chartQuery.data.ohlcv : [];
  const positive = (token?.change_24h ?? 0) >= 0;

  const fmt = (field, opts) =>
    formatTokenMoney(pickTokenAmount(token, pickByCurrency, AMOUNT_KEYS[field]), currency, currencySymbol, opts);

  const formatUsdPriceAsCurrency = usdPrice => {
    if (usdPrice == null || token?.price_usd == null || !token.price_usd) {
      return formatTokenMoney(usdPrice, 'usdt', '$', { price: true });
    }
    const ratioEth = token.price_eth != null ? token.price_eth / token.price_usd : null;
    const ratioAda = token.price_ada != null ? token.price_ada / token.price_usd : null;
    return formatTokenMoney(
      pickByCurrency({
        usd: usdPrice,
        eth: ratioEth != null ? usdPrice * ratioEth : null,
        ada: ratioAda != null ? usdPrice * ratioAda : null,
      }),
      currency,
      currencySymbol,
      { price: true }
    );
  };

  const liveTrades = useMemo(() => {
    const rows = tradesQuery.data?.trades || [];
    return rows.map(t => ({
      id: t.tx_hash,
      buy: t.kind === 'buy',
      amountLabel: `${t.kind === 'buy' ? '+' : '-'}${formatTokenAmount(t.amount_token)}`,
      price: t.price_usd,
      volume: t.volume_usd,
      ago: formatAgo(t.timestamp),
      href: t.tx_url || null,
    }));
  }, [tradesQuery.data]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  if (detailQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (detailQuery.error || !token) {
    return (
      <div className="flex flex-col gap-4 pb-10">
        <Link to="/tokens" className="text-sm text-dark-100 hover:text-orange-400 transition-colors">
          ← Tokens
        </Link>
        <div className="text-center text-rose-400 py-8">Token not found</div>
      </div>
    );
  }

  const chartLoading = chartQuery.isLoading || (chartQuery.isFetching && !ohlcvData.length);
  const stats = (token.overview_fields || []).map(field => {
    if (field === 'holders') {
      return {
        label: OVERVIEW_LABEL.holders,
        value: token.holders_count != null ? String(token.holders_count) : '—',
      };
    }
    return {
      label: OVERVIEW_LABEL[field] || field,
      value: fmt(field, field === 'high' || field === 'low' ? { price: true } : undefined),
    };
  });

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <Link to="/tokens" className="text-sm text-dark-100 hover:text-orange-400 transition-colors">
          ← Tokens
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={token.image || '/favicon/favicon.ico'}
            alt={token.name || ticker || tokenId}
            className="w-10 h-10 rounded-full object-cover bg-steel-750"
            onError={e => {
              e.currentTarget.src = '/favicon/favicon.ico';
            }}
          />
          <h1 className="font-russo text-xl md:text-2xl uppercase text-white truncate">
            {token.name || ticker || tokenId} {ticker ? <span className="text-dark-100">{ticker}</span> : null}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-steel-750 bg-steel-850 px-3 py-1.5 text-xs text-dark-100 hover:text-white transition-colors"
        >
          <span className="font-mono">{copyLabel}</span>
          <Copy className="w-3.5 h-3.5" />
          {copied && <span className="text-emerald-400">Copied</span>}
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-steel-750 bg-steel-850 px-3 py-1.5 text-xs text-white">
          {SOURCE_LABEL[token.source] || token.source}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {token.vault_id ? (
            <Link
              to="/vaults/$id"
              params={{ id: token.vault_id }}
              className="w-8 h-8 rounded-lg border border-steel-750 bg-steel-850 text-dark-100 hover:text-white flex items-center justify-center"
              aria-label="Open vault"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : token.explorer_url ? (
            <a
              href={token.explorer_url}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg border border-steel-750 bg-steel-850 text-dark-100 hover:text-white flex items-center justify-center"
              aria-label="Open explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_300px] gap-4">
        <aside className="bg-steel-850 border border-steel-750 rounded-2xl p-4 flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white">Trades</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[560px]">
            {token.has_live_trades && tradesQuery.isLoading && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
            {liveTrades.map(trade => {
              const row = (
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 mt-0.5"
                    style={{
                      background: trade.buy
                        ? 'radial-gradient(circle, #34D399 0%, #065F46 100%)'
                        : 'radial-gradient(circle, #F87171 0%, #7F1D1D 100%)',
                    }}
                  />
                  <div className="min-w-0">
                    <div
                      className={clsx(
                        'text-sm font-medium tabular-nums',
                        trade.buy ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {trade.amountLabel} {ticker}
                    </div>
                    <div className="text-[11px] text-dark-100">
                      {trade.ago ? `${trade.ago} · ` : ''}@ {formatUsdPriceAsCurrency(trade.price)}
                      {trade.volume != null ? ` · $${Number(trade.volume).toFixed(0)}` : ''}
                    </div>
                  </div>
                </div>
              );
              return trade.href ? (
                <a
                  key={trade.id}
                  href={trade.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:opacity-90 transition-opacity"
                >
                  {row}
                </a>
              ) : (
                <div key={trade.id}>{row}</div>
              );
            })}
            {!tradesQuery.isLoading && token.has_live_trades && !liveTrades.length && (
              <div className="text-sm text-dark-100 py-6 text-center">No recent trades</div>
            )}
            {!token.has_live_trades && (
              <div className="text-sm text-dark-100 py-6 text-center">
                {token.source === 'vault' ? 'No recent trades' : 'Live trade feed is available on Robinhood tokens'}
              </div>
            )}
          </div>
        </aside>

        <section className="bg-steel-850 border border-steel-750 rounded-2xl p-4 flex flex-col gap-4 min-h-[520px]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-medium text-white tabular-nums">
                  {fmt('price', { price: true })}
                </span>
                <span className={clsx('text-sm font-medium', positive ? 'text-emerald-400' : 'text-rose-400')}>
                  {formatChange(token.change_24h)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {INTERVALS.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => setInterval(item)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  interval.label === item.label ? 'bg-steel-750 text-orange-400' : 'text-dark-100 hover:text-white'
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="text-xs text-dark-100 ml-auto hidden sm:inline">
              {token.chart_kind === 'nav' ? 'Price · NAV' : 'Price · USD'}
            </span>
          </div>

          <VaultChart
            ohlcvData={ohlcvData}
            isLoading={chartLoading}
            isNotFound={!chartLoading && !ohlcvData.length}
            emptyMessage={
              token.source === 'vault' ? 'Vault NAV is not available yet' : 'No chart data available for this token yet'
            }
          />
        </section>

        <aside className="flex flex-col gap-4">
          {token.swap?.kind === 'uniswap' && token.swap.token && (
            <UniswapSwapPanel
              tokenAddress={token.swap.token}
              tokenSymbol={ticker || 'TOKEN'}
              tokenImage={token.image}
            />
          )}
          {token.swap?.kind === 'dexhunter' && token.swap.token && (
            <div className="bg-steel-950 rounded-xl p-4 lg:p-0 w-full">
              <SwapComponent
                key={token.swap.token}
                config={{
                  defaultTokenOut: token.swap.token,
                  style: { width: '100%' },
                }}
              />
            </div>
          )}
          <div className="bg-steel-850 border border-steel-750 rounded-2xl p-4">
            <h2 className="text-sm font-medium text-white mb-3">Market Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-xl bg-steel-900/50 border border-steel-750 px-3 py-2.5">
                  <div className="text-[11px] text-dark-100 uppercase tracking-wide">{stat.label}</div>
                  <div className="text-sm text-white font-medium tabular-nums mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
