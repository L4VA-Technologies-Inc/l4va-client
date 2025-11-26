import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '@ada-anvil/weld/react';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/lib/auth/auth';

export const useWalletChangeListener = () => {
  const wallet = useWallet('isConnected', 'stakeAddressBech32');
  const { user, logout, isAuthenticated } = useAuth();

  const previousStakeAddressRef = useRef(null);
  const previousJwtRef = useRef(null);

  const isJwtExpired = token => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      previousStakeAddressRef.current = null;
      previousJwtRef.current = null;
      return;
    }

    const currentStakeAddress = wallet.stakeAddressBech32;
    const currentJwt = localStorage.getItem('jwt');

    if (!currentJwt) {
      previousJwtRef.current = null;
    }

    if (currentJwt && previousJwtRef.current && previousJwtRef.current !== currentJwt) {
      toast.error('Session updated. Please login again.');
      logout();
      previousJwtRef.current = null;
      return;
    }

    if (currentJwt && isJwtExpired(currentJwt)) {
      toast.error('Session expired. Please login again.');
      logout();
      previousJwtRef.current = null;
      return;
    }

    if (!previousJwtRef.current && currentJwt) {
      previousJwtRef.current = currentJwt;
    }

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
    const listener = () => {
      const newJwt = localStorage.getItem('jwt');
      if (previousJwtRef.current && previousJwtRef.current !== newJwt) {
        toast.error('Session changed in another tab. Please login again.');
        logout();
      }
    };

    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [logout]);
};
