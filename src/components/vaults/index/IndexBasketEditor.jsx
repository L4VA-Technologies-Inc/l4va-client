import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus, Search, ShieldAlert, ShieldCheck, Shuffle, X } from 'lucide-react';
import { useAccount } from 'wagmi';

import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEvmAssets } from '@/hooks/useEvmAssets';
import { useRobinhoodMemecoins, useRobinhoodRwas } from '@/services/api/queries';
import { HoverHelp } from '@/components/shared/HoverHelp';
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
 * A token as the picker hands it to the basket. `useEvmAssets` speaks the
 * whitelist's `GroupedPolicy` shape (policyId = contract address), the token
 * registry speaks its own; both are normalised here.
 */
const fromGroupedPolicy = policy => ({
  address: policy.policyId,
  symbol: policy.name || policy.assetName || '',
  name: policy.collectionName || policy.name || '',
  image: policy.imageUrl || policy.image || null,
  isVerified: policy.isVerified,
});

const VerificationBadge = ({ isVerified }) => {
  if (isVerified === undefined || isVerified === null) return null;
  return isVerified ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[11px] text-green-400">
      <ShieldCheck className="h-3 w-3" />
      Verified
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/20 px-2 py-0.5 text-[11px] text-orange-400">
      <ShieldAlert className="h-3 w-3" />
      Unverified
    </span>
  );
};

/**
 * Asset search for the basket. Tokens come from the same source the acquire
 * step's asset whitelist uses — `useEvmAssets`, i.e. the connected wallet's
 * holdings plus the chain-wide Blockscout listing, searched with a debounce and
 * resolved by contract address when one is pasted — on top of the curated
 * Robinhood stock and token registry.
 */
const AssetPicker = ({ existing, onAdd, disabled, steel }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [chainMatches, setChainMatches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const containerRef = useRef(null);
  useClickOutside(containerRef, () => setOpen(false));

  const { isConnected } = useAccount();
  const { data: rwas = [], isLoading: rwasLoading } = useRobinhoodRwas(open);
  const { data: memecoins = [], isLoading: memesLoading } = useRobinhoodMemecoins(open);
  const { data: walletData, isLoading: walletLoading, searchPolicies, lookupPolicies } = useEvmAssets();
  const browsePolicies = useMemo(() => walletData?.data || [], [walletData]);

  // `useEvmAssets` hands back fresh callbacks on every render while no wallet
  // is connected, so the search effect reads them through a ref rather than
  // re-running (and re-scheduling itself) on each one.
  const searchRef = useRef(searchPolicies);
  useEffect(() => {
    searchRef.current = searchPolicies;
  }, [searchPolicies]);

  const trimmed = query.trim();

  // Same 300ms debounce as the whitelist input: every keystroke would otherwise
  // hit Blockscout's search endpoint.
  useEffect(() => {
    if (!open) return undefined;
    if (!trimmed) {
      setChainMatches([]);
      setIsSearching(false);
      return undefined;
    }
    setIsSearching(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const results = await searchRef.current(trimmed);
        if (!cancelled) setChainMatches(results);
      } catch (err) {
        console.error('Token search failed:', err);
        if (!cancelled) setChainMatches([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, open]);

  const groups = useMemo(() => {
    const q = trimmed.toLowerCase();
    const matches = token =>
      token?.address &&
      !existing.has(token.address.toLowerCase()) &&
      (!q ||
        token.symbol?.toLowerCase().includes(q) ||
        token.name?.toLowerCase().includes(q) ||
        token.address.toLowerCase() === q);

    const registry = [
      { label: 'Stocks & RWA', items: (Array.isArray(rwas) ? rwas : []).filter(matches).slice(0, 20) },
      {
        label: 'Tokens',
        items: (Array.isArray(memecoins) ? memecoins : [])
          .filter(t => t.asset_class !== 'vault_token')
          .filter(matches)
          .slice(0, 20),
      },
    ];

    // Anything the registry already lists is not repeated in the wallet group.
    const listed = new Set(registry.flatMap(g => g.items.map(t => t.address.toLowerCase())));
    const source = trimmed ? chainMatches : browsePolicies;
    const walletItems = source
      .map(fromGroupedPolicy)
      .filter(token => !listed.has(token.address.toLowerCase()))
      .filter(matches)
      .slice(0, 20);

    return [...registry, { label: 'Wallet & chain tokens', items: walletItems }].filter(g => g.items.length > 0);
  }, [rwas, memecoins, chainMatches, browsePolicies, trimmed, existing]);

  const canAddCustom =
    ADDRESS_RE.test(trimmed) &&
    !existing.has(trimmed.toLowerCase()) &&
    !groups.some(g => g.items.some(t => t.address.toLowerCase() === trimmed.toLowerCase()));

  const add = token => {
    onAdd(token);
    setQuery('');
    setChainMatches([]);
    setOpen(false);
  };

  // A pasted address is resolved before it is added, so the row shows the real
  // symbol and logo instead of a bare address until the backend re-reads it.
  const addPastedAddress = async () => {
    setIsResolving(true);
    try {
      const [policy] = await lookupPolicies([trimmed]);
      add(policy ? fromGroupedPolicy(policy) : { address: trimmed, symbol: '', name: '', image: null });
    } catch (err) {
      console.error('Token lookup failed:', err);
      add({ address: trimmed, symbol: '', name: '', image: null });
    } finally {
      setIsResolving(false);
    }
  };

  const isLoadingAny = rwasLoading || memesLoading || walletLoading || isSearching;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border px-4 h-[52px]',
          steel ? 'bg-steel-850 border-steel-750' : 'bg-input-bg border-steel-750',
          disabled && 'opacity-50'
        )}
      >
        <Search className="h-4 w-4 text-dark-100" aria-hidden />
        <input
          type="text"
          aria-label="Search assets to add to the basket"
          className="w-full bg-transparent text-white placeholder:text-dark-100 focus:outline-none"
          placeholder="Search stocks and tokens, or paste a token address"
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        {(isSearching || isResolving) && <Loader2 className="h-4 w-4 animate-spin text-dark-100" aria-hidden />}
      </div>
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-steel-750 bg-steel-850 shadow-xl">
          {canAddCustom && (
            <button
              type="button"
              disabled={isResolving}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-steel-750 disabled:opacity-50"
              onClick={addPastedAddress}
            >
              <Plus className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                Add token <span className="font-mono">{shortAddress(trimmed)}</span>
                <span className="block text-xs text-dark-100">
                  {isResolving ? 'Reading the token…' : 'Symbol and decimals are read from the chain'}
                </span>
              </span>
            </button>
          )}
          {groups.map(group => (
            <div key={group.label}>
              <p className="sticky top-0 bg-steel-850 px-4 pt-3 pb-1 text-xs font-russo uppercase text-dark-100">
                {group.label}
              </p>
              {group.items.map(token => (
                <button
                  key={`${group.label}-${token.address}`}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-steel-750"
                  onClick={() => add(token)}
                >
                  <TokenLogo image={token.image} symbol={token.symbol} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {token.symbol || shortAddress(token.address)}
                      </span>
                      <VerificationBadge isVerified={token.isVerified} />
                    </span>
                    <span className="block truncate text-xs text-dark-100">{token.name}</span>
                  </span>
                  <span className="font-mono text-xs text-dark-100">{shortAddress(token.address)}</span>
                </button>
              ))}
            </div>
          ))}
          {isLoadingAny && groups.length === 0 && <p className="px-4 py-3 text-sm text-dark-100">Loading assets…</p>}
          {!isLoadingAny && groups.length === 0 && !canAddCustom && (
            <p className="px-4 py-3 text-sm text-dark-100">
              No matching assets. Paste a Robinhood Chain token address to add it directly.
            </p>
          )}
          {!isConnected && (
            <p className="border-t border-steel-750 px-4 py-2 text-xs text-dark-100">
              Connect your Robinhood wallet to search your holdings as well.
            </p>
          )}
        </div>
      )}
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
