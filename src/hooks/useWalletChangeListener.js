import { useEffect, useRef } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import { useAccount } from 'wagmi';

import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';

const checkWeldCookies = () => {
  const requiredCookies = ['weld_connected-wallet', 'weld_connected-stake', 'weld_connected-change'];

  return requiredCookies.every(cookieName => {
    return document.cookie.split('; ').some(cookie => cookie.startsWith(`${cookieName}=`));
  });
};

export const useWalletChangeListener = () => {
  const wallet = useWallet('isConnected', 'stakeAddressBech32');
  const { address: evmAddress, status: evmStatus } = useAccount();
  const { user, logout, isAuthenticated } = useAuth();
  const { isRobinHood } = useNetwork();
  const previousStakeAddressRef = useRef(null);
  const previousEvmAddressRef = useRef(null);
  const evmDisconnectedLogoutTimerRef = useRef(null);

  // Proactively clear DexHunter localStorage when auth/wallet becomes invalid
  useEffect(() => {
    if (!isAuthenticated || !wallet.isConnected) {
      localStorage.removeItem('dexhunter-selected-wallet');
    }
  }, [isAuthenticated, wallet.isConnected]);

  useEffect(() => {
    // Weld/Cardano-only watchdog — EVM (Robinhood) has no Weld wallet/stake address.
    if (isRobinHood || !isAuthenticated || !user) {
      previousStakeAddressRef.current = null;
      return;
    }

    const currentStakeAddress = wallet.stakeAddressBech32;

    if (!previousStakeAddressRef.current && currentStakeAddress) {
      const authenticatedStakeAddress = localStorage.getItem('authenticated_stake_address');

      if (authenticatedStakeAddress && authenticatedStakeAddress !== currentStakeAddress) {
        logout('Wallet changed. Please login again.');
        return;
      }

      previousStakeAddressRef.current = currentStakeAddress;
      return;
    }

    if (!wallet.isConnected && previousStakeAddressRef.current) {
      logout('Wallet disconnected. Please login again.');
      previousStakeAddressRef.current = null;
      return;
    }

    if (currentStakeAddress && previousStakeAddressRef.current !== currentStakeAddress) {
      logout('Wallet changed. Please login again.');
      previousStakeAddressRef.current = null;
    }
  }, [wallet.isConnected, wallet.stakeAddressBech32, user, isAuthenticated, logout, isRobinHood]);

  useEffect(() => {
    // EVM (Robinhood) watchdog — mirrors the Cardano branch using wagmi's MetaMask/injected state.
    if (!isRobinHood || !isAuthenticated || !user) {
      previousEvmAddressRef.current = null;
      if (evmDisconnectedLogoutTimerRef.current) {
        clearTimeout(evmDisconnectedLogoutTimerRef.current);
        evmDisconnectedLogoutTimerRef.current = null;
      }
      return;
    }

    // wagmi reconnects asynchronously on load; wait for a settled state so we don't
    // log out during 'connecting' / 'reconnecting'.
    if (evmStatus === 'connecting' || evmStatus === 'reconnecting') {
      if (evmDisconnectedLogoutTimerRef.current) {
        clearTimeout(evmDisconnectedLogoutTimerRef.current);
        evmDisconnectedLogoutTimerRef.current = null;
      }
      return;
    }

    if (evmStatus === 'connected' && evmAddress) {
      if (evmDisconnectedLogoutTimerRef.current) {
        clearTimeout(evmDisconnectedLogoutTimerRef.current);
        evmDisconnectedLogoutTimerRef.current = null;
      }

      const authenticatedEvmAddress = localStorage.getItem('authenticated_wallet_address');
      if (authenticatedEvmAddress && authenticatedEvmAddress.toLowerCase() !== evmAddress.toLowerCase()) {
        logout('Wallet changed. Please login again.');
        previousEvmAddressRef.current = null;
        return;
      }

      // First settled connection — record it as the baseline.
      if (!previousEvmAddressRef.current) {
        previousEvmAddressRef.current = evmAddress;
        return;
      }

      if (previousEvmAddressRef.current.toLowerCase() !== evmAddress.toLowerCase()) {
        logout('Wallet changed. Please login again.');
        previousEvmAddressRef.current = null;
      }
      return;
    }

    if (evmStatus === 'disconnected' && previousEvmAddressRef.current) {
      logout('Wallet disconnected. Please login again.');
      previousEvmAddressRef.current = null;
      return;
    }

    // On a fresh page load the in-memory previous address is empty, so also
    // treat an authenticated EVM session with a disconnected wallet as invalid.
    if (evmStatus === 'disconnected' && !evmDisconnectedLogoutTimerRef.current) {
      evmDisconnectedLogoutTimerRef.current = setTimeout(() => {
        evmDisconnectedLogoutTimerRef.current = null;
        if (!localStorage.getItem('jwt')) return;

        const authenticatedChainType = localStorage.getItem('authenticated_chain_type');
        if (authenticatedChainType && authenticatedChainType !== 'robinhood') return;

        logout('Wallet disconnected. Please login again.');
      }, 500);
    }

    return () => {
      if (evmDisconnectedLogoutTimerRef.current) {
        clearTimeout(evmDisconnectedLogoutTimerRef.current);
        evmDisconnectedLogoutTimerRef.current = null;
      }
    };
  }, [isRobinHood, isAuthenticated, user, evmAddress, evmStatus, logout]);

  useEffect(() => {
    // Weld cookie check would fire for EVM logins (no Weld cookies) and wrongly log them out.
    if (isRobinHood || !isAuthenticated || !user) {
      return;
    }

    const checkCookies = () => {
      const hasCookies = checkWeldCookies();

      if (!hasCookies) {
        logout('Wallet session expired. Please login again.');
        previousStakeAddressRef.current = null;
      }
    };

    checkCookies();

    const intervalId = setInterval(checkCookies, 5000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user, logout, isRobinHood]);
};
