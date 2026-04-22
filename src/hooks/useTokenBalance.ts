import { useState, useEffect, useCallback } from 'react';
import { parseBalance } from '@ada-anvil/weld';
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
  const wallet = useWallet('handler', 'isConnected', 'balanceDecoded');

  const policyId = tokenId?.slice(0, 56) ?? '';
  const assetName = tokenId?.slice(56) ?? '';

  const parseTokenBalance = useCallback(
    (source: unknown): number => {
      const raw = parseBalance(source, { policyId, assetName });
      return raw / Math.pow(10, decimals);
    },
    [policyId, assetName, decimals]
  );

  // Sync balance from weld's reactive decoded state (auto-updates on wallet changes).
  useEffect(() => {
    if (wallet.isConnected && tokenId) {
      setBalance(parseTokenBalance(wallet.balanceDecoded));
    } else {
      setBalance(0);
    }
  }, [wallet.isConnected, wallet.balanceDecoded, tokenId, parseTokenBalance]);

  // Explicit refresh: forces a fresh read from the wallet extension so the UI
  // reflects the updated on-chain state immediately after a transaction.
  const refreshBalance = useCallback(
    async (showToast = false): Promise<number | undefined> => {
      if (!wallet.handler || !tokenId) return;
      setIsLoading(true);
      try {
        const hex = await wallet.handler.getBalance();
        const parsed = parseTokenBalance(hex);
        setBalance(parsed);
        if (showToast) toast.success(`${label} balance updated`);
        return parsed;
      } catch (err) {
        console.error(`Error fetching ${label} balance:`, err);
        if (showToast) toast.error(`Failed to update ${label} balance`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.handler, tokenId, parseTokenBalance, label]
  );

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
