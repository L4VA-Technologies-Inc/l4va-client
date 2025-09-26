import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { AuthContext } from '@/lib/auth/auth';
import { useProfile, useLogin } from '@/services/api/queries';

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: profileData, isLoading } = useProfile();
  const loginMutation = useLogin();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      queryClient.setQueryData(['profile'], null);
    }
  }, [queryClient]);

  useEffect(() => {
    const handleLogout = () => {
      queryClient.clear(); 
      queryClient.setQueryData(['profile'], null);

      try {
        router.navigate({ to: '/' });
      } catch {
        window.location.href = '/';
      }

      toast.error('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [queryClient, router]);

  const login = async (signature, stakeAddress, walletAddress) => {
    try {
      const response = await loginMutation.mutateAsync({
        signature,
        stakeAddress,
        walletAddress,
      });
      localStorage.setItem('jwt', response.data.accessToken);
      queryClient.setQueryData(['profile'], { data: response.data.user });
      return response.data;
    } catch (error) {
      return toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    queryClient.clear();
    queryClient.setQueryData(['profile'], null);

    try {
      router.navigate({ to: '/' });
    } catch {
      window.location.href = '/';
    }

    window.dispatchEvent(new CustomEvent('auth:logout'));
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
