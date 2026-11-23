import { useMemo, useState } from 'react';
import { LayoutGrid, List as ListIcon, Search, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatBps } from '@/components/vaults/index/indexVault.utils';

// Drift below this is noise and shown muted; above the second bound it is flagged.
// Both are shares of basket plus cash, in bps.
export const DRIFT_NOTICE_BPS = 200;
export const DRIFT_ALERT_BPS = 500;

/** From this many assets the summary cards and the List / Tiles / Drift switch appear. */
export const SWITCHER_MIN_ASSETS = 4;
/**
 * Above this many assets the basket is "large": the bar shows the top N plus one "Others"
 * segment, and the list gets search, filters, drift sort and a "Show all" fold.
 */
export const LARGE_BASKET_ASSETS = 12;
export const TOP_N = 10;

export const OTHERS_COLOR = '#64748B';

const VIEW_STORAGE_KEY = 'l4va:index-basket-view';
const VIEWS = [
  { id: 'list', label: 'List', Icon: ListIcon },
  { id: 'tiles', label: 'Tiles', Icon: LayoutGrid },
  { id: 'drift', label: 'Drift', Icon: SlidersHorizontal },
];

const readView = () => {
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return VIEWS.some(x => x.id === v) ? v : 'list';
  } catch {
    return 'list';
  }
};

/** The chosen basket view, remembered per browser. Falls back to List when storage is unavailable. */
export const useBasketView = () => {
  const [view, setViewState] = useState(readView);
  const setView = v => {
    setViewState(v);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, v);
    } catch {
      // Private mode or blocked storage: the choice just isn't remembered.
    }
  };
  return [view, setView];
};

export const isDrifting = a => Math.abs(a.driftBps) >= DRIFT_NOTICE_BPS;

export const ViewSwitch = ({ view, onChange }) => (
  <div role="group" aria-label="Basket view" className="flex gap-1 rounded-lg border border-steel-800 bg-steel-900 p-1">
    {VIEWS.map(({ id, label, Icon }) => (
      <button
        key={id}
        type="button"
        aria-pressed={view === id}
        onClick={() => onChange(id)}
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
          view === id ? 'bg-steel-750 text-white' : 'text-dark-100 hover:text-white'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    ))}
  </div>
);

const SummaryCard = ({ label, value, tone, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg border bg-steel-850 px-4 py-3 text-left',
        tone === 'warn' ? 'border-yellow-400/30' : 'border-steel-800',
        onClick && 'transition-colors hover:border-yellow-400/60'
      )}
    >
      <span className="text-xs text-dark-100">{label}</span>
      <span className={cn('truncate text-xl font-semibold tabular-nums', tone === 'warn' && 'text-yellow-400')}>
        {value}
      </span>
    </Tag>
  );
};

export const BasketSummary = ({ portfolio }) => {
  const assets = portfolio.assets;
  const drifting = assets.filter(isDrifting).length;
  const largest = assets.reduce((m, a) => (a.actualBps > (m?.actualBps ?? -1) ? a : m), null);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SummaryCard label="Assets" value={assets.length} />
      <SummaryCard label="On target" value={assets.length - drifting} />
      <SummaryCard label="Cash reserve" value={formatBps(portfolio.reserve.actualBps)} />
      <SummaryCard
        label="Largest position"
        value={largest ? `${largest.symbol} ${formatBps(largest.actualBps)}` : '—'}
      />
    </div>
  );
};

const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'drifting', label: 'Drifting', test: isDrifting },
  { id: 'over', label: 'Overweight', test: a => a.driftBps >= DRIFT_NOTICE_BPS },
  { id: 'under', label: 'Underweight', test: a => a.driftBps <= -DRIFT_NOTICE_BPS },
];

/**
 * Search, filter, sort-by-drift and a top-N fold for a large basket's holdings.
 * Returns the rows to render plus the controls; small baskets skip it and keep their order.
 */
export const useListControls = (assets, { filter, setFilter }) => {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(f => [f.id, assets.filter(f.test).length])), [assets]);
  const q = query.trim().toLowerCase();
  const matched = useMemo(() => {
    const test = FILTERS.find(f => f.id === filter)?.test ?? (() => true);
    return assets
      .filter(a => test(a))
      .filter(a => !q || a.symbol?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q))
      .sort((a, b) => Math.abs(b.driftBps) - Math.abs(a.driftBps) || b.actualBps - a.actualBps);
  }, [assets, filter, q]);
  const rows = showAll ? matched : matched.slice(0, TOP_N);

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex h-10 min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-steel-800 bg-steel-900 px-3">
        <Search className="h-4 w-4 text-dark-100" aria-hidden="true" />
        <span className="sr-only">Search assets</span>
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
          placeholder={`Search ${assets.length} assets`}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-dark-100"
        />
      </label>
      {FILTERS.map(f => (
        <button
          key={f.id}
          type="button"
          aria-pressed={filter === f.id}
          onClick={() => {
            setFilter(f.id);
            setShowAll(false);
          }}
          className={cn(
            'h-10 rounded-lg border px-3 text-sm font-medium transition-colors',
            filter === f.id
              ? 'border-green-500 bg-green-500/10 text-green-400'
              : 'border-steel-800 bg-steel-900 text-white hover:border-steel-600'
          )}
        >
          {f.label} <span className="tabular-nums text-dark-100">{counts[f.id]}</span>
        </button>
      ))}
    </div>
  );

  const footer =
    matched.length === 0 ? (
      <p className="py-4 text-center text-sm text-dark-100">No assets match.</p>
    ) : matched.length > TOP_N ? (
      <div className="flex justify-center pt-3">
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="h-10 rounded-lg border border-steel-800 bg-steel-850 px-4 text-sm font-medium hover:border-steel-600"
        >
          {showAll ? `Show top ${TOP_N}` : `Show all ${matched.length}`}
        </button>
      </div>
    ) : null;

  return { rows, controls, footer };
};

// Diverging drift colours: blue under target, orange over; the strong shade from the alert bound.
const driftFill = bps => {
  if (bps >= DRIFT_ALERT_BPS) return '#C2410C';
  if (bps >= DRIFT_NOTICE_BPS) return '#7C3A12';
  if (bps <= -DRIFT_ALERT_BPS) return '#1D4ED8';
  if (bps <= -DRIFT_NOTICE_BPS) return '#1E3A5F';
  return 'var(--color-steel-800)';
};

const DriftScale = () => (
  <div className="flex items-center justify-end gap-2 text-xs text-dark-100">
    <span>Under</span>
    {[-DRIFT_ALERT_BPS, -DRIFT_NOTICE_BPS, 0, DRIFT_NOTICE_BPS, DRIFT_ALERT_BPS].map(b => (
      <span key={b} className="h-3 w-5 rounded-sm" style={{ background: driftFill(b) }} />
    ))}
    <span>Over target</span>
  </div>
);

const driftLabel = bps =>
  Math.abs(bps) < DRIFT_NOTICE_BPS ? 'on target' : `${bps > 0 ? '+' : '−'}${formatBps(Math.abs(bps))}`;

/** Heat-map of equal tiles in basket order; colour is drift, not identity. Click for details. */
export const BasketTiles = ({ assets, formatValue }) => {
  const [picked, setPicked] = useState(() => {
    const worst = [...assets].sort((a, b) => Math.abs(b.driftBps) - Math.abs(a.driftBps))[0];
    return worst?.assetAddress;
  });
  const sel = assets.find(a => a.assetAddress === picked) ?? assets[0];

  return (
    <div className="space-y-4">
      <DriftScale />
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
        {assets.map(a => (
          <li key={a.assetAddress}>
            <button
              type="button"
              aria-pressed={a.assetAddress === sel?.assetAddress}
              onClick={() => setPicked(a.assetAddress)}
              className={cn(
                'flex h-[4.5rem] w-full flex-col items-start justify-between rounded-lg border-2 px-2.5 py-2 text-left',
                a.assetAddress === sel?.assetAddress ? 'border-white' : 'border-transparent hover:border-white/40'
              )}
              style={{ background: driftFill(a.driftBps) }}
            >
              <span className="w-full truncate text-sm font-semibold">{a.symbol}</span>
              <span className="text-xs tabular-nums text-white/80">{formatBps(a.actualBps)}</span>
            </button>
          </li>
        ))}
      </ul>
      {sel && (
        <div className="grid grid-cols-2 items-center gap-4 rounded-lg border border-steel-800 bg-steel-850 px-4 py-3 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
          <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
            {sel.image ? (
              <img src={sel.image} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel-750 text-xs font-bold">
                {(sel.symbol || '?').slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{sel.symbol}</p>
              {sel.name && sel.name !== sel.symbol && <p className="truncate text-xs text-dark-100">{sel.name}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs text-dark-100">Weight</p>
            <p className="font-semibold tabular-nums">{formatBps(sel.actualBps)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-100">Target</p>
            <p className="font-semibold tabular-nums">{formatBps(sel.targetBps)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-100">Value</p>
            <p className="font-semibold tabular-nums">{formatValue(sel)}</p>
          </div>
          <span
            className={cn(
              'justify-self-start rounded-full px-2.5 py-1 text-xs font-medium tabular-nums sm:justify-self-end',
              !isDrifting(sel)
                ? 'bg-steel-800 text-dark-100'
                : sel.driftBps > 0
                  ? 'bg-orange-400/15 text-orange-300'
                  : 'bg-blue-400/15 text-blue-300'
            )}
          >
            {driftLabel(sel.driftBps)}
          </span>
        </div>
      )}
    </div>
  );
};

/** One thin bar per asset, diverging from zero, sorted from most over to most under target. */
export const BasketDriftChart = ({ assets }) => {
  const rows = [...assets].sort((a, b) => b.driftBps - a.driftBps);
  // Scale to the largest drift, but never tighter than the alert bound, so small drifts stay small.
  const range = Math.max(DRIFT_ALERT_BPS, ...rows.map(a => Math.abs(a.driftBps)));
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_4rem] pb-2 text-xs text-dark-100">
        <span />
        <div className="flex justify-between">
          <span>−{formatBps(range)} under</span>
          <span>0</span>
          <span>+{formatBps(range)} over</span>
        </div>
        <span />
      </div>
      <ul className="space-y-0.5">
        {rows.map(a => {
          const w = (Math.abs(a.driftBps) / range) * 50;
          const strong = isDrifting(a);
          const fill = strong ? (a.driftBps > 0 ? '#FB923C' : '#60A5FA') : a.driftBps > 0 ? '#7C4A2A' : '#2F4A6B';
          return (
            <li
              key={a.assetAddress}
              className="grid h-4 grid-cols-[5.5rem_minmax(0,1fr)_4rem] items-center text-[11px]"
              title={`${a.symbol}: ${formatBps(a.actualBps)} of ${formatBps(a.targetBps)}`}
            >
              <span className={cn('truncate', strong ? 'font-semibold text-white' : 'text-dark-100')}>{a.symbol}</span>
              <span className="relative h-2.5">
                <span className="absolute -bottom-1 -top-1 left-1/2 w-px bg-steel-700" />
                <span
                  className="absolute top-0 h-full rounded-sm"
                  style={{
                    left: `${a.driftBps >= 0 ? 50 : 50 - w}%`,
                    width: `${Math.max(w, 0.4)}%`,
                    background: fill,
                  }}
                />
              </span>
              <span className={cn('text-right tabular-nums', strong ? 'text-white' : 'text-dark-100')}>
                {a.driftBps > 0 ? '+' : a.driftBps < 0 ? '−' : ''}
                {formatBps(Math.abs(a.driftBps))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
