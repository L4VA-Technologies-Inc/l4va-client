import { useState } from 'react';
import { Check, Copy, Droplets, ExternalLink } from 'lucide-react';

import { useCurrency } from '@/hooks/useCurrency';
import { useVaultLp } from '@/services/api/queries';
import { isIndexVault } from '@/components/vaults/index/indexVault.utils';
import { getAddressUrl } from '@/utils/explorer.utils';
import { ChainType } from '@/utils/types';

const formatAmount = (value, maximumFractionDigits = 6) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(num);
};

const formatPrice = value => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return '—';
  // VT prices are often far below 1e-6 ETH; keep the significant digits.
  return num < 0.0001 ? num.toPrecision(4) : formatAmount(num, 8);
};

// Small values (VT prices) keep 4 significant digits instead of rounding to 0.
const formatMoney = (value, symbol) => {
  const num = Number(value);
  if (value === null || !Number.isFinite(num)) return '—';
  if (num === 0) return `${symbol}0`;
  const body = Math.abs(num) < 0.01 ? num.toPrecision(4) : formatAmount(num, 2);
  return `${symbol}${body}`;
};

const shortAddress = address => (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '');

const Stat = ({ label, value, unit }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-100">{label}</p>
    <p className="truncate text-lg font-bold tabular-nums">
      {value}
      {unit && <span className="ml-1 text-sm font-medium text-dark-100">{unit}</span>}
    </p>
  </div>
);

const StatGroup = ({ title, hint, children }) => (
  <div className="space-y-3 rounded-lg bg-steel-850 p-4">
    <div className="flex items-baseline justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white">{title}</p>
      {hint && <p className="text-[11px] text-dark-100">{hint}</p>}
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
  </div>
);

const CopyId = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={value}
      className="inline-flex items-center gap-1.5 font-mono text-dark-100 transition-colors hover:text-white"
    >
      {shortAddress(value)}
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

/**
 * VT/ETH pool the backend seeds when an EVM vault's raise closes with an LP
 * contribution. Shows the pending state until the pool exists, then live reserves.
 */
export const VaultLiquidityPool = ({ vault }) => {
  const enabled =
    vault?.chainType === ChainType.ROBINHOOD && (Number(vault?.liquidityPoolContribution) > 0 || isIndexVault(vault));
  const { data: lp } = useVaultLp(vault?.id, enabled);
  const { currency, currencySymbol, pickByCurrency } = useCurrency();

  if (!enabled || !lp) return null;

  const ticker = vault.vaultTokenTicker || 'VT';
  const isV4 = lp.protocol === 'uniswap-v4';
  // v4 pools have no contract of their own: link the vault's position NFT instead.
  const positionId = lp.positionIds?.[0];
  const extraPositions = Math.max((lp.positionIds?.length || 0) - 1, 0);
  const link = isV4
    ? positionId && lp.positionManager
      ? {
          href: `${getAddressUrl(lp.positionManager, ChainType.ROBINHOOD).replace('/address/', '/token/')}/instance/${positionId}`,
          label: `Vault position #${positionId}${extraPositions ? ` +${extraPositions}` : ''}`,
        }
      : null
    : lp.pair
      ? { href: getAddressUrl(lp.pair, ChainType.ROBINHOOD), label: `Pair ${shortAddress(lp.pair)}` }
      : null;
  const poolRef = isV4 ? lp.poolId : lp.pair;
  const poolUrl = poolRef ? `https://dexscreener.com/robinhood/${poolRef.toLowerCase()}` : null;

  // Vault's own slice of the pool (positions are full range, so share × totals is exact).
  const share = lp.vaultSharePct === null || lp.vaultSharePct === undefined ? null : Number(lp.vaultSharePct);
  const vaultVt = share === null ? null : (Number(lp.reserveVt) * share) / 100;
  const vaultNative = share === null ? null : (Number(lp.reserveNative) * share) / 100;

  // ETH amounts → selected currency (ETH stays as is; USD/ADA need the backend's rates).
  const ethUsd = Number(lp.prices?.ethUsd) || 0;
  const adaUsd = Number(lp.prices?.adaUsd) || 0;
  const toCurrency = native => {
    if (native === null || !Number.isFinite(Number(native))) return null;
    const n = Number(native);
    return pickByCurrency({
      eth: n,
      usd: ethUsd > 0 ? n * ethUsd : null,
      ada: ethUsd > 0 && adaUsd > 0 ? (n * ethUsd) / adaUsd : null,
    });
  };
  const money = native => formatMoney(toCurrency(native), currencySymbol);
  const priceNative = Number(lp.vtPriceNative) || null;
  const priceLabel =
    currency === 'eth' ? formatPrice(priceNative) : formatMoney(toCurrency(priceNative), currencySymbol);
  // Full-range pool: the VT side is worth the ETH side, so value = 2 × ETH side.
  const poolValue = lp.reserveNative != null ? Number(lp.reserveNative) * 2 : null;
  const vaultValue = vaultNative === null ? null : vaultNative * 2;

  return (
    <section className="mb-8 space-y-5 rounded-xl border border-steel-800 p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-orange-500" />
          <h3 className="font-russo text-lg uppercase">Liquidity pool</h3>
          <span className="text-xs text-dark-100">
            {ticker} / ETH · {vault.liquidityPoolContribution}% LP
            {lp.protocol && ` · Uniswap ${isV4 ? 'v4' : 'V2'}`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-500 hover:underline"
            >
              {link.label}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {poolUrl && lp.status === 'provided' && (
            <a
              href={poolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-dark-100 hover:text-white"
            >
              View pool
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {isV4 && lp.poolId && (
        <p className="flex items-center gap-2 text-xs text-dark-100">
          Pool ID <CopyId value={lp.poolId} />
        </p>
      )}

      {lp.status === 'provided' ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <StatGroup title="Pool total" hint="All liquidity providers">
            <Stat label={ticker} value={formatAmount(lp.reserveVt, 2)} />
            <Stat label="ETH" value={formatAmount(lp.reserveNative)} />
            <Stat label="Liquidity" value={money(poolValue)} />
            <Stat label={`Price / ${ticker}`} value={priceLabel} unit={currency === 'eth' ? 'ETH' : undefined} />
          </StatGroup>
          <StatGroup title="Vault position" hint="Owned by this vault">
            <Stat label={ticker} value={vaultVt === null ? '—' : formatAmount(vaultVt, 2)} />
            <Stat label="ETH" value={vaultNative === null ? '—' : formatAmount(vaultNative)} />
            <Stat label="Value" value={money(vaultValue)} />
            <Stat label="Share of pool" value={share === null ? '—' : `${formatAmount(share, 2)}%`} />
          </StatGroup>
        </div>
      ) : (
        <p className="text-sm text-dark-100">
          {lp.status === 'failed'
            ? 'The pool could not be created automatically. An operator needs to retry it.'
            : 'The pool is created automatically right after the vault locks.'}
        </p>
      )}
    </section>
  );
};
