import { useMemo, useState } from 'react';
import { Clock, ExternalLink, Info } from 'lucide-react';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { useEvmRedeemTransaction } from '@/hooks/useEvmRedeemTransaction';
import { VAULT_TERMINATION_ABI } from '@/lib/evm/vault.abi';
import { robinhoodChain } from '@/lib/evm/wagmi.config';
import { useAuth } from '@/lib/auth/auth';
import { useVaultIndex } from '@/services/api/queries';
import { getTransactionUrl } from '@/utils/explorer.utils';
import { ChainType } from '@/utils/types';

const fmt = (raw, decimals) => {
  try {
    const n = Number(formatUnits(BigInt(raw ?? 0n), decimals ?? 18));
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
  } catch {
    return '0';
  }
};

/**
 * Redemption panel for a terminating EVM (Robinhood) vault.
 *
 * A TERMINATION proposal has executed: the vault holds a fixed redemption rate
 * per distributable asset. The holder burns their entire VT balance with one
 * `redeem()` call and receives their pro-rata share of every asset. Redemption
 * stays open until `terminationDeadline`; after that, unclaimed funds are swept
 * to the treasury.
 */
export const VaultTerminationRedeem = ({ vault, vaultTokenAddress }) => {
  const { isAuthenticated } = useAuth();
  const { address: holder } = useAccount();
  const { redeem, isProcessing, txHash } = useEvmRedeemTransaction();

  const vaultAddress = vault?.contractAddress;
  const enabled = Boolean(vaultAddress);
  const holderEnabled = enabled && Boolean(holder);

  const { data: deadline } = useReadContract({
    address: vaultAddress,
    abi: VAULT_TERMINATION_ABI,
    functionName: 'terminationDeadline',
    chainId: robinhoodChain.id,
    query: { enabled },
  });

  const { data: assets } = useReadContract({
    address: vaultAddress,
    abi: VAULT_TERMINATION_ABI,
    functionName: 'terminationAssets',
    chainId: robinhoodChain.id,
    query: { enabled },
  });

  const { data: vtBalance, refetch: refetchBalance } = useReadContract({
    address: vaultTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: holder ? [holder] : undefined,
    chainId: robinhoodChain.id,
    query: { enabled: holderEnabled && Boolean(vaultTokenAddress) },
  });

  const { data: vtDecimals } = useReadContract({
    address: vaultTokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(vaultTokenAddress) },
  });

  // Per-asset preview + metadata for the connected holder.
  const previewContracts = useMemo(() => {
    if (!holderEnabled || !Array.isArray(assets)) return [];
    return assets.flatMap(asset => {
      const isNative = asset === zeroAddress;
      return [
        {
          address: vaultAddress,
          abi: VAULT_TERMINATION_ABI,
          functionName: 'previewRedeem',
          args: [holder, asset],
          chainId: robinhoodChain.id,
        },
        ...(isNative
          ? []
          : [
              { address: asset, abi: erc20Abi, functionName: 'symbol', chainId: robinhoodChain.id },
              { address: asset, abi: erc20Abi, functionName: 'decimals', chainId: robinhoodChain.id },
            ]),
      ];
    });
  }, [assets, holder, holderEnabled, vaultAddress]);

  const { data: previewData, refetch: refetchPreview } = useReadContracts({
    contracts: previewContracts,
    query: { enabled: previewContracts.length > 0 },
  });

  const previews = useMemo(() => {
    if (!Array.isArray(assets) || !Array.isArray(previewData)) return [];
    const out = [];
    let i = 0;
    for (const asset of assets) {
      const isNative = asset === zeroAddress;
      const amount = previewData[i++]?.result ?? 0n;
      let symbol = 'ETH';
      let decimals = 18;
      if (!isNative) {
        symbol = previewData[i++]?.result ?? 'TOKEN';
        decimals = previewData[i++]?.result ?? 18;
      }
      out.push({ asset, symbol, amount: fmt(amount, decimals), hasAmount: (amount ?? 0n) > 0n });
    }
    return out;
  }, [assets, previewData]);

  const hasVt = (vtBalance ?? 0n) > 0n;
  const deadlineLabel = deadline
    ? new Date(Number(deadline) * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null;
  const deadlinePassed = deadline ? Date.now() / 1000 >= Number(deadline) : false;

  // Logos come from the index overview (holdings + targets); initials otherwise.
  const { data: index } = useVaultIndex(vault?.id, enabled);
  const logos = useMemo(() => {
    const m = new Map();
    for (const a of [...(index?.config?.targets ?? []), ...(index?.portfolio?.assets ?? [])]) {
      if (a?.assetAddress && a.image) m.set(a.assetAddress.toLowerCase(), a.image);
    }
    return m;
  }, [index]);

  const rows = useMemo(
    () =>
      previews
        .map(p => ({ ...p, image: p.asset === zeroAddress ? ETH_LOGO : logos.get(p.asset.toLowerCase()) }))
        .filter(p => !hasVt || p.hasAmount),
    [previews, logos, hasVt]
  );

  const [query, setQuery] = useState('');
  const shown = query ? rows.filter(r => r.symbol.toLowerCase().includes(query.trim().toLowerCase())) : rows;

  if (!enabled) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-russo text-lg uppercase text-white">Redeem your share</h3>
        {deadlineLabel && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              deadlinePassed ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-200'
            }`}
          >
            <Clock className="h-3 w-3" />
            {deadlinePassed ? 'Closed' : `Until ${deadlineLabel}`}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-steel-300">
        This vault is closing. Burn your VT to get your share of every asset in one transaction.
      </p>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-steel-950 px-3 py-2 text-sm">
        <span className="text-steel-300">Your VT</span>
        <span className="font-medium text-white">
          {fmt(vtBalance, vtDecimals)} {vault?.vaultTokenTicker || 'VT'}
        </span>
      </div>

      {hasVt && rows.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm text-steel-300">
              You receive <span className="text-white">{rows.length}</span> assets
            </p>
            {rows.length > 8 && (
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search"
                className="w-28 rounded-md bg-steel-950 px-2 py-1 text-xs text-white outline-none placeholder:text-steel-500"
              />
            )}
          </div>
          <ul className="max-h-64 divide-y divide-steel-800/60 overflow-y-auto rounded-lg bg-steel-950 pr-1">
            {shown.map(r => (
              <li key={r.asset} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <AssetLogo image={r.image} symbol={r.symbol} />
                  <span className="truncate text-white">{r.symbol}</span>
                </span>
                <span className="tabular-nums text-steel-100">{r.amount}</span>
              </li>
            ))}
            {shown.length === 0 && <li className="px-3 py-3 text-center text-xs text-steel-400">No match</li>}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <PrimaryButton
          className="w-full uppercase"
          disabled={!isAuthenticated || !holder || !hasVt || isProcessing || deadlinePassed}
          onClick={async () => {
            const hash = await redeem({ vaultAddress });
            if (hash) {
              refetchBalance?.();
              refetchPreview?.();
            }
          }}
        >
          {isProcessing ? 'Redeeming…' : hasVt ? 'Burn VT & Redeem' : 'No VT to redeem'}
        </PrimaryButton>
        {txHash && (
          <a
            href={getTransactionUrl(txHash, ChainType.ROBINHOOD)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-1 text-xs text-steel-400 hover:text-white"
          >
            View transaction <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {!deadlinePassed && (
        <details className="group mt-3 text-xs text-steel-400">
          <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-steel-200">
            <Info className="h-3 w-3" /> How it works
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Your whole VT balance is burned — there is no partial redeem.</li>
            <li>VT in a Uniswap LP position doesn&apos;t count. Remove liquidity first, then redeem.</li>
            <li>After the deadline, unclaimed assets go to the treasury.</li>
          </ul>
        </details>
      )}
    </div>
  );
};

const ETH_LOGO = '/assets/icons/eth.svg';

const AssetLogo = ({ image, symbol }) =>
  image ? (
    <img src={image} alt="" className="h-6 w-6 flex-shrink-0 rounded-full object-cover" loading="lazy" />
  ) : (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-steel-800 text-[10px] font-bold text-steel-200">
      {(symbol || '?').slice(0, 2).toUpperCase()}
    </span>
  );
