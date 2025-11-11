import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '@ada-anvil/weld/react';

import { useAuth } from '@/lib/auth/auth';

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
};
