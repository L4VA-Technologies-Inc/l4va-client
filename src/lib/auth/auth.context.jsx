import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { AuthContext } from '@/lib/auth/auth';
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

  const logout = message => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('authenticated_stake_address');
    localStorage.removeItem('vlrm_balance_cache');
    queryClient.setQueryData(['profile'], null);
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
