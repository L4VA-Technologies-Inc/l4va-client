import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useVaultStatusTracker = vaultId => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!vaultId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['vault', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['vault-assets', vaultId] });
    }, 5000);

    return () => clearInterval(interval);
  }, [vaultId, queryClient]);
};
