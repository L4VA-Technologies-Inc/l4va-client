import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getCountdownTime } from '@/utils/core.utils';

export const useVaultStatusTracker = vault => {
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!vault) return;

    const checkVaultStatus = () => {
      const countdownTime = getCountdownTime(vault);

      if (!countdownTime) return;

      const now = Date.now();
      const timeLeft = countdownTime - now;

      console.log('timeLeft', timeLeft);

      if (timeLeft <= 0) {
        queryClient.invalidateQueries({ queryKey: ['vault', vault.id] });
        queryClient.invalidateQueries({ queryKey: ['vault-assets', vault.id] });
      }
    };

    checkVaultStatus();

    intervalRef.current = setInterval(checkVaultStatus, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [vault, queryClient]);
};
