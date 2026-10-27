import { useEffect, useRef } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';
import { robinhoodChain } from '@/lib/evm/wagmi.config';

/**
 * Asks a logged-in Robinhood user's wallet to move to Robinhood Chain (adding it first
 * when the wallet doesn't know it) so the first transaction doesn't open with a network
 * prompt. Runs only after login settles — switching during login makes MetaMask emit a
 * second popup and an accountsChanged, which the wallet-change watchdog treats as a
 * logout. Tried once per (address, chain) so a rejected prompt is not repeated.
 */
export const useAutoSwitchRobinhoodChain = () => {
  const { isRobinHood } = useNetwork();
  const { isAuthenticated } = useAuth();
  const { address, chainId, status } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const attemptedKey = useRef(null);

  useEffect(() => {
    if (!isRobinHood || !isAuthenticated || status !== 'connected' || !address) return;
    if (chainId === robinhoodChain.id) return;

    const key = `${address}:${chainId}`;
    if (attemptedKey.current === key) return;

    // isAuthenticated flips before the login modal clears its in-progress flag, so wait
    // for the flag rather than reading it once.
    const timer = setInterval(() => {
      if (sessionStorage.getItem('evm_login_in_progress')) return;
      clearInterval(timer);
      attemptedKey.current = key;
      // A rejection is fine: every transaction hook still switches on demand.
      switchChainAsync({ chainId: robinhoodChain.id }).catch(() => {});
    }, 500);
    return () => clearInterval(timer);
  }, [isRobinHood, isAuthenticated, status, address, chainId, switchChainAsync]);
};
