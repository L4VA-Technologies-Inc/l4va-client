import { Droplets, ExternalLink } from 'lucide-react';

import { useVaultLp } from '@/services/api/queries';
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

const shortAddress = address => (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '');

const Stat = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-100">{label}</p>
    <p className="text-lg font-bold tabular-nums">{value}</p>
  </div>
);

/**
 * VT/ETH pool the backend seeds when an EVM vault's raise closes with an LP
 * contribution. Shows the pending state until the pool exists, then live reserves.
 */
export const VaultLiquidityPool = ({ vault }) => {
  const enabled = vault?.chainType === ChainType.ROBINHOOD && Number(vault?.liquidityPoolContribution) > 0;
  const { data: lp } = useVaultLp(vault?.id, enabled);

  if (!enabled || !lp) return null;

  const ticker = vault.vaultTokenTicker || 'VT';
  const isV4 = lp.protocol === 'uniswap-v4';
  // v4 pools have no contract of their own: link the vault's position NFT instead.
  const positionId = lp.positionIds?.[0];
  const link = isV4
    ? positionId && lp.positionManager
      ? {
          href: `${getAddressUrl(lp.positionManager, ChainType.ROBINHOOD).replace('/address/', '/token/')}/instance/${positionId}`,
          label: `Position #${positionId}`,
        }
      : null
    : lp.pair
      ? { href: getAddressUrl(lp.pair, ChainType.ROBINHOOD), label: shortAddress(lp.pair) }
      : null;

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
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-orange-500 hover:underline"
          >
            {link.label}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {isV4 && lp.poolId && (
        <p className="break-all text-xs text-dark-100">
          Pool ID <span className="font-mono">{lp.poolId}</span>
        </p>
      )}

      {lp.status === 'provided' ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label={`${ticker} in pool`} value={formatAmount(lp.reserveVt, 2)} />
          <Stat label="ETH in pool" value={formatAmount(lp.reserveNative)} />
          <Stat label={`Price per ${ticker}`} value={`${formatPrice(lp.vtPriceNative)} ETH`} />
          <Stat label="Vault share" value={lp.vaultSharePct === null ? '—' : `${formatAmount(lp.vaultSharePct, 2)}%`} />
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
