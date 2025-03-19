import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';

import { CreateVault } from './CreateVault';
import { VaultProfile } from './VaultProfile';
import { Spinner } from '@/components/Spinner';

import { VaultsApiProvider } from '@/services/api/vaults';

import { VAULT_STATUSES } from '@/components/vaults/constants/vaults.constants';

export const Vault = () => {
  const { id } = useParams();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const response = await VaultsApiProvider.getVault(id);
        setVault(response.data);
      } catch (error) {
        console.error('Error fetching vault:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVault();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!vault) {
    return <Navigate replace to="/vaults" />;
  }

  if (vault.vaultStatus === VAULT_STATUSES.DRAFT) {
    return <CreateVault vault={vault} />;
  }

  return <VaultProfile vault={vault} />;
};
