import { useState, useEffect } from 'react';
import { VaultList } from './VaultsList';
import { VaultsApiProvider } from '@/services/api/vaults';


export const FeaturedVaultsList = ({ className = '' }) => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVaults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await VaultsApiProvider.getMyDraftVaults();
      setVaults(response.data.items || []);
    } catch (err) {
      console.error('Error fetching vaults:', err);
      setError('Failed to load vaults. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  return (
    <VaultList
      className={className}
      error={error}
      isLoading={loading}
      title="Featured Vaults"
      vaults={vaults}
    />
  );
};
