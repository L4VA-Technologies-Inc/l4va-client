import { useEffect } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { axiosInstance } from '@/services/api';

export const useAuthInterceptor = function () {
  const disconnect = useWallet('disconnect');

  useEffect(() => {
    const authInterceptor = axiosInstance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        if (error.response?.status === 401) {
          disconnect();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosInstance.interceptors.response.eject(authInterceptor);
    };
  }, [disconnect]);
};
