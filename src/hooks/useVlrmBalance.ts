import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useWallet } from '@ada-anvil/weld/react';

import { TapToolsApiProvider } from '@/services/api/taptools';

const VLRM_CACHE_KEY = 'vlrm_balance_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hour

export const useVlrmBalance = () => {
  const [vlrmBalance, setVlrmBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const wallet = useWallet('handler', 'isConnected');

  const fetchVlrmBalance = useCallback(
    async (showToast = false) => {
      if (!wallet.handler) {
        setVlrmBalance(0);
        return;
      }

      setIsLoading(true);

      try {
        const changeAddress = await wallet.handler.getChangeAddressBech32();
        const { data } = await TapToolsApiProvider.getWalletAssetAmount(
          (import.meta as any).env.VITE_VLRM_TOKEN_ID,
          changeAddress
        );

        const balance = data || 0;
        const timestamp = Date.now();

        // Update state
        setVlrmBalance(balance);
        setLastUpdated(new Date(timestamp));

        // Save to cache
        localStorage.setItem(
          VLRM_CACHE_KEY,
          JSON.stringify({
            balance,
            timestamp,
            address: changeAddress,
          })
        );

        if (showToast) {
          toast.success('VLRM balance updated');
        }
      } catch (error) {
        console.error('Error fetching VLRM balance:', error);
        if (showToast) {
          toast.error('Failed to update VLRM balance');
        }
        setVlrmBalance(0);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.handler]
  );

  const refreshBalance = useCallback(() => {
    fetchVlrmBalance(true); // Show toast on manual refresh
  }, [fetchVlrmBalance]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(VLRM_CACHE_KEY);
    setVlrmBalance(0);
    setLastUpdated(null);
  }, []);

  useEffect(() => {
    const loadFromCache = async () => {
      try {
        const cached = localStorage.getItem(VLRM_CACHE_KEY);
        if (cached) {
          const { balance, timestamp, address } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_MS;

          // Check if cache is for current wallet address
          const currentAddress = wallet.handler ? await wallet.handler.getChangeAddressBech32() : undefined;

          if (!isExpired && address === currentAddress) {
            setVlrmBalance(balance);
            setLastUpdated(new Date(timestamp));
            return true; // Cache hit
          }
        }
      } catch (error) {
        console.warn('Failed to load VLRM balance from cache:', error);
        localStorage.removeItem(VLRM_CACHE_KEY);
      }
      return false; // Cache miss
    };

    (async () => {
      const cacheHit = await loadFromCache();

      if (!cacheHit && wallet.handler) {
        fetchVlrmBalance();
      }
    })();
  }, [fetchVlrmBalance, wallet.handler]);

  return {
    vlrmBalance,
    isLoading,
    lastUpdated,
    refreshBalance,
    clearCache,
    fetchVlrmBalance,
  };
};
