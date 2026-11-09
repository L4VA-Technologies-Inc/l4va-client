import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, RotateCw, Shuffle, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AssetSearchInput } from '@/components/shared/AssetSearchInput';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { useAssetSource } from '@/hooks/useAssetSource';
import { indexAssetRoutesQuery, useIndexSupportedAssets } from '@/services/api/queries';
import {
  BPS,
  INDEX_DEFAULT_REBALANCE_CADENCE_DAYS,
  INDEX_MAX_ASSETS,
  INDEX_MAX_REBALANCE_CADENCE_DAYS,
  INDEX_MAX_RESERVE_BPS,
  INDEX_MIN_REBALANCE_CADENCE_DAYS,
  bpsToPercent,
  evenWeights,
  formatBps,
  percentToBps,
  basketSegmentColor,
  totalWeightBps,
} from '@/components/vaults/index/indexVault.utils';

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

// Hides the native number-input spinner arrows (WebKit and Firefox).
const noSpinner =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const shortAddress = address => `${address.slice(0, 6)}…${address.slice(-4)}`;

const TokenLogo = ({ image, symbol, className = 'h-8 w-8' }) =>
  image ? (
    <img src={image} alt="" className={cn('rounded-full object-cover bg-steel-750', className)} loading="lazy" />
  ) : (
    <span
      className={cn(
        'flex items-center justify-center rounded-full bg-steel-750 text-xs font-bold text-white/80',
        className
      )}
      aria-hidden
    >
      {(symbol || '?').slice(0, 2).toUpperCase()}
    </span>
  );

/**
 * Uniswap route check per basket token (buy with ETH, sell back to ETH), run by
 * the API with the same routing it uses to trade. A token that fails it is
 * never accepted, so a basket the editor allows is a basket the vault can trade.
 */
/** A route-check query result as the props `RouteStatus` takes. */
export const toRouteView = q => {
  if (q?.data) {
    return {
      status: q.data.status,
      reason: q.data.reason ?? null,
      buyRoute: q.data.buy?.route ?? null,
      sellRoute: q.data.sell?.route ?? null,
      lossBps: q.data.roundTripLossBps ?? null,
      refetch: q.refetch,
    };
  }
  if (q?.isError) {
    return {
      status: 'unavailable',
      reason: q.error?.response?.data?.message || 'The route check failed',
      refetch: q.refetch,
    };
  }
  return { status: 'checking', reason: null, refetch: q?.refetch };
};

export const useBasketRoutes = (targets, vaultId) => {
  const results = useQueries({ queries: targets.map(t => indexAssetRoutesQuery(t.assetAddress, vaultId)) });
  return targets.map((_, i) => toRouteView(results[i]));
};

/**
 * Runs the route checks for `targets` and writes each result onto its target
 * (`routeStatus`, `routeReason`) through `onTargets` whenever a result changes.
 * Any view that holds a basket and gates on `validateIndexBasket` must use it,
 * or a stored status (e.g. `checking`) would never update.
 */
export const useSyncedBasketRoutes = (targets, vaultId, onTargets) => {
  const routes = useBasketRoutes(targets, vaultId);
  const routeKey = routes.map(r => `${r.status}:${r.reason ?? ''}`).join('|');
  useEffect(() => {
    const changed = targets.some(
      (t, i) => t.routeStatus !== routes[i].status || (t.routeReason ?? null) !== (routes[i].reason ?? null)
    );
    if (changed) {
      onTargets(
        targets.map((t, i) => ({ ...t, routeStatus: routes[i].status, routeReason: routes[i].reason ?? null }))
      );
    }
    // Re-run only when a check result changes; `onTargets` and `targets` are read from that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);
  return routes;
};

export const RouteStatus = ({ route }) => {
  if (!route || route.status === 'checking') {
    return (
      <p className="flex items-center gap-1 text-xs text-dark-100">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking Uniswap route…
      </p>
    );
  }
  if (route.status === 'ok') {
    const cost = route.lossBps != null ? ` · round trip ≈ ${(route.lossBps / 100).toFixed(2)}%` : '';
    return (
      <p
        className="flex min-w-0 items-center gap-1 text-xs text-green-500"
        title={`Buy: ${route.buyRoute || '—'}\nSell: ${route.sellRoute || '—'}${cost}`}
      >
        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">Tradable on Uniswap{route.buyRoute ? ` · ${route.buyRoute}` : ''}</span>
      </p>
    );
  }
  if (route.status === 'unavailable') {
    return (
      <p className="flex items-center gap-1 text-xs text-amber-400">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span className="min-w-0">Couldn&apos;t check the route right now.</span>
        {route.refetch && (
          <button type="button" onClick={() => route.refetch()} className="flex items-center gap-1 underline">
            <RotateCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </p>
    );
  }
  return (
    <p className="flex items-start gap-1 text-xs text-red-400">
      <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
      <span className="min-w-0">
        {route.status === 'illiquid' ? 'Too illiquid for a basket' : "Can't be traded on Uniswap"}
        {route.reason ? `: ${route.reason}` : ''}
      </span>
    </p>
  );
};

/** Stacked bar of target weights, with the cash reserve as the last segment. */
export const BasketAllocationBar = ({ targets, reserveBps = 0, className = '' }) => {
  const investableShare = (BPS - reserveBps) / BPS;
  return (
    <div className={cn('flex h-3 w-full gap-px overflow-hidden rounded-full bg-steel-800', className)}>
      {targets.map((t, i) => (
        <div
          key={t.assetAddress}
          title={`${t.symbol}: ${formatBps(Number(t.weightBps) * investableShare)}`}
          style={{
            width: `${(Number(t.weightBps) / BPS) * investableShare * 100}%`,
            background: basketSegmentColor(i),
          }}
        />
      ))}
      {reserveBps > 0 && (
        <div
          title={`Cash reserve: ${formatBps(reserveBps)}`}
          // Striped so the reserve reads as a filled share, not as empty track.
          className="bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.45)_0_4px,rgba(255,255,255,0.15)_4px_8px)]"
          style={{ width: `${(reserveBps / BPS) * 100}%` }}
        />
      )}
    </div>
  );
};

/**
 * Adds one asset to the basket through the same field the vault-creation asset
 * whitelist uses: wallet holdings and chain-wide tokens, searched with a
 * debounce, verification shown per row, and a pasted contract address resolved
 * to its symbol and logo. Picking an asset adds it and clears the field, so the
 * field never holds a selection of its own.
 */
const AssetPicker = ({ existing, onAdd, disabled, steel }) => {
  const [draft, setDraft] = useState({ policyId: '' });
  const [isResolving, setIsResolving] = useState(false);
  const source = useAssetSource();

  const add = policy => {
    onAdd({
      address: policy.policyId,
      symbol: policy.name || policy.assetName || '',
      name: policy.collectionName || policy.name || '',
      image: policy.imageUrl || policy.image || null,
    });
    setDraft({ policyId: '' });
  };

  // A token the chain does not index yet still belongs in a basket — the vault
  // reads its symbol and decimals on launch either way. Resolve what we can
  // first so the row is not a bare address.
  const typed = draft.policyId.trim();
  const canAddPasted = ADDRESS_RE.test(typed) && !existing.has(typed.toLowerCase());
  const addPasted = async () => {
    setIsResolving(true);
    try {
      const [policy] = await source.lookupPolicies([typed]);
      add(policy || { policyId: typed });
    } catch (err) {
      console.error('Token lookup failed:', err);
      add({ policyId: typed });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={cn(disabled && 'pointer-events-none opacity-50')}>
      <AssetSearchInput
        allowUnverified
        excludePolicyIds={[...existing]}
        extraOption={
          canAddPasted
            ? {
                title: `Add token ${shortAddress(typed)}`,
                subtitle: isResolving ? 'Reading the token…' : 'Symbol and decimals are read from the chain',
                disabled: isResolving,
                onSelect: addPasted,
              }
            : null
        }
        placeholder="Search tokens or paste a token address"
        showSelectedCard={false}
        showVerificationHint={false}
        source={source}
        value={draft}
        variant={steel ? 'steel' : 'default'}
        onChange={text => setDraft({ policyId: text })}
        onClear={() => setDraft({ policyId: '' })}
        onSelect={add}
      />
    </div>
  );
};

/**
 * Compact picker for when the backend limits baskets to a fixed token list
 * (testnet: the tokens seeded on the fixed-rate swap adapter).
 */
const SupportedAssetPicker = ({ assets, existing, onAdd, disabled, steel }) => (
  <div className={cn('space-y-2', disabled && 'pointer-events-none opacity-50')}>
    <p className="text-sm text-dark-100">Supported tokens</p>
    <div className="flex flex-wrap gap-2">
      {assets.map(asset => {
        const added = existing.has(asset.assetAddress.toLowerCase());
        // Unknown (`routing` absent) stays selectable: the row runs its own check.
        const blocked = asset.routing && asset.routing.status !== 'ok';
        return (
          <button
            key={asset.assetAddress}
            type="button"
            title={
              blocked
                ? `${asset.symbol} can't be added right now: ${asset.routing.reason || 'no Uniswap route'}`
                : asset.name || asset.assetAddress
            }
            disabled={disabled || added || blocked}
            onClick={() =>
              onAdd({ address: asset.assetAddress, symbol: asset.symbol, name: asset.name, image: asset.image })
            }
            className={cn(
              'flex items-center gap-2 rounded-full border border-steel-750 py-1 pl-1 pr-3 text-sm transition-colors',
              steel ? 'bg-steel-800' : 'bg-steel-850',
              added || blocked ? 'opacity-40' : 'hover:border-orange-500',
              blocked && 'line-through'
            )}
          >
            <TokenLogo image={asset.image} symbol={asset.symbol} className="h-6 w-6" />
            {asset.symbol}
          </button>
        );
      })}
    </div>
    {assets.some(a => a.routing && a.routing.status !== 'ok') && (
      <p className="text-xs text-dark-100">
        Crossed-out tokens can&apos;t be bought and sold back through Uniswap right now. Hover one for the reason.
      </p>
    )}
  </div>
);

/**
 * Edits an index basket: `{ targets: [{ assetAddress, symbol, name, image, weightBps }], reserveBps }`.
 * Weights are entered as percentages and stored as integer basis points.
 */
export const IndexBasketEditor = ({
  value,
  onChange,
  error,
  disabled = false,
  steel = false,
  className = '',
  vaultId = null,
}) => {
  const targets = useMemo(() => value?.targets || [], [value?.targets]);
  const reserveBps = Number(value?.reserveBps ?? 0);
  const total = totalWeightBps(targets);
  const existing = useMemo(() => new Set(targets.map(t => t.assetAddress.toLowerCase())), [targets]);
  const isFull = targets.length >= INDEX_MAX_ASSETS;
  const { data: supported } = useIndexSupportedAssets();

  const autoRebalance = value?.autoRebalance !== false;
  const minCadence = supported?.rebalance?.minCadenceDays ?? INDEX_MIN_REBALANCE_CADENCE_DAYS;
  const defaultCadence = supported?.rebalance?.defaultCadenceDays ?? INDEX_DEFAULT_REBALANCE_CADENCE_DAYS;
  const cadence = value?.rebalanceCadenceDays ?? defaultCadence;

  // Spread `value` so fields this editor does not own (the rebalance schedule) survive every edit.
  const emit = next => onChange({ ...value, targets, reserveBps, ...next });

  // Each token's route check is stored on its target (`routeStatus`, `routeReason`) so the form's
  // validation can block submitting a basket with a token the vault could not trade. The payload
  // sent to the API leaves these fields out.
  const routes = useSyncedBasketRoutes(targets, vaultId, next => emit({ targets: next }));

  // Adding an asset re-splits the basket evenly; the user can fine-tune weights afterwards.
  const addAsset = token => {
    const next = [
      ...targets,
      {
        assetAddress: token.address.toLowerCase(),
        symbol: token.symbol || '',
        name: token.name || '',
        image: token.image || null,
      },
    ];
    const weights = evenWeights(next.length);
    emit({ targets: next.map((t, i) => ({ ...t, weightBps: weights[i] })) });
  };

  const updateWeight = (address, percent) => {
    const clamped = Math.min(Math.max(Number(percent) || 0, 0), 100);
    emit({ targets: targets.map(t => (t.assetAddress === address ? { ...t, weightBps: percentToBps(clamped) } : t)) });
  };

  const removeAsset = address => emit({ targets: targets.filter(t => t.assetAddress !== address) });

  const splitEvenly = () => {
    const weights = evenWeights(targets.length);
    emit({ targets: targets.map((t, i) => ({ ...t, weightBps: weights[i] })) });
  };

  const rowBg = steel ? 'bg-steel-800' : 'bg-steel-850';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase">Index basket</span>
          <HoverHelp hint="The tokens this vault holds and the share of the vault each one should make up. After the acquire window locks, the vault buys these tokens with the ETH it raised. Weights apply to the vault value after the cash reserve." />
          <span className="text-sm text-dark-100">
            {targets.length}/{INDEX_MAX_ASSETS}
          </span>
        </div>
        {targets.length > 1 && (
          <button
            type="button"
            onClick={splitEvenly}
            disabled={disabled}
            className="flex items-center gap-2 text-sm text-dark-100 hover:text-orange-500 disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" />
            Split evenly
          </button>
        )}
      </div>

      {supported?.restricted ? (
        <SupportedAssetPicker
          assets={supported.assets}
          existing={existing}
          onAdd={addAsset}
          disabled={disabled || isFull}
          steel={steel}
        />
      ) : (
        <AssetPicker existing={existing} onAdd={addAsset} disabled={disabled || isFull} steel={steel} />
      )}
      {isFull && <p className="text-sm text-dark-100">The basket is full ({INDEX_MAX_ASSETS} assets).</p>}

      {targets.length > 0 && (
        <ul className="space-y-2">
          {targets.map((t, i) => (
            <li key={t.assetAddress} className={cn('flex items-center gap-3 rounded-lg px-3 py-2', rowBg)}>
              <span className="h-8 w-1 flex-shrink-0 rounded-full" style={{ background: basketSegmentColor(i) }} />
              <TokenLogo image={t.image} symbol={t.symbol} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.symbol || shortAddress(t.assetAddress)}</p>
                <p className="truncate text-xs text-dark-100">{t.name || shortAddress(t.assetAddress)}</p>
                <RouteStatus route={routes[i]} />
              </div>
              <label className="flex items-center gap-1">
                <span className="sr-only">Weight for {t.symbol || t.assetAddress}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={0.01}
                  disabled={disabled}
                  value={bpsToPercent(t.weightBps)}
                  onChange={e => updateWeight(t.assetAddress, e.target.value)}
                  onWheel={e => e.currentTarget.blur()}
                  className={cn(
                    'w-20 rounded-md border border-steel-750 bg-steel-950 px-2 py-1 text-right tabular-nums focus:border-orange-500 focus:outline-none',
                    noSpinner
                  )}
                />
                <span className="text-dark-100">%</span>
              </label>
              <button
                type="button"
                aria-label={`Remove ${t.symbol || t.assetAddress}`}
                onClick={() => removeAsset(t.assetAddress)}
                disabled={disabled}
                className="p-1 text-dark-100 hover:text-red-500 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {targets.length > 0 && (
        <div className="space-y-2">
          <BasketAllocationBar targets={targets} reserveBps={reserveBps} />
          <div className="flex justify-between text-sm">
            <span className="text-dark-100">Basket weights{reserveBps > 0 ? ' (of the non-reserve part)' : ''}</span>
            <span className={cn('tabular-nums font-medium', total === BPS ? 'text-green-500' : 'text-red-500')}>
              {formatBps(total, 2)} of 100%
            </span>
          </div>
          {reserveBps > 0 && (
            // Weights and reserve are different bases; spell out the split of the whole vault
            // so they are not read as adding up to more than 100%.
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-100">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Basket {formatBps(BPS - reserveBps)} of vault
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/40" />
                Cash reserve {formatBps(reserveBps)} of vault
              </span>
            </div>
          )}
        </div>
      )}

      <div className={cn('flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-3', rowBg)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Cash reserve</span>
          <HoverHelp hint="Share of the vault kept in ETH and set aside: it is never spent on the basket and does not go to the liquidity pool (that is funded separately by LP contribution). Basket weights apply to the rest." />
        </div>
        <label className="flex items-center gap-1">
          <span className="sr-only">Cash reserve percentage</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={INDEX_MAX_RESERVE_BPS / 100}
            step={0.5}
            disabled={disabled}
            value={bpsToPercent(reserveBps)}
            onWheel={e => e.currentTarget.blur()}
            onChange={e =>
              emit({
                reserveBps: Math.min(Math.max(percentToBps(e.target.value), 0), INDEX_MAX_RESERVE_BPS),
              })
            }
            className={cn(
              'w-20 rounded-md border border-steel-750 bg-steel-950 px-2 py-1 text-right tabular-nums focus:border-orange-500 focus:outline-none',
              noSpinner
            )}
          />
          <span className="text-dark-100">%</span>
        </label>
      </div>

      <div className={cn('space-y-3 rounded-lg px-3 py-3', rowBg)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Auto-rebalance</span>
            <HoverHelp hint="Prices move, so the basket drifts away from its target weights. With auto-rebalance on, the vault sells what has grown above its weight and buys what has fallen below, by USD value, once per cadence. Each rebalance trades on Uniswap and pays swap fees. Token holders can change this later through a governance proposal." />
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoRebalance}
            aria-label="Auto-rebalance"
            disabled={disabled}
            onClick={() =>
              emit({
                autoRebalance: !autoRebalance,
                rebalanceCadenceDays: value?.rebalanceCadenceDays ?? defaultCadence,
              })
            }
            className={cn(
              'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50',
              autoRebalance ? 'bg-orange-500' : 'bg-steel-750'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                autoRebalance && 'translate-x-5'
              )}
            />
          </button>
        </div>
        {autoRebalance && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-dark-100">Cadence</span>
            <label className="flex items-center gap-2">
              <span className="text-dark-100">Every</span>
              <input
                type="number"
                inputMode="numeric"
                min={minCadence}
                max={INDEX_MAX_REBALANCE_CADENCE_DAYS}
                step={1}
                disabled={disabled}
                value={cadence}
                aria-label="Rebalance cadence in days"
                onWheel={e => e.currentTarget.blur()}
                onChange={e =>
                  emit({ rebalanceCadenceDays: e.target.value === '' ? '' : Math.floor(Number(e.target.value)) })
                }
                className={cn(
                  'w-20 rounded-md border border-steel-750 bg-steel-950 px-2 py-1 text-right tabular-nums focus:border-orange-500 focus:outline-none',
                  noSpinner
                )}
              />
              <span className="text-dark-100">days</span>
            </label>
          </div>
        )}
        {autoRebalance && (
          <p className="text-xs text-dark-100">
            Minimum {minCadence} days. The exact time within each period is randomized so trades cannot be front-run.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
