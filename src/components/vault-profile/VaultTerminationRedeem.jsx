import { useMemo } from 'react';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { useEvmRedeemTransaction } from '@/hooks/useEvmRedeemTransaction';
import { VAULT_TERMINATION_ABI } from '@/lib/evm/vault.abi';
import { robinhoodChain } from '@/lib/evm/wagmi.config';
import { useAuth } from '@/lib/auth/auth';

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

  if (!enabled) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <h3 className="font-russo text-lg uppercase text-white">Vault Terminating — Redeem Your Share</h3>
      <p className="mt-2 text-sm text-steel-200">
        Governance voted to terminate this vault. Redeeming{' '}
        <span className="text-white">burns your entire VT balance</span> and pays your pro-rata share of every
        distributed asset in a single transaction. There is no partial redeem.
      </p>
      {deadlineLabel && (
        <p className="mt-1 text-sm text-steel-300">
          {deadlinePassed ? 'Claim window closed on ' : 'Claim window closes '}
          <span className="text-white">{deadlineLabel}</span>
          {!deadlinePassed && '. Unclaimed funds are swept to the treasury afterwards.'}
        </p>
      )}

      <div className="mt-3 rounded-lg bg-steel-950 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-steel-300">Your VT balance</span>
          <span className="text-white">
            {fmt(vtBalance, vtDecimals)} {vault?.vaultTokenTicker || 'VT'}
          </span>
        </div>
        {previews.length > 0 && (
          <div className="mt-2 border-t border-steel-800 pt-2">
            <p className="text-steel-300">You will receive</p>
            <ul className="mt-1 space-y-1">
              {previews.map(p => (
                <li key={p.asset} className="flex justify-between text-white">
                  <span>{p.symbol}</span>
                  <span>{p.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
        {txHash && <p className="mt-2 break-all text-xs text-steel-400">Submitted: {txHash}</p>}
      </div>
    </div>
  );
};
