import { useState } from 'react';
import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = {
  CONTRIBUTE: 'Contribute',
  ACQUIRE: 'Acquire',
  UPCOMING: 'Upcoming',
  PAST: 'Past',
};

const TABS = Object.values(VAULT_TABS);

export const CommunityVaultsList = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const acquireVaults = useVaults('acquire');
  const contributeVaults = useVaults('contribution');
  const upcomingVaults = useVaults();
  const pastVaults = useVaults('locked');

  const getVaultsData = () => {
    switch (activeTab) {
      case VAULT_TABS.ACQUIRE:
        return {
          data: acquireVaults.data?.data?.items || [],
          isLoading: acquireVaults.isLoading,
          error: acquireVaults.error?.message,
        };
      case VAULT_TABS.CONTRIBUTE:
        return {
          data: contributeVaults.data?.data?.items || [],
          isLoading: contributeVaults.isLoading,
          error: contributeVaults.error?.message,
        };
      case VAULT_TABS.UPCOMING:
        return {
          data: upcomingVaults.data?.data?.items || [],
          isLoading: upcomingVaults.isLoading,
          error: upcomingVaults.error?.message,
        };
      case VAULT_TABS.PAST:
        return {
          data: pastVaults.data?.data?.items || [],
          isLoading: pastVaults.isLoading,
          error: pastVaults.error?.message,
        };
      default:
        return { data: [], isLoading: false, error: null };
    }
  };

  const { data: vaults, isLoading, error } = getVaultsData();

  return (
    <VaultList
      className={className}
      error={error}
      isLoading={isLoading}
      tabs={TABS}
      title="Community Vaults"
      vaults={vaults}
      onTabChange={setActiveTab}
    />
  );
};
