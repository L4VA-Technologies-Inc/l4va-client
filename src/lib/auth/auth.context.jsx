import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@ada-anvil/weld/react';

import { AuthContext } from '@/lib/auth/auth';
import { useProfile, useLogin } from '@/services/api/queries';

const WELD_INIT_GRACE_MS = 3000;

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isProfileLoading } = useProfile();
  const loginMutation = useLogin();
  const wallet = useWallet('isConnected', 'stakeAddressBech32');
  const disconnect = useWallet('disconnect');
  const previousStakeAddressRef = useRef(null);
  const gracePeriodPassedRef = useRef(false);
  const graceTimerRef = useRef(null);
  const authValidRef = useRef(false);
  const walletConnectedRef = useRef(false);

  authValidRef.current = !!profileData?.data;
  walletConnectedRef.current = wallet.isConnected;

  const logout = useCallback(
    message => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('authenticated_stake_address');
      localStorage.removeItem('vlrm_balance_cache');
      queryClient.setQueryData(['profile'], null);
      if (message) {
        sessionStorage.setItem('logout_toast', message);
      }
      disconnect();
      window.location.href = '/';
    },
    [queryClient, disconnect]
  );

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      queryClient.setQueryData(['profile'], null);
    }
  }, [queryClient]);

  useEffect(() => {
    const clearGraceTimer = () => {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };

    if (!profileData?.data) {
      previousStakeAddressRef.current = null;
      gracePeriodPassedRef.current = false;
      clearGraceTimer();
      return clearGraceTimer;
    }

    const authenticatedStakeAddress = localStorage.getItem('authenticated_stake_address');
    const currentStakeAddress = wallet.stakeAddressBech32;

    if (wallet.isConnected && currentStakeAddress) {
      clearGraceTimer();
      gracePeriodPassedRef.current = true;

      if (authenticatedStakeAddress && authenticatedStakeAddress !== currentStakeAddress) {
        logout('Wallet changed. Please login again.');
        previousStakeAddressRef.current = null;
        return clearGraceTimer;
      }

      if (previousStakeAddressRef.current && previousStakeAddressRef.current !== currentStakeAddress) {
        logout('Wallet changed. Please login again.');
        previousStakeAddressRef.current = null;
        return clearGraceTimer;
      }

      previousStakeAddressRef.current = currentStakeAddress;
      return clearGraceTimer;
    }

    if (previousStakeAddressRef.current && !wallet.isConnected) {
      logout('Wallet disconnected. Please login again.');
      previousStakeAddressRef.current = null;
      return clearGraceTimer;
    }

    const hasPriorWalletSession = !!authenticatedStakeAddress;
    if (hasPriorWalletSession && !wallet.isConnected && !gracePeriodPassedRef.current && !graceTimerRef.current) {
      graceTimerRef.current = setTimeout(() => {
        gracePeriodPassedRef.current = true;
        graceTimerRef.current = null;
        if (!walletConnectedRef.current && authValidRef.current) {
          logout('Wallet disconnected. Please login again.');
          previousStakeAddressRef.current = null;
        }
      }, WELD_INIT_GRACE_MS);
    }

    return clearGraceTimer;
  }, [wallet.isConnected, wallet.stakeAddressBech32, profileData?.data, logout]);

  const login = async (signature, stakeAddress, walletAddress) => {
    try {
      const response = await loginMutation.mutateAsync({
        signature,
        stakeAddress,
        walletAddress,
      });
      localStorage.setItem('jwt', response.data.accessToken);
      localStorage.setItem('authenticated_stake_address', stakeAddress);
      queryClient.setQueryData(['profile'], { data: response.data.user });
      return response.data;
    } catch (error) {
      return toast.error(error.message);
    }
  };

  const value = {
    isAuthenticated: !!profileData?.data,
    isLoading: isProfileLoading,
    user: profileData?.data,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
