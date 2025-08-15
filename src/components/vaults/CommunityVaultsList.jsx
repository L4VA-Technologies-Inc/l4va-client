import { useState, useEffect } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = {
  CONTRIBUTE: 'Contribute',
  ACQUIRE: 'Acquire',
  UPCOMING: 'Upcoming',
  PAST: 'Past',
};

const TABS = Object.values(VAULT_TABS);

const TAB_TO_FILTER = {
  [VAULT_TABS.ACQUIRE]: 'acquire',
  [VAULT_TABS.CONTRIBUTE]: 'contribution',
  [VAULT_TABS.UPCOMING]: 'published',
  [VAULT_TABS.PAST]: 'locked',
};

const FILTER_TO_TAB = Object.entries(TAB_TO_FILTER).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

export const CommunityVaultsList = ({ className = '' }) => {
  const search = useSearch({ from: '/vaults/' });
  const router = useRouter();

  const tabParam = search?.tab || 'contribution';
  const initialTab = FILTER_TO_TAB[tabParam] || VAULT_TABS.CONTRIBUTE;

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    router.navigate({
      to: '/vaults',
      search: { tab: TAB_TO_FILTER[tab] },
    });
  };

  const { data, isLoading, error } = useVaults(TAB_TO_FILTER[activeTab]);
  const vaults = data?.data?.items || [];

  return (
    <VaultList
      className={className}
      error={error?.message}
      isLoading={isLoading}
      tabs={TABS}
      title="Community Vaults"
      vaults={vaults}
      onTabChange={handleTabChange}
      activeTab={activeTab}
    />
  );
};
