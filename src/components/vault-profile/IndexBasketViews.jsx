import { useEffect, useMemo, useRef, useState } from 'react';
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
// Inside the no-trade band a tile is neutral; past it the colour ramps smoothly from a muted
// to a full tone and saturates at DRIFT_ALERT_BPS. The band edge stays a visible step on purpose:
// it is where the next rebalance starts trading.
const DRIFT_RAMP = {
  over: { from: [92, 45, 18], to: [234, 88, 12] },
  under: { from: [30, 50, 90], to: [37, 99, 235] },
};
const mix = (from, to, t) => `rgb(${from.map((c, i) => Math.round(c + (to[i] - c) * t)).join(',')})`;
const driftFill = bps => {
  const abs = Math.abs(bps);
  if (abs < DRIFT_NOTICE_BPS) return 'var(--color-steel-800)';
  const t = Math.min(1, (abs - DRIFT_NOTICE_BPS) / (DRIFT_ALERT_BPS - DRIFT_NOTICE_BPS));
  const ramp = bps > 0 ? DRIFT_RAMP.over : DRIFT_RAMP.under;
  return mix(ramp.from, ramp.to, t);
};

const rampCss = r => `linear-gradient(to right, ${mix(r.from, r.to, 0)}, ${mix(r.from, r.to, 1)})`;
const underCss = r => `linear-gradient(to right, ${mix(r.from, r.to, 1)}, ${mix(r.from, r.to, 0)})`;

const DriftScale = () => (
  <div className="flex items-center justify-end gap-2 text-xs text-dark-100">
    <span>Under</span>
    <span className="flex h-3 w-48 overflow-hidden rounded-sm">
      <span className="flex-1" style={{ background: underCss(DRIFT_RAMP.under) }} />
      <span
        className="flex flex-[1.3] items-center justify-center bg-steel-800 text-[9px] leading-none"
        title="Assets this close to their target are not traded"
      >
        ±{formatBps(DRIFT_NOTICE_BPS)}
      </span>
      <span className="flex-1" style={{ background: rampCss(DRIFT_RAMP.over) }} />
    </span>
    <span>Over target</span>
  </div>
);

const driftLabel = bps =>
  Math.abs(bps) < DRIFT_NOTICE_BPS ? 'on target' : `${bps > 0 ? '+' : '−'}${formatBps(Math.abs(bps))}`;

/**
 * Squarified treemap (Bruls et al.): lays `items` (largest first) into a w×h rectangle so each
 * cell's area is proportional to its value and cells stay close to square.
 */
const squarify = (items, w, h) => {
  const total = items.reduce((t, i) => t + i.value, 0);
  if (!total || w <= 0 || h <= 0) return [];
  const scale = (w * h) / total;
  const out = [];
  let rect = { x: 0, y: 0, w, h };
  let row = [];

  const worst = (r, side) => {
    const sum = r.reduce((t, i) => t + i.area, 0);
    const max = Math.max(...r.map(i => i.area));
    const min = Math.min(...r.map(i => i.area));
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };

  const layoutRow = r => {
    const sum = r.reduce((t, i) => t + i.area, 0);
    const horizontal = rect.w >= rect.h; // the row runs along the short side
    const thick = sum / (horizontal ? rect.h : rect.w);
    let offset = 0;
    for (const i of r) {
      const len = i.area / thick;
      out.push(
        horizontal
          ? { ...i, x: rect.x, y: rect.y + offset, w: thick, h: len }
          : { ...i, x: rect.x + offset, y: rect.y, w: len, h: thick }
      );
      offset += len;
    }
    rect = horizontal
      ? { x: rect.x + thick, y: rect.y, w: rect.w - thick, h: rect.h }
      : { x: rect.x, y: rect.y + thick, w: rect.w, h: rect.h - thick };
  };

  for (const item of items.map(i => ({ ...i, area: i.value * scale }))) {
    const side = Math.min(rect.w, rect.h);
    if (row.length === 0 || worst([...row, item], side) <= worst(row, side)) {
      row.push(item);
    } else {
      layoutRow(row);
      row = [item];
    }
  }
  if (row.length) layoutRow(row);
  return out;
};

/** Token logo for a treemap cell; initials when the token has no image. */
const TileLogo = ({ asset, size }) =>
  asset.image ? (
    <img
      src={asset.image}
      alt=""
      className="flex-shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  ) : (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-black/30 font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {(asset.symbol || '?').slice(0, 2).toUpperCase()}
    </span>
  );

const useElementWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
};

/**
 * Market-map style treemap: cell area is the asset's current weight, colour is its drift from
 * target (not identity). Click a cell for details.
 */
export const BasketTiles = ({ assets, formatValue }) => {
  const [picked, setPicked] = useState(() => {
    const worst = [...assets].sort((a, b) => Math.abs(b.driftBps) - Math.abs(a.driftBps))[0];
    return worst?.assetAddress;
  });
  const sel = assets.find(a => a.assetAddress === picked) ?? assets[0];
  const [mapRef, width] = useElementWidth();
  const height = width >= 640 ? 320 : 288; // matches sm:h-80 / h-72
  const cells = useMemo(() => {
    // Before anything is bought every actual weight is 0; size by target then, so the map
    // shows the intended basket instead of a grid of identical blank squares.
    const empty = assets.every(a => !a.actualBps);
    return squarify(
      // Zero-weight assets still get a sliver so they stay clickable.
      assets
        .map(a => ({ asset: a, value: Math.max(empty ? a.targetBps : a.actualBps, 15) }))
        .sort((x, y) => y.value - x.value),
      width,
      height
    );
  }, [assets, width, height]);

  return (
    <div className="space-y-4">
      <DriftScale />
      <div ref={mapRef} className="relative h-72 w-full overflow-hidden rounded-lg sm:h-80">
        {cells.map(c => {
          const selected = c.asset.assetAddress === sel?.assetAddress;
          // Three tiers so a cell only shows what fits: large (logo + big text + drift),
          // medium (small logo + text), small (text only). Tiny cells rely on the tooltip.
          const tier =
            c.w >= 110 && c.h >= 112
              ? 'lg'
              : c.w >= 64 && c.h >= 84
                ? 'md'
                : c.w > 52 && c.h > 34
                  ? 'sm'
                  : c.w >= 30 && c.h >= 20
                    ? 'xs'
                    : null;
          return (
            <button
              key={c.asset.assetAddress}
              type="button"
              title={`${c.asset.symbol} · ${formatBps(c.asset.actualBps)} · target ${formatBps(c.asset.targetBps)}`}
              aria-pressed={selected}
              onClick={() => setPicked(c.asset.assetAddress)}
              className={cn(
                'absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border-2 p-0.5 text-center',
                selected ? 'z-10 border-white' : 'border-steel-950 hover:border-white/40'
              )}
              style={{ left: c.x, top: c.y, width: c.w, height: c.h, background: driftFill(c.asset.driftBps) }}
            >
              {(tier === 'lg' || tier === 'md') && <TileLogo asset={c.asset} size={tier === 'lg' ? 32 : 22} />}
              {tier === 'xs' && (
                <span className="w-full truncate text-[10px] font-semibold leading-none">{c.asset.symbol}</span>
              )}
              {tier && tier !== 'xs' && (
                <>
                  <span
                    className={cn(
                      'w-full truncate font-semibold leading-tight',
                      tier === 'lg' ? 'text-lg' : tier === 'md' ? 'text-sm' : 'text-xs'
                    )}
                  >
                    {c.asset.symbol}
                  </span>
                  <span
                    className={cn(
                      'tabular-nums leading-tight text-white/80',
                      tier === 'lg' ? 'text-sm' : 'text-[11px]'
                    )}
                  >
                    {formatBps(c.asset.actualBps)}
                    {tier === 'lg' && isDrifting(c.asset) && ` · ${driftLabel(c.asset.driftBps)}`}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
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
              'justify-self-start text-xs sm:justify-self-end sm:text-right',
              !isDrifting(sel) ? 'text-dark-100' : sel.driftBps > 0 ? 'text-orange-400' : 'text-sky-400'
            )}
          >
            {!isDrifting(sel)
              ? 'on target · not traded'
              : sel.driftBps > 0
                ? `${formatBps(sel.driftBps)} too much · next rebalance sells`
                : `${formatBps(-sel.driftBps)} too little · next rebalance buys`}
          </span>
        </div>
      )}
    </div>
  );
};

const driftSign = bps => (bps > 0 ? '+' : bps < 0 ? '−' : '');

/**
 * One thin bar per asset, diverging from zero, sorted from most over to most under target.
 * Hovering (or tapping) a row highlights it and fills the detail strip above the chart, so a
 * 50-asset chart stays readable. A large basket folds to its TOP_N biggest drifts.
 */
export const BasketDriftChart = ({ assets, formatValue }) => {
  const [activeId, setActiveId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const large = assets.length > LARGE_BASKET_ASSETS;
  const shown = useMemo(() => {
    const byDrift = [...assets].sort((a, b) => Math.abs(b.driftBps) - Math.abs(a.driftBps));
    const picked = large && !showAll ? byDrift.slice(0, TOP_N) : byDrift;
    return picked.sort((a, b) => b.driftBps - a.driftBps);
  }, [assets, large, showAll]);
  // Scale to the largest drift, but never tighter than the alert bound, so small drifts stay small.
  const range = Math.max(DRIFT_ALERT_BPS, ...assets.map(a => Math.abs(a.driftBps)));
  const active = assets.find(a => a.assetAddress === activeId);

  return (
    <div className="space-y-2" onMouseLeave={() => setActiveId(null)}>
      <div
        className="flex min-h-[3.25rem] items-center gap-3 rounded-lg bg-steel-850 px-3 py-2 text-sm"
        aria-live="polite"
      >
        {active ? (
          <>
            {active.image ? (
              <img src={active.image} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-steel-750 text-[10px] font-bold">
                {(active.symbol || '?').slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{active.symbol}</p>
              {active.name && active.name !== active.symbol && (
                <p className="truncate text-xs text-dark-100">{active.name}</p>
              )}
            </div>
            <div className="text-right tabular-nums">
              <p>
                {formatBps(active.actualBps)}
                <span className="text-xs text-dark-100"> of {formatBps(active.targetBps)}</span>
              </p>
              <p
                className={cn(
                  'text-xs',
                  active.driftBps > 0 ? 'text-orange-400' : active.driftBps < 0 ? 'text-blue-400' : 'text-dark-100'
                )}
              >
                {driftSign(active.driftBps)}
                {formatBps(Math.abs(active.driftBps))} {active.driftBps >= 0 ? 'over' : 'under'}
              </p>
            </div>
            {formatValue && <p className="hidden w-20 text-right tabular-nums sm:block">{formatValue(active)}</p>}
          </>
        ) : (
          <p className="text-dark-100">Hover or tap a bar to see the asset.</p>
        )}
      </div>

      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_4rem] pb-1 text-xs text-dark-100">
        <span />
        <div className="flex justify-between">
          <span>−{formatBps(range)} under</span>
          <span>0</span>
          <span>+{formatBps(range)} over</span>
        </div>
        <span />
      </div>
      <ul>
        {shown.map(a => {
          const w = (Math.abs(a.driftBps) / range) * 50;
          const strong = isDrifting(a);
          const isActive = a.assetAddress === activeId;
          const dimmed = activeId && !isActive;
          const fill = strong ? (a.driftBps > 0 ? '#FB923C' : '#60A5FA') : a.driftBps > 0 ? '#7C4A2A' : '#2F4A6B';
          return (
            <li key={a.assetAddress}>
              <button
                type="button"
                onMouseEnter={() => setActiveId(a.assetAddress)}
                onFocus={() => setActiveId(a.assetAddress)}
                onClick={() => setActiveId(id => (id === a.assetAddress ? null : a.assetAddress))}
                aria-pressed={isActive}
                className={cn(
                  'grid h-6 w-full grid-cols-[5.5rem_minmax(0,1fr)_4rem] items-center rounded px-1 text-left text-[11px] transition-opacity',
                  isActive && 'bg-steel-800',
                  dimmed && 'opacity-40'
                )}
              >
                <span className={cn('truncate', strong || isActive ? 'font-semibold text-white' : 'text-dark-100')}>
                  {a.symbol}
                </span>
                <span className="relative h-2.5">
                  <span className="absolute -bottom-1.5 -top-1.5 left-1/2 w-px bg-steel-700" />
                  <span
                    className="absolute top-0 h-full rounded-sm"
                    style={{
                      left: `${a.driftBps >= 0 ? 50 : 50 - w}%`,
                      width: `${Math.max(w, 0.4)}%`,
                      background: fill,
                    }}
                  />
                </span>
                <span className={cn('text-right tabular-nums', strong || isActive ? 'text-white' : 'text-dark-100')}>
                  {driftSign(a.driftBps)}
                  {formatBps(Math.abs(a.driftBps))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {large && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className="h-10 rounded-lg border border-steel-800 bg-steel-850 px-4 text-sm font-medium hover:border-steel-600"
          >
            {showAll ? `Show top ${TOP_N} drifts` : `Show all ${assets.length}`}
          </button>
        </div>
      )}
    </div>
  );
};
