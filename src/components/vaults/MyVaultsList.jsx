import { useState, useEffect } from 'react';
import { VaultList } from './shared/VaultsList';
import { VaultsApiProvider } from '@/services/api/vaults';

const VAULT_TABS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  LOCKED: 'Locked',
};

const TABS = Object.values(VAULT_TABS);

export const MyVaultsList = ({ className = '' }) => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const fetchVaults = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (tab) {
        case VAULT_TABS.DRAFT:
          response = await VaultsApiProvider.getMyDraftVaults();
          break;
        case VAULT_TABS.OPEN:
          response = await VaultsApiProvider.getMyOpenVaults();
          break;
        case VAULT_TABS.LOCKED:
          response = await VaultsApiProvider.getMyLockedVaults();
          break;
        default:
          break;
      }
      setVaults(response.data.items || []);
    } catch (err) {
      console.error('Error fetching vaults:', err);
      setError('Failed to load vaults. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults(activeTab);
  }, [activeTab]);

  return (
    <VaultList
      className={className}
      error={error}
      isLoading={loading}
      tabs={TABS}
      title="My Vaults"
      vaults={vaults}
      onTabChange={setActiveTab}
    />
  );
};
