import { useMemo } from 'react';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { useEvmDistributionClaim } from '@/hooks/useEvmDistributionClaim';
import { useAuth } from '@/lib/auth/auth';
import { VAULT_DISTRIBUTION_ABI } from '@/lib/evm/vault.abi';
import { evmChainByNetwork, robinhoodChain } from '@/lib/evm/wagmi.config';

/** The contract caps concurrent distributions, so scanning the tail is enough. */
const MAX_SCANNED = 20;

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
 * Claim panel for open distributions on an EVM vault.
 *
 * A passed Distribution proposal reserves a pot inside the vault contract and
 * stops there — nothing is sent to holders. Each holder pulls their own share,
 * once per distribution, until the claim window closes; whatever is left is
 * swept to the treasury afterwards. Claiming does not burn VT, so this panel
 * is live while the vault is still running, not only at termination.
 */
export const VaultDistributionClaim = ({ vault }) => {
  const { isAuthenticated } = useAuth();
  const { address: holder } = useAccount();
  const { claim, claimingId, isProcessing } = useEvmDistributionClaim();

  const vaultAddress = vault?.contractAddress;
  // Reads must go to the vault's own chain — Robinhood has no such vault.
  const chainId = evmChainByNetwork[vault?.chainType]?.id ?? robinhoodChain.id;
  const nativeCurrency = evmChainByNetwork[vault?.chainType]?.nativeCurrency;

  const { data: total } = useReadContract({
    address: vaultAddress,
    abi: VAULT_DISTRIBUTION_ABI,
    functionName: 'totalDistributions',
    chainId,
    query: { enabled: Boolean(vaultAddress) },
  });

  const ids = useMemo(() => {
    const count = Number(total ?? 0n);
    if (!count) return [];
    const first = Math.max(1, count - MAX_SCANNED + 1);
    const out = [];
    for (let id = count; id >= first; id--) out.push(id);
    return out;
  }, [total]);

  const detailContracts = useMemo(() => {
    if (!holder || ids.length === 0) return [];
    return ids.flatMap(id => [
      {
        address: vaultAddress,
        abi: VAULT_DISTRIBUTION_ABI,
        functionName: 'getDistribution',
        args: [BigInt(id)],
        chainId,
      },
      {
        address: vaultAddress,
        abi: VAULT_DISTRIBUTION_ABI,
        functionName: 'distributionClaimable',
        args: [BigInt(id), holder],
        chainId,
      },
      {
        address: vaultAddress,
        abi: VAULT_DISTRIBUTION_ABI,
        functionName: 'isDistributionClaimed',
        args: [BigInt(id), holder],
        chainId,
      },
    ]);
  }, [ids, holder, vaultAddress, chainId]);

  const { data: detailData, refetch: refetchDetails } = useReadContracts({
    contracts: detailContracts,
    query: { enabled: detailContracts.length > 0 },
  });

  const rows = useMemo(() => {
    if (!Array.isArray(detailData)) return [];
    const nowSec = Math.floor(Date.now() / 1000);
    return ids
      .map((id, index) => {
        const data = detailData[index * 3]?.result;
        const claimable = detailData[index * 3 + 1]?.result ?? 0n;
        const claimed = detailData[index * 3 + 2]?.result ?? false;
        if (!data) return null;
        const deadline = Number(data.deadline ?? 0n);
        return {
          id,
          asset: data.asset,
          claimable,
          claimed,
          deadline,
          // Nothing to show for a closed window or an address that held no VT
          // at the snapshot timepoint — its share was never in the pot.
          open: !claimed && claimable > 0n && deadline > nowSec,
        };
      })
      .filter(row => row?.open);
  }, [ids, detailData]);

  const erc20Assets = useMemo(() => [...new Set(rows.filter(r => r.asset !== zeroAddress).map(r => r.asset))], [rows]);

  const { data: tokenMeta } = useReadContracts({
    contracts: erc20Assets.flatMap(asset => [
      { address: asset, abi: erc20Abi, functionName: 'symbol', chainId },
      { address: asset, abi: erc20Abi, functionName: 'decimals', chainId },
    ]),
    query: { enabled: erc20Assets.length > 0 },
  });

  const assetInfo = useMemo(() => {
    const map = new Map();
    erc20Assets.forEach((asset, index) => {
      map.set(asset, {
        symbol: tokenMeta?.[index * 2]?.result ?? 'TOKEN',
        decimals: tokenMeta?.[index * 2 + 1]?.result ?? 18,
      });
    });
    return map;
  }, [erc20Assets, tokenMeta]);

  if (!vaultAddress || rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
      <h3 className="font-russo text-lg uppercase text-white">Distribution — Claim Your Share</h3>
      <p className="mt-2 text-sm text-steel-200">
        Governance approved a distribution. Your share is reserved in the vault and paid out when you claim it —{' '}
        <span className="text-white">your VT is not burned</span>. Unclaimed funds go to the treasury once the window
        closes.
      </p>

      <ul className="mt-3 space-y-2">
        {rows.map(row => {
          const isNative = row.asset === zeroAddress;
          const symbol = isNative ? (nativeCurrency?.symbol ?? 'ETH') : assetInfo.get(row.asset)?.symbol;
          const decimals = isNative ? (nativeCurrency?.decimals ?? 18) : assetInfo.get(row.asset)?.decimals;
          const busy = isProcessing && claimingId === String(row.id);
          return (
            <li key={row.id} className="rounded-lg bg-steel-950 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-steel-300">Distribution #{row.id}</span>
                <span className="text-white">
                  {fmt(row.claimable, decimals)} {symbol}
                </span>
              </div>
              <p className="mt-1 text-xs text-steel-400">
                Claim window closes{' '}
                {new Date(row.deadline * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <PrimaryButton
                className="mt-2 w-full uppercase"
                disabled={!isAuthenticated || !holder || isProcessing}
                onClick={async () => {
                  const hash = await claim({ vaultAddress, chainId, distributionId: row.id });
                  if (hash) refetchDetails?.();
                }}
              >
                {busy ? 'Claiming…' : `Claim ${fmt(row.claimable, decimals)} ${symbol}`}
              </PrimaryButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
