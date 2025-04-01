import { useState, useEffect } from 'react';
import { VaultList } from './VaultsList';
import { VaultsApiProvider } from '@/services/api/vaults';

const VAULT_TABS = {
  INVEST: 'Invest',
  CONTRIBUTE: 'Contribute',
  UPCOMING: 'Upcoming',
  PAST: 'Past',
};

const TABS = Object.values(VAULT_TABS);

export const CommunityVaultsList = ({ className = '' }) => {
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
        case VAULT_TABS.INVEST:
          response = await VaultsApiProvider.getVaults('investment');
          break;
        case VAULT_TABS.CONTRIBUTE:
          response = await VaultsApiProvider.getVaults('contribution');
          break;
        case VAULT_TABS.UPCOMING:
          response = await VaultsApiProvider.getVaults();
          break;
        case VAULT_TABS.PAST:
          response = await VaultsApiProvider.getVaults();
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
      title="Community Vaults"
      vaults={vaults}
      onTabChange={setActiveTab}
    />
  );
};
