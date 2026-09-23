import { useMemo, useState } from 'react';
import { Shuffle, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AssetSearchInput } from '@/components/shared/AssetSearchInput';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { useAssetSource } from '@/hooks/useAssetSource';
import {
  BPS,
  INDEX_MAX_ASSETS,
  INDEX_MAX_RESERVE_BPS,
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
          className="bg-steel-600"
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
 * Edits an index basket: `{ targets: [{ assetAddress, symbol, name, image, weightBps }], reserveBps }`.
 * Weights are entered as percentages and stored as integer basis points.
 */
export const IndexBasketEditor = ({ value, onChange, error, disabled = false, steel = false, className = '' }) => {
  const targets = useMemo(() => value?.targets || [], [value?.targets]);
  const reserveBps = Number(value?.reserveBps ?? 0);
  const total = totalWeightBps(targets);
  const existing = useMemo(() => new Set(targets.map(t => t.assetAddress.toLowerCase())), [targets]);
  const isFull = targets.length >= INDEX_MAX_ASSETS;

  const emit = next => onChange({ targets, reserveBps, ...next });

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

      <AssetPicker existing={existing} onAdd={addAsset} disabled={disabled || isFull} steel={steel} />
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
            <span className="text-dark-100">Basket weights</span>
            <span className={cn('tabular-nums font-medium', total === BPS ? 'text-green-500' : 'text-red-500')}>
              {formatBps(total, 2)} of 100%
            </span>
          </div>
        </div>
      )}

      <div className={cn('flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-3', rowBg)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Cash reserve</span>
          <HoverHelp hint="Share of the vault kept in ETH and never spent on the basket. Use it for the liquidity pool or as a buffer. Basket weights apply to the rest." />
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

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
