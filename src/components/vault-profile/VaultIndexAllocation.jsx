import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info, Layers, PieChart, RefreshCcw, Wallet } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { Spinner } from '@/components/Spinner';
import { useVaultIndex } from '@/services/api/queries';
import { BasketAllocationBar } from '@/components/vaults/index/IndexBasketEditor';
import {
  BasketDriftChart,
  BasketSummary,
  BasketTiles,
  DRIFT_ALERT_BPS,
  DRIFT_NOTICE_BPS,
  LARGE_BASKET_ASSETS,
  OTHERS_COLOR,
  SWITCHER_MIN_ASSETS,
  TOP_N,
  ViewSwitch,
  useBasketView,
  useListControls,
} from '@/components/vault-profile/IndexBasketViews';
import {
  REBALANCE_STATUS_STYLES,
  REBALANCE_TRIGGER_LABELS,
  formatBps,
  formatNativeWei,
  formatRebalanceSchedule,
  basketSegmentColor,
} from '@/components/vaults/index/indexVault.utils';
import { getTransactionUrl } from '@/utils/explorer.utils';
import { ChainType } from '@/utils/types';
import { formatDateWithTime, formatNum } from '@/utils/core.utils';

const OUTSIDE_BASKET_COLOR = '#64748B';
const RESERVE_COLOR = 'var(--color-steel-600)';

// Hover tooltip on desktop; on touch it toggles on tap (iOS Safari never focuses a tapped
// button, so `focus-within` alone left it unopenable on phones) and closes on any outside tap.
const InfoTip = ({ children, align = 'left', icon: Icon = Info, iconClassName = 'h-4 w-4' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = e => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <span ref={ref} className="group relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="text-dark-100 hover:text-white focus:text-white"
      >
        <Icon className={iconClassName} />
      </button>
      <span
        role="tooltip"
        className={cn(
          // `hidden` (not opacity-0) so the closed tooltip takes no layout space: an invisible
          // 16rem box near the card edge widened the page on phones.
          'pointer-events-none absolute top-full z-20 mt-2 w-64 max-w-[calc(100vw-3rem)] rounded-lg bg-steel-850 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg group-hover:block group-focus-within:block',
          open ? 'block' : 'hidden',
          align === 'right' ? 'right-0' : '-left-2'
        )}
      >
        {children}
      </span>
    </span>
  );
};

const TokenIcon = ({ asset }) =>
  asset.image ? (
    <img src={asset.image} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" loading="lazy" />
  ) : (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-steel-750 text-xs font-bold">
      {(asset.symbol || '?').slice(0, 2).toUpperCase()}
    </span>
  );

const TokenCell = ({ asset, color }) => (
  <div className="flex items-center gap-3 min-w-0">
    <span className="h-6 w-1 flex-shrink-0 rounded-full" style={{ background: color }} />
    <TokenIcon asset={asset} />
    <div className="min-w-0">
      <p className="truncate font-medium">{asset.symbol}</p>
      {asset.name && asset.name !== asset.symbol && <p className="truncate text-xs text-dark-100">{asset.name}</p>}
    </div>
  </div>
);

const DriftChip = ({ driftBps }) => {
  const abs = Math.abs(driftBps);
  if (abs < DRIFT_NOTICE_BPS) return <span className="text-xs text-dark-100">on target</span>;
  const tone = abs < DRIFT_ALERT_BPS ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400';
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium tabular-nums', tone)}>
      {driftBps > 0 ? '+' : '−'}
      {formatBps(abs)}
    </span>
  );
};

/**
 * One bar of actual weights, with a tick at each cumulative target boundary:
 * a segment edge sitting off its tick is the drift.
 */
const AllocationBar = ({ segments }) => {
  let targetEdge = 0;
  const ticks = segments.slice(0, -1).map(s => (targetEdge += s.targetBps) / 100);
  return (
    <div className="relative py-1">
      <div className="flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-steel-800">
        {segments.map(s => (
          <div
            key={s.key}
            title={`${s.label}: ${formatBps(s.actualBps)} (target ${formatBps(s.targetBps)})`}
            style={{ width: `${s.actualBps / 100}%`, background: s.color }}
          />
        ))}
      </div>
      {ticks.map((left, i) => (
        <span
          key={i}
          className="absolute top-0 h-[18px] w-0.5 -translate-x-1/2 rounded-full bg-white/80"
          style={{ left: `${left}%` }}
        />
      ))}
    </div>
  );
};

const TargetBasket = ({ config }) => (
  <div className="space-y-4">
    <BasketAllocationBar targets={config.targets} reserveBps={config.reserveBps} />
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {config.targets.map((t, i) => (
        <li key={t.assetAddress} className="flex items-center justify-between gap-3 rounded-lg bg-steel-850 px-3 py-2">
          <TokenCell asset={t} color={basketSegmentColor(i)} />
          <span className="font-medium tabular-nums">{formatBps(t.weightBps)}</span>
        </li>
      ))}
      {config.reserveBps > 0 && (
        <li className="flex items-center justify-between gap-3 rounded-lg bg-steel-850 px-3 py-2">
          <span className="flex items-center gap-2 text-dark-100">
            <Wallet className="h-4 w-4" />
            Cash reserve (ETH)
          </span>
          <span className="font-medium tabular-nums">{formatBps(config.reserveBps)}</span>
        </li>
      )}
    </ul>
  </div>
);

const ROW_GRID = 'sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_5.5rem_7rem] sm:gap-x-4';

// Statuses in which the vault already holds its basket (mirrors the API's HOLDING_STATUSES).
const HOLDING_STATUSES = ['locked', 'expansion', 'acquire_expansion', 'terminating'];

const Bone = ({ className }) => <span className={cn('block animate-pulse rounded bg-steel-800', className)} />;

// Stacks weight, drift and value on the right on phones; four columns from sm up.
const HoldingRow = ({ asset, actualBps, targetBps, driftBps, value, note }) => (
  <li className={cn('flex items-center gap-4 py-3', ROW_GRID)}>
    <div className="min-w-0 flex-1">
      {asset}
      {note && <p className="mt-1 text-xs text-yellow-400">{note}</p>}
    </div>
    {actualBps == null ? (
      <div className="flex flex-col items-end gap-2 sm:contents">
        <Bone className="h-4 w-16 sm:justify-self-end" />
        <Bone className="h-4 w-12 sm:justify-self-end" />
        <Bone className="h-4 w-14 sm:justify-self-end" />
      </div>
    ) : (
      <div className="flex flex-col items-end gap-1 text-right sm:contents">
        <p className="tabular-nums sm:text-right">
          <span className="font-medium">{formatBps(actualBps)}</span>
          <span className="text-xs text-dark-100"> of {formatBps(targetBps)}</span>
        </p>
        <div className="sm:text-right">
          <DriftChip driftBps={driftBps} />
        </div>
        <p className="text-sm tabular-nums text-dark-100 sm:text-base sm:text-right sm:text-white">{value}</p>
      </div>
    )}
  </li>
);

/**
 * Placeholder for a vault that holds assets while its live portfolio loads: the loaded view's
 * layout (summary, bar, top rows), so nothing jumps and the pre-lock "buys these assets" copy never
 * shows for a locked vault. Rows are capped at TOP_N like the loaded list, so a 50-asset basket
 * does not render 50 rows that then collapse.
 */
const HoldingsSkeleton = ({ config, showSummary }) => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading basket">
    {showSummary && (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="space-y-3 rounded-lg bg-steel-850 px-4 py-3">
            <Bone className="h-3 w-16" />
            <Bone className="h-6 w-20" />
          </div>
        ))}
      </div>
    )}
    <Bone className="h-2.5 w-full rounded-full" />
    <ul className="divide-y divide-steel-800 border-y border-steel-800">
      {config.targets.slice(0, TOP_N).map((t, i) => (
        <HoldingRow
          key={t.assetAddress}
          asset={<TokenCell asset={t} color={basketSegmentColor(i)} />}
          actualBps={null}
        />
      ))}
    </ul>
  </div>
);

const skippedTradeMessage = leg => {
  const action = leg.side === 'sell' ? 'Sell' : 'Buy';
  if (leg.reason === 'below_min_trade') {
    return `${leg.symbol} ${action.toLowerCase()} skipped: ${formatNativeWei(leg.valueNative)} ETH is below the ${formatNativeWei(leg.minTradeNative)} ETH minimum trade.`;
  }
  if (leg.reason === 'no_free_native') {
    return `${leg.symbol} ${action.toLowerCase()} skipped: ${formatNativeWei(leg.valueNative)} ETH was needed, but no ETH was available above the cash reserve.`;
  }
  if (leg.reason === 'no_route') {
    return `${leg.symbol} ${action.toLowerCase()} skipped: Uniswap had no route the vault can trade${leg.detail ? ` (${leg.detail})` : ''}.`;
  }
  return null;
};

const legSymbol = (leg, symbols) => {
  const asset = (leg.side === 'sell' ? leg.assetIn : leg.assetOut)?.toLowerCase();
  return leg.symbol || symbols.get(asset) || (asset ? `${asset.slice(0, 6)}…${asset.slice(-4)}` : '');
};

// Trades are collapsed behind a toggle: an initial buy has one leg per asset, and a row of
// identical "Buy" links was unreadable.
const RebalanceTrades = ({ legs, symbols }) => {
  const [open, setOpen] = useState(false);
  if (!legs.length) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-xs text-dark-100 underline-offset-2 hover:text-white hover:underline"
      >
        {open ? 'Hide transactions' : `Show ${legs.length} transaction${legs.length === 1 ? '' : 's'}`}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3 lg:grid-cols-4">
          {legs.map(l => (
            <a
              key={l.operationId}
              href={getTransactionUrl(l.txHash, ChainType.ROBINHOOD)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-dark-100 underline-offset-2 hover:text-white hover:underline"
            >
              <span className="capitalize">{l.side}</span>
              <span className="truncate text-white">{legSymbol(l, symbols)}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const RebalanceHistory = ({ rebalances, assets = [] }) => {
  if (!rebalances?.length) return null;
  const symbols = new Map(
    assets.filter(a => a?.assetAddress && a.symbol).map(a => [a.assetAddress.toLowerCase(), a.symbol])
  );
  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <RefreshCcw className="h-4 w-4 text-dark-100" />
        Rebalance history
      </h4>
      <ul className="space-y-2">
        {rebalances.map(run => {
          const traded = run.legs.filter(l => l.status === 'confirmed');
          const blocked = (run.skipped || []).filter(l => l.reason !== 'within_tolerance');
          const completedWithWarnings = run.status === 'completed' && blocked.length > 0;
          return (
            <li key={run.id} className="rounded-lg bg-steel-850 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{REBALANCE_TRIGGER_LABELS[run.trigger] || run.trigger}</span>
                <span
                  className={cn(
                    'text-sm capitalize',
                    completedWithWarnings ? 'text-yellow-400' : REBALANCE_STATUS_STYLES[run.status]
                  )}
                >
                  {completedWithWarnings ? 'completed with warnings' : run.status}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-100">
                <span>{formatDateWithTime(run.completedAt || run.createdAt)}</span>
                <span>
                  {traded.length} trade{traded.length === 1 ? '' : 's'}
                </span>
                {run.navNative && <span>NAV at start: {formatNativeWei(run.navNative)} ETH</span>}
              </div>
              <RebalanceTrades legs={traded.filter(l => l.txHash)} symbols={symbols} />
              {run.status === 'failed' && (
                <p className="mt-2 text-xs text-red-400">
                  Trading paused before the basket was complete. It will be retried; funds stay in the vault.
                </p>
              )}
              {blocked.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-yellow-400">
                  {blocked.map((leg, index) => (
                    <li key={`${leg.asset}-${leg.side}-${leg.reason}-${index}`}>{skippedTradeMessage(leg)}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Presentational basket view, fed by `VaultIndexAllocation` (live data) or by
 * the dev mock page. `formatValue` renders a `{ valueNative, valueUsd, valueAda }`.
 */
/**
 * ETH the vault must hold after its LP share for every basket asset to clear the minimum trade:
 * the smallest-weight asset's slice of the investable (non-reserve) part must reach `minTradeNative`.
 */
const minBasketNativeWei = (config, minTradeNative) => {
  if (!minTradeNative || !config?.targets?.length) return null;
  const minWeight = Math.min(...config.targets.map(t => Number(t.weightBps) || 0));
  const investableBps = 10000 - (Number(config.reserveBps) || 0);
  if (minWeight <= 0 || investableBps <= 0) return null;
  // minTrade × 10⁴/minWeight × 10⁴/investable, rounded up.
  const denom = BigInt(minWeight) * BigInt(investableBps);
  return (BigInt(minTradeNative) * 10n ** 8n + denom - 1n) / denom;
};

const MinBasketSizeNote = ({ config, minTradeNative }) => {
  const minWei = minBasketNativeWei(config, minTradeNative);
  if (!minWei) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        To buy all {config.targets.length} assets, the vault needs at least ~{formatNativeWei(minWei)} ETH after the
        liquidity pool share: each trade must be at least {formatNativeWei(minTradeNative)} ETH. With less, assets below
        that size are skipped and their share stays in ETH.
      </span>
    </div>
  );
};

export const VaultIndexAllocationView = ({
  config,
  portfolio,
  rebalances,
  error,
  formatValue,
  terminated = false,
  minTradeNative,
  loadingHoldings = false,
}) => {
  // Hooks first: the early return below must not change their order.
  const [storedView, setView] = useBasketView();
  const [filter, setFilter] = useState('all');
  const holdings = portfolio && !portfolio.error ? portfolio.assets : [];
  const list = useListControls(holdings, { filter, setFilter });

  if (!config?.targets?.length) {
    return error ? <p className="py-6 text-center text-dark-100">The index basket could not be loaded.</p> : null;
  }

  const hasHoldings = holdings.length > 0;
  // A large basket colours only its top N by weight; the rest share one "Others" colour, since a
  // 15-colour palette repeating across 50 assets would no longer tell tokens apart.
  const large = holdings.length > LARGE_BASKET_ASSETS;
  const showSwitcher = holdings.length >= SWITCHER_MIN_ASSETS;
  const view = showSwitcher ? storedView : 'list';
  const topRank = new Map(
    [...holdings]
      .sort((a, b) => b.actualBps - a.actualBps)
      .slice(0, TOP_N)
      .map((a, i) => [a.assetAddress, i])
  );
  const colorFor = asset => {
    if (large)
      return topRank.has(asset.assetAddress) ? basketSegmentColor(topRank.get(asset.assetAddress)) : OTHERS_COLOR;
    const idx = config.targets.findIndex(c => c.assetAddress === asset.assetAddress);
    return idx >= 0 ? basketSegmentColor(idx) : OUTSIDE_BASKET_COLOR;
  };
  const others = large ? holdings.filter(a => !topRank.has(a.assetAddress)) : [];
  const assetSegments = large
    ? [
        ...holdings
          .filter(a => topRank.has(a.assetAddress))
          .sort((a, b) => topRank.get(a.assetAddress) - topRank.get(b.assetAddress)),
        {
          assetAddress: 'others',
          symbol: `${others.length} others`,
          actualBps: others.reduce((n, a) => n + a.actualBps, 0),
          targetBps: others.reduce((n, a) => n + a.targetBps, 0),
        },
      ]
    : holdings;
  const segments = hasHoldings
    ? [
        ...assetSegments.map(a => ({
          key: a.assetAddress,
          label: a.symbol,
          actualBps: a.actualBps,
          targetBps: a.targetBps,
          color: a.assetAddress === 'others' ? OTHERS_COLOR : colorFor(a),
        })),
        {
          key: 'reserve',
          label: 'Cash',
          actualBps: portfolio.reserve.actualBps,
          targetBps: portfolio.reserve.targetBps,
          color: RESERVE_COLOR,
        },
      ]
    : [];

  return (
    <section className="mb-8 space-y-6 rounded-xl border border-steel-800 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <InfoTip icon={PieChart} iconClassName="h-5 w-5">
            Values are live swap quotes into ETH, refreshed every minute. Ticks on the bar mark target weights; drift is
            actual minus target, as a share of basket plus cash.
          </InfoTip>
          <h3 className="text-lg font-semibold">Index basket</h3>
          {config.version > 1 && <span className="text-xs text-dark-100">v{config.version} · set by governance</span>}
        </div>
        {hasHoldings && showSwitcher && <ViewSwitch view={view} onChange={setView} />}
      </div>

      {!hasHoldings && loadingHoldings ? (
        <HoldingsSkeleton config={config} showSummary={config.targets.length >= SWITCHER_MIN_ASSETS} />
      ) : !hasHoldings ? (
        <>
          <p className="text-sm text-dark-100">
            {terminated
              ? 'This vault was terminated and its holdings were distributed to VT holders. These were its target weights.'
              : portfolio?.error
                ? `${portfolio.error}. Showing the target weights.`
                : 'When the acquire window locks, the vault buys these assets with the ETH raised, at these weights.'}
          </p>
          {!terminated && <MinBasketSizeNote config={config} minTradeNative={minTradeNative} />}
          <TargetBasket config={config} />
        </>
      ) : (
        <>
          {showSwitcher && <BasketSummary portfolio={portfolio} />}

          <div className="space-y-3">
            <AllocationBar segments={segments} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-100">
              {segments.map(s => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                  <span className="tabular-nums text-white">{formatBps(s.actualBps)}</span>
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-0.5 rounded-full bg-white/80" />
                target
              </span>
            </div>
          </div>

          {view === 'tiles' && <BasketTiles assets={holdings} formatValue={formatValue} />}
          {view === 'drift' && <BasketDriftChart assets={holdings} formatValue={formatValue} />}

          {view === 'list' && (
            <div className="space-y-3">
              {large && list.controls}
              <div>
                <div className={cn('hidden pb-2 text-xs text-dark-100', ROW_GRID)}>
                  <span>Asset</span>
                  <span className="text-right">Weight</span>
                  <span className="text-right">Drift</span>
                  <span className="text-right">Value</span>
                </div>
                <ul className="divide-y divide-steel-800 border-y border-steel-800">
                  {(large ? list.rows : holdings).map(asset => (
                    <HoldingRow
                      key={asset.assetAddress}
                      asset={<TokenCell asset={asset} color={colorFor(asset)} />}
                      note={!asset.inBasket && 'Leaving the basket — sold at the next rebalance'}
                      actualBps={asset.actualBps}
                      targetBps={asset.targetBps}
                      driftBps={asset.driftBps}
                      value={formatValue(asset)}
                    />
                  ))}
                  {(!large || filter === 'all') && (
                    <HoldingRow
                      asset={
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-1 flex-shrink-0 rounded-full" style={{ background: RESERVE_COLOR }} />
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel-750">
                            <Wallet className="h-4 w-4 text-dark-100" />
                          </span>
                          <div>
                            <p className="font-medium">Cash reserve</p>
                            <p className="text-xs text-dark-100">ETH</p>
                          </div>
                        </div>
                      }
                      actualBps={portfolio.reserve.actualBps}
                      targetBps={portfolio.reserve.targetBps}
                      driftBps={portfolio.reserve.actualBps - portfolio.reserve.targetBps}
                      value={formatValue(portfolio.reserve)}
                    />
                  )}
                </ul>
              </div>
              {large && list.footer}
            </div>
          )}

          {portfolio.lp && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-steel-850 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-dark-100">
                <Layers className="h-4 w-4" />
                Also held · Liquidity pool position
                <InfoTip>Valued at the pool price. Not counted in the basket weights.</InfoTip>
              </span>
              <span className="tabular-nums">{formatValue(portfolio.lp)}</span>
            </div>
          )}
        </>
      )}

      {!terminated && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-steel-850 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-dark-100">
            <RefreshCcw className="h-4 w-4" />
            Auto-rebalance
            <InfoTip>
              Trades the basket back to its target weights by USD value once per period. The exact time is randomized
              within a few hours. Token holders can change this through a re-weight proposal.
            </InfoTip>
          </span>
          <span className="tabular-nums">
            {formatRebalanceSchedule(config)}
            {config.autoRebalance && config.nextRebalanceAt && (
              <span className="text-dark-100"> · next ~{formatDateWithTime(config.nextRebalanceAt)}</span>
            )}
          </span>
        </div>
      )}

      <RebalanceHistory rebalances={rebalances} assets={[...config.targets, ...holdings]} />
    </section>
  );
};

/**
 * Index-weighted vault basket: target weights before lock, live target vs
 * actual allocation after the vault has bought its basket.
 */
export const VaultIndexAllocation = ({ vault }) => {
  const { data, isLoading, error } = useVaultIndex(vault?.id);
  const { currency, currencySymbol, pickByCurrency } = useCurrency();
  // Portfolio values carry native wei plus USD/ADA; ETH stays exact from wei.
  const formatValue = v =>
    currency === 'eth'
      ? `${formatNativeWei(v.valueNative)} ETH`
      : `${currencySymbol}${formatNum(pickByCurrency({ ada: v.valueAda, usd: v.valueUsd, eth: 0 }) ?? 0)}`;
  const config = data?.config || vault?.indexConfig;

  if (isLoading && !config) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <VaultIndexAllocationView
      config={config}
      portfolio={data?.portfolio}
      rebalances={data?.rebalances}
      error={error}
      formatValue={formatValue}
      terminated={vault?.vaultStatus === 'burned'}
      minTradeNative={data?.minTradeNative}
      loadingHoldings={isLoading && HOLDING_STATUSES.includes(vault?.vaultStatus)}
    />
  );
};
