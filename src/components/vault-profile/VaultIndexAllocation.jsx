import { ExternalLink, Info, Layers, PieChart, RefreshCcw, Wallet } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { Spinner } from '@/components/Spinner';
import { useVaultIndex } from '@/services/api/queries';
import { BasketAllocationBar } from '@/components/vaults/index/IndexBasketEditor';
import {
  REBALANCE_STATUS_STYLES,
  REBALANCE_TRIGGER_LABELS,
  formatBps,
  formatNativeWei,
  basketSegmentColor,
} from '@/components/vaults/index/indexVault.utils';
import { getTransactionUrl } from '@/utils/explorer.utils';
import { ChainType } from '@/utils/types';
import { formatDateWithTime, formatNum } from '@/utils/core.utils';

// Drift below this is noise and shown muted; above the second bound it is flagged.
const DRIFT_NOTICE_BPS = 200;
const DRIFT_ALERT_BPS = 500;
const OUTSIDE_BASKET_COLOR = '#64748B';
const RESERVE_COLOR = 'var(--color-steel-600)';

// Same hover tooltip as the profile icon row; also opens on keyboard focus / tap.
const InfoTip = ({ children, align = 'left' }) => (
  <span className="group relative inline-flex">
    <button type="button" aria-label="More info" className="text-dark-100 hover:text-white focus:text-white">
      <Info className="h-4 w-4" />
    </button>
    <span
      role="tooltip"
      className={cn(
        'pointer-events-none absolute top-full z-20 mt-2 w-64 rounded-lg bg-steel-850 px-3 py-2 text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100',
        align === 'right' ? 'right-0' : '-left-2'
      )}
    >
      {children}
    </span>
  </span>
);

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

const basketStatus = (portfolio, rebalances) => {
  if (rebalances?.some(r => r.status === 'executing' || r.status === 'pending')) {
    return { label: 'Rebalancing', className: 'bg-yellow-400/10 text-yellow-400' };
  }
  const drifts = [...portfolio.assets.map(a => a.driftBps), portfolio.reserve.actualBps - portfolio.reserve.targetBps];
  const worst = Math.max(...drifts.map(Math.abs));
  if (portfolio.assets.some(a => !a.inBasket) || worst >= DRIFT_ALERT_BPS) {
    return { label: 'Off target', className: 'bg-red-400/10 text-red-400' };
  }
  if (worst >= DRIFT_NOTICE_BPS) return { label: 'Drifting', className: 'bg-yellow-400/10 text-yellow-400' };
  return { label: 'On target', className: 'bg-green-500/10 text-green-500' };
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

// Stacks weight, drift and value on the right on phones; four columns from sm up.
const HoldingRow = ({ asset, actualBps, targetBps, driftBps, value, note }) => (
  <li className={cn('flex items-center gap-4 py-3', ROW_GRID)}>
    <div className="min-w-0 flex-1">
      {asset}
      {note && <p className="mt-1 text-xs text-yellow-400">{note}</p>}
    </div>
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
  </li>
);

const RebalanceHistory = ({ rebalances }) => {
  if (!rebalances?.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <RefreshCcw className="h-4 w-4 text-dark-100" />
        Rebalance history
      </h4>
      <ul className="space-y-2">
        {rebalances.map(run => {
          const traded = run.legs.filter(l => l.status === 'confirmed');
          return (
            <li key={run.id} className="rounded-lg bg-steel-850 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{REBALANCE_TRIGGER_LABELS[run.trigger] || run.trigger}</span>
                <span className={cn('text-sm capitalize', REBALANCE_STATUS_STYLES[run.status])}>{run.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-100">
                <span>{formatDateWithTime(run.completedAt || run.createdAt)}</span>
                <span>
                  {traded.length} trade{traded.length === 1 ? '' : 's'}
                </span>
                {run.navNative && <span>NAV at start: {formatNativeWei(run.navNative)} ETH</span>}
                {traded
                  .filter(l => l.txHash)
                  .map(l => (
                    <a
                      key={l.operationId}
                      href={getTransactionUrl(l.txHash, ChainType.ROBINHOOD)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 capitalize text-dark-100 underline-offset-2 hover:text-white hover:underline"
                    >
                      {l.side} {l.symbol} <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
              </div>
              {run.status === 'failed' && (
                <p className="mt-2 text-xs text-red-400">
                  Trading paused before the basket was complete. It will be retried; funds stay in the vault.
                </p>
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
export const VaultIndexAllocationView = ({ config, portfolio, rebalances, error, formatValue }) => {
  if (!config?.targets?.length) {
    return error ? <p className="py-6 text-center text-dark-100">The index basket could not be loaded.</p> : null;
  }

  const hasHoldings = portfolio && !portfolio.error && portfolio.assets.length > 0;
  const status = hasHoldings ? basketStatus(portfolio, rebalances) : null;
  const colorFor = asset => {
    const idx = config.targets.findIndex(c => c.assetAddress === asset.assetAddress);
    return idx >= 0 ? basketSegmentColor(idx) : OUTSIDE_BASKET_COLOR;
  };
  const segments = hasHoldings
    ? [
        ...portfolio.assets.map(a => ({
          key: a.assetAddress,
          label: a.symbol,
          actualBps: a.actualBps,
          targetBps: a.targetBps,
          color: colorFor(a),
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
          <PieChart className="h-5 w-5 text-dark-100" />
          <h3 className="text-lg font-semibold">Index basket</h3>
          {config.version > 1 && <span className="text-xs text-dark-100">v{config.version} · set by governance</span>}
        </div>
        {status && (
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', status.className)}>{status.label}</span>
            <InfoTip align="right">
              Values are live swap quotes into ETH, refreshed every minute. Ticks on the bar mark target weights; drift
              is actual minus target, as a share of basket plus cash.
            </InfoTip>
          </div>
        )}
      </div>

      {!hasHoldings ? (
        <>
          <p className="text-sm text-dark-100">
            {portfolio?.error
              ? `${portfolio.error}. Showing the target weights.`
              : 'When the acquire window locks, the vault buys these assets with the ETH raised, at these weights.'}
          </p>
          <TargetBasket config={config} />
        </>
      ) : (
        <>
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

          <div>
            <div className={cn('hidden pb-2 text-xs text-dark-100', ROW_GRID)}>
              <span>Asset</span>
              <span className="text-right">Weight</span>
              <span className="text-right">Drift</span>
              <span className="text-right">Value</span>
            </div>
            <ul className="divide-y divide-steel-800 border-y border-steel-800">
              {portfolio.assets.map(asset => (
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
            </ul>
          </div>

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

      <RebalanceHistory rebalances={rebalances} />
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
    />
  );
};
