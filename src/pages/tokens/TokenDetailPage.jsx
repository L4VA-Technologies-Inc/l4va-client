import { useMemo, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { Link } from '@tanstack/react-router';

import VaultChart from '@/components/shared/VaultChart';
import { Spinner } from '@/components/Spinner';
import { useCurrency } from '@/hooks/useCurrency';
import {
  useCardanoMemecoin,
  useCardanoMemecoinOhlc,
  useMemecoin,
  useMemecoinOhlc,
  useRobinhoodToken,
  useRobinhoodTokenOhlc,
  useRobinhoodTokenTrades,
} from '@/services/api/queries';
import { formatTokenMoney, pickTokenAmount } from '@/utils/tokenMoney';

const INTERVALS = [
  { label: '1h', days: 1 },
  { label: '1d', days: 1 },
  { label: '1w', days: 7 },
  { label: '1m', days: 30 },
  { label: '3m', days: 90 },
  { label: '1y', days: 365 },
];

const formatChange = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
};

const formatTokenAmount = value => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
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
  const [interval, setInterval] = useState(INTERVALS[2]);
  const [copied, setCopied] = useState(false);
  const { currency, currencySymbol, pickByCurrency } = useCurrency();

  const isRobinhood = /^0x[a-fA-F0-9]{40}$/.test(tokenId);
  const isCardano = !isRobinhood && /^[a-fA-F0-9]{56,}$/i.test(tokenId);
  const cgQuery = useMemecoin(!isRobinhood && !isCardano ? tokenId : '');
  const cardanoQuery = useCardanoMemecoin(isCardano ? tokenId : '');
  const rhQuery = useRobinhoodToken(isRobinhood ? tokenId : '');
  const cgChart = useMemecoinOhlc(!isRobinhood && !isCardano ? tokenId : '', interval.days);
  const cardanoChart = useCardanoMemecoinOhlc(isCardano ? tokenId : '', interval.days);
  const rhChart = useRobinhoodTokenOhlc(isRobinhood ? tokenId : '', interval.days);
  const rhTrades = useRobinhoodTokenTrades(isRobinhood ? tokenId : '', 40);

  const token = isRobinhood ? rhQuery.data : isCardano ? cardanoQuery.data : cgQuery.data;
  const isLoading = isRobinhood
    ? rhQuery.isLoading
    : isCardano
      ? cardanoQuery.isLoading
      : cgQuery.isLoading;
  const error = isRobinhood ? rhQuery.error : isCardano ? cardanoQuery.error : cgQuery.error;
  const chartData = isRobinhood ? rhChart.data : isCardano ? cardanoChart.data : cgChart.data;
  const chartLoading = isRobinhood
    ? rhChart.isLoading
    : isCardano
      ? cardanoChart.isLoading
      : cgChart.isLoading;

  const ticker = (token?.symbol || '').toUpperCase();
  const ohlcvData = chartData?.ohlcv || [];
  const positive = (token?.change_24h ?? 0) >= 0;

  const fmt = (field, opts) => {
    const map = {
      price: { usd: 'price_usd', eth: 'price_eth', ada: 'price_ada' },
      fdv: { usd: 'fdv', eth: 'fdv_eth', ada: 'fdv_ada' },
      mcap: { usd: 'market_cap', eth: 'market_cap_eth', ada: 'market_cap_ada' },
      volume: { usd: 'volume_24h', eth: 'volume_24h_eth', ada: 'volume_24h_ada' },
      liquidity: { usd: 'liquidity_usd', eth: 'liquidity_eth', ada: 'liquidity_ada' },
      high: { usd: 'high_24h', eth: 'high_24h_eth', ada: 'high_24h_ada' },
      low: { usd: 'low_24h', eth: 'low_24h_eth', ada: 'low_24h_ada' },
    };
    return formatTokenMoney(pickTokenAmount(token, pickByCurrency, map[field]), currency, currencySymbol, opts);
  };

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
    const rows = rhTrades.data?.trades || [];
    return rows.map(t => ({
      id: t.tx_hash,
      buy: t.kind === 'buy',
      amountLabel: `${t.kind === 'buy' ? '+' : '-'}${formatTokenAmount(t.amount_token)}`,
      price: t.price_usd,
      volume: t.volume_usd,
      ago: formatAgo(t.timestamp),
      href: t.tx_hash ? `https://robinhoodchain.blockscout.com/tx/${t.tx_hash}` : null,
    }));
  }, [rhTrades.data]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tokenId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex flex-col gap-4 pb-10">
        <Link to="/tokens" className="text-sm text-dark-100 hover:text-orange-400 transition-colors">
          ← Tokens
        </Link>
        <div className="text-center text-rose-400 py-8">Token not found</div>
      </div>
    );
  }

  const stats = isRobinhood
    ? [
        { label: 'Mcap', value: fmt('mcap') },
        { label: 'FDV', value: fmt('fdv') },
        { label: 'Liquidity', value: fmt('liquidity') },
        { label: 'Holders', value: token.holders_count != null ? String(token.holders_count) : '—' },
        { label: '24h Vol', value: fmt('volume') },
      ]
    : [
        { label: 'Mcap', value: fmt('mcap') },
        { label: 'FDV', value: fmt('fdv') },
        { label: '24h High', value: fmt('high', { price: true }) },
        { label: '24h Low', value: fmt('low', { price: true }) },
        { label: '24h Vol', value: fmt('volume') },
      ];

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <Link to="/tokens" className="text-sm text-dark-100 hover:text-orange-400 transition-colors">
          ← Tokens
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={token.image || '/favicon/favicon.ico'}
            alt={token.name}
            className="w-10 h-10 rounded-full object-cover bg-steel-750"
            onError={e => {
              e.currentTarget.src = '/favicon/favicon.ico';
            }}
          />
          <h1 className="font-russo text-xl md:text-2xl uppercase text-white truncate">
            {token.name} <span className="text-dark-100">{ticker}</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-steel-750 bg-steel-850 px-3 py-1.5 text-xs text-dark-100 hover:text-white transition-colors"
        >
          <span className="font-mono">{tokenId}</span>
          <Copy className="w-3.5 h-3.5" />
          {copied && <span className="text-emerald-400">Copied</span>}
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-steel-750 bg-steel-850 px-3 py-1.5 text-xs text-white">
          {isRobinhood ? 'Robinhood' : isCardano ? 'Cardano' : 'CoinGecko'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={
              isRobinhood
                ? `https://dexscreener.com/robinhood/${tokenId}`
                : isCardano
                  ? `https://cardanoscan.io/token/${tokenId}`
                  : `https://www.coingecko.com/en/coins/${tokenId}`
            }
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-lg border border-steel-750 bg-steel-850 text-dark-100 hover:text-white flex items-center justify-center"
            aria-label={
              isRobinhood ? 'Open on DexScreener' : isCardano ? 'Open on Cardanoscan' : 'Open on CoinGecko'
            }
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_300px] gap-4">
        <aside className="bg-steel-850 border border-steel-750 rounded-2xl p-4 flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white">Trades</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[560px]">
            {isRobinhood && rhTrades.isLoading && (
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
            {!rhTrades.isLoading && isRobinhood && !liveTrades.length && (
              <div className="text-sm text-dark-100 py-6 text-center">No recent trades</div>
            )}
            {!isRobinhood && (
              <div className="text-sm text-dark-100 py-6 text-center">
                Live trade feed is available on Robinhood tokens
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
                  interval.label === item.label
                    ? 'bg-steel-750 text-orange-400'
                    : 'text-dark-100 hover:text-white'
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="text-xs text-dark-100 ml-auto hidden sm:inline">Price · USD</span>
          </div>

          <VaultChart
            ohlcvData={ohlcvData}
            isLoading={chartLoading}
            isNotFound={!chartLoading && !ohlcvData.length}
            emptyMessage={
              isRobinhood
                ? 'No chart data available for this token yet'
                : 'No chart data available for this vault yet'
            }
          />
        </section>

        <aside className="flex flex-col gap-4">
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
