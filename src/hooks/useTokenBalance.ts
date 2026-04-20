import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Token config — single source of truth for all staking-related token data.
// ---------------------------------------------------------------------------

const env = (import.meta as any).env;

export const VLRM_TOKEN_ID = env.VITE_VLRM_TOKEN_ID as string | undefined;
export const L4VA_TOKEN_ID = env.VITE_L4VA_TOKEN_ID as string | undefined;

export const VLRM_DECIMALS = parseInt(env.VITE_VLRM_DECIMALS ?? '4', 10);
export const L4VA_DECIMALS = parseInt(env.VITE_L4VA_DECIMALS ?? '3', 10);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses a Cardano wallet CBOR balance hex for a specific token.
 */
const parseCborTokenBalance = (cborHex: string, policyId: string, assetName: string, decimals: number): number => {
  try {
    const policyIndex = cborHex.indexOf(policyId);
    if (policyIndex === -1) return 0;

    const afterPolicy = cborHex.slice(policyIndex + policyId.length);
    const assetIndex = afterPolicy.indexOf(assetName);
    if (assetIndex === -1) return 0;

    const afterAsset = afterPolicy.slice(assetIndex + assetName.length);
    const firstByte = afterAsset.slice(0, 2);
    let quantity = 0;

    if (parseInt(firstByte, 16) <= 23) quantity = parseInt(firstByte, 16);
    else if (firstByte === '18') quantity = parseInt(afterAsset.slice(2, 4), 16);
    else if (firstByte === '19') quantity = parseInt(afterAsset.slice(2, 6), 16);
    else if (firstByte === '1a') quantity = parseInt(afterAsset.slice(2, 10), 16);
    else if (firstByte === '1b') quantity = parseInt(afterAsset.slice(2, 18), 16);

    return quantity / Math.pow(10, decimals);
  } catch {
    return 0;
  }
};

/**
 * Returns a human-readable label for a given on-chain unit (policyId + assetNameHex).
 * Falls back to a truncated unit string for unknown tokens.
 */
export const getTokenLabel = (unit: string): string => {
  if (VLRM_TOKEN_ID && unit.toLowerCase() === VLRM_TOKEN_ID.toLowerCase()) return 'VLRM';
  if (L4VA_TOKEN_ID && unit.toLowerCase() === L4VA_TOKEN_ID.toLowerCase()) return 'L4VA';
  return unit.slice(0, 8) + '…';
};

// ---------------------------------------------------------------------------
// Generic hook (internal building block)
// ---------------------------------------------------------------------------

const useTokenBalance = (tokenId: string | undefined, decimals: number, label: string) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const wallet = useWallet('handler', 'isConnected');

  const policyId = tokenId?.slice(0, 56) ?? '';
  const assetName = tokenId?.slice(56) ?? '';

  const fetchBalance = useCallback(
    async (showToast = false): Promise<number | undefined> => {
      if (!wallet.handler || !tokenId) return;

      setIsLoading(true);
      try {
        const balanceHex = await wallet.handler.getBalance();
        const parsed = parseCborTokenBalance(balanceHex, policyId, assetName, decimals);
        setBalance(parsed);
        if (showToast) toast.success(`${label} balance updated`);
        return parsed;
      } catch (err) {
        console.error(`Error fetching ${label} balance:`, err);
        if (showToast) toast.error(`Failed to update ${label} balance`);
        setBalance(0);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.handler, tokenId, policyId, assetName, decimals, label]
  );

  const refreshBalance = useCallback(() => fetchBalance(false), [fetchBalance]);

  useEffect(() => {
    if (wallet.handler && tokenId) {
      fetchBalance().catch(() => {});
    }
  }, [fetchBalance, wallet.handler, tokenId]);

  return { balance, isLoading, refreshBalance };
};

// ---------------------------------------------------------------------------
// Combined hook — the only thing staking UI needs to import
// ---------------------------------------------------------------------------

export interface StakeBalances {
  vlrmBalance: number;
  l4vaBalance: number;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
}

export const useStakeBalances = (): StakeBalances => {
  const {
    balance: vlrmBalance,
    isLoading: isVlrmLoading,
    refreshBalance: refreshVlrm,
  } = useTokenBalance(VLRM_TOKEN_ID, VLRM_DECIMALS, 'VLRM');
  const {
    balance: l4vaBalance,
    isLoading: isL4vaLoading,
    refreshBalance: refreshL4va,
  } = useTokenBalance(L4VA_TOKEN_ID, L4VA_DECIMALS, 'L4VA');

  const refreshBalances = useCallback(async () => {
    await Promise.all([refreshVlrm(), refreshL4va()]);
  }, [refreshVlrm, refreshL4va]);

  return {
    vlrmBalance,
    l4vaBalance,
    isLoading: isVlrmLoading || isL4vaLoading,
    refreshBalances,
  };
};
