import { useState, useEffect } from 'react';

import { VaultsApiProvider } from '@/services/api/vaults';

import { VaultCard } from '@/components/vaults/home/VaultCard';

export const VaultsList = () => {
  const [vaults, setVaults] = useState([]);

  useEffect(() => {
    VaultsApiProvider.getVaults().then((response) => {
      setVaults(response.data);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vaults.map((vault) => (
        <VaultCard key={vault.id} {...vault} />
      ))}
    </div>
  );
};
