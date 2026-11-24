import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { AuthContext, VAULT_DRAFT_OWNER_KEY, clearAuthLocalStorage, clearVaultCreationStorage } from '@/lib/auth/auth';
import { useProfile, useLogin } from '@/services/api/queries';

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading } = useProfile();
  const loginMutation = useLogin();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      queryClient.setQueryData(['profile'], null);
    }
  }, [queryClient]);

  // Switching accounts without logging out must not carry one user's vault draft and AI chat
  // into another's: drafts are tagged with their owner and dropped when someone else signs in.
  // Runs during render, not in an effect: the provider renders before the pages, and the AI
  // builder reads storage in its own render, so an effect would fire after the stale read.
  const userId = profileData?.data?.id;
  const checkedOwnerRef = useRef(null);
  if (userId && checkedOwnerRef.current !== userId) {
    checkedOwnerRef.current = userId;
    try {
      if (localStorage.getItem(VAULT_DRAFT_OWNER_KEY) !== userId) {
        clearVaultCreationStorage();
        localStorage.setItem(VAULT_DRAFT_OWNER_KEY, userId);
      }
    } catch {
      // Storage unavailable: nothing persisted to leak either.
    }
  }

  const login = async (signature, stakeAddress, walletAddress, chainType, evmSignature) => {
    try {
      const response = await loginMutation.mutateAsync({
        signature,
        stakeAddress,
        walletAddress,
        chainType,
        evmSignature,
      });
      if (!response.data?.accessToken) {
        throw new Error(response.data?.message || 'Login failed');
      }
      localStorage.setItem('jwt', response.data.accessToken);
      if (stakeAddress) {
        localStorage.setItem('authenticated_stake_address', stakeAddress);
      } else {
        localStorage.removeItem('authenticated_stake_address');
      }
      if (walletAddress) {
        localStorage.setItem('authenticated_wallet_address', walletAddress);
      } else {
        localStorage.removeItem('authenticated_wallet_address');
      }
      if (chainType) {
        localStorage.setItem('authenticated_chain_type', chainType);
      } else {
        localStorage.removeItem('authenticated_chain_type');
      }
      queryClient.setQueryData(['profile'], { data: response.data.user });
      return response.data;
    } catch (error) {
      return toast.error(error.message);
    }
  };

  const logout = message => {
    clearAuthLocalStorage();
    queryClient.setQueryData(['profile'], null);

    // Clear DexHunter Swap component state
    localStorage.removeItem('dexhunter-selected-wallet');

    if (message) {
      sessionStorage.setItem('logout_toast', message);
    }
    window.location.href = '/';
  };

  const value = {
    isAuthenticated: !!profileData?.data,
    isLoading,
    user: profileData?.data,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
