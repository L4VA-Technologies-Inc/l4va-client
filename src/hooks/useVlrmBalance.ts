import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

const VLRM_CACHE_KEY = 'vlrm_balance_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const VLRM_TOKEN_ID = (import.meta as any).env.VITE_VLRM_TOKEN_ID;
const VLRM_POLICY_ID = VLRM_TOKEN_ID.slice(0, 56);
const VLRM_ASSET_NAME = VLRM_TOKEN_ID.slice(56);

export const useVlrmBalance = () => {
  const [vlrmBalance, setVlrmBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const wallet = useWallet('handler', 'isConnected');

  const fetchVlrmBalance = useCallback(
    async (showToast = false) => {
      if (!wallet.handler) return;

      setIsLoading(true);
      try {
        const changeAddress = await wallet.handler.getChangeAddressBech32();
        const balanceHex = await wallet.handler.getBalance();

        const balance = parseCborBalance(balanceHex, VLRM_POLICY_ID, VLRM_ASSET_NAME);

        setVlrmBalance(balance);
        setLastUpdated(new Date());

        localStorage.setItem(
          VLRM_CACHE_KEY,
          JSON.stringify({ balance, timestamp: Date.now(), address: changeAddress })
        );

        if (showToast) toast.success('VLRM balance updated');
      } catch (err) {
        console.error('Error fetching VLRM balance:', err);
        if (showToast) toast.error('Failed to update VLRM balance');
        setVlrmBalance(0);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.handler]
  );

  const refreshBalance = useCallback(() => fetchVlrmBalance(true), [fetchVlrmBalance]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(VLRM_CACHE_KEY);
    setVlrmBalance(0);
    setLastUpdated(null);
  }, []);

  useEffect(() => {
    const loadCache = async () => {
      if (!wallet.handler) return false;

      try {
        const cached = localStorage.getItem(VLRM_CACHE_KEY);
        if (!cached) return false;

        const { balance, timestamp, address } = JSON.parse(cached);
        const currentAddress = await wallet.handler.getChangeAddressBech32();

        if (Date.now() - timestamp < CACHE_EXPIRY_MS && address === currentAddress) {
          setVlrmBalance(balance);
          setLastUpdated(new Date(timestamp));
          return true;
        }
      } catch {
        localStorage.removeItem(VLRM_CACHE_KEY);
      }
      return false;
    };

    (async () => {
      const cacheHit = await loadCache();
      if (!cacheHit) fetchVlrmBalance();
    })();
  }, [fetchVlrmBalance, wallet.handler]);

  return { vlrmBalance, isLoading, lastUpdated, refreshBalance, clearCache, fetchVlrmBalance };
};

const parseCborBalance = (cborHex: string, policyId: string, assetName: string): number => {
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

    return quantity;
  } catch {
    return 0;
  }
};
