import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '@ada-anvil/weld/react';

import { useAuth } from '@/lib/auth/auth';

const checkWeldCookies = () => {
  const requiredCookies = ['weld_connected-wallet', 'weld_connected-stake', 'weld_connected-change'];

  return requiredCookies.every(cookieName => {
    return document.cookie.split('; ').some(cookie => cookie.startsWith(`${cookieName}=`));
  });
};

export const useWalletChangeListener = () => {
  const wallet = useWallet('isConnected', 'stakeAddressBech32');
  const { user, logout, isAuthenticated } = useAuth();
  const previousStakeAddressRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      previousStakeAddressRef.current = null;
      return;
    }

    const currentStakeAddress = wallet.stakeAddressBech32;

    if (!previousStakeAddressRef.current && currentStakeAddress) {
      previousStakeAddressRef.current = currentStakeAddress;
      return;
    }

    if (!wallet.isConnected && previousStakeAddressRef.current) {
      toast.error('Wallet disconnected. Please login again.');
      logout();
      previousStakeAddressRef.current = null;
      return;
    }

    if (currentStakeAddress && previousStakeAddressRef.current !== currentStakeAddress) {
      toast.error('Wallet changed. Please login again.');
      logout();
      previousStakeAddressRef.current = null;
    }
  }, [wallet.isConnected, wallet.stakeAddressBech32, user, isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const checkCookies = () => {
      const hasCookies = checkWeldCookies();

      if (!hasCookies) {
        toast.error('Wallet session expired. Please login again.');
        logout();
        previousStakeAddressRef.current = null;
      }
    };

    checkCookies();

    const intervalId = setInterval(checkCookies, 5000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user, logout]);
};
