import { useState, useEffect } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = [
  { id: 'contribution', label: 'Contribute', filter: 'contribution' },
  { id: 'acquire', label: 'Acquire', filter: 'acquire' },
  { id: 'upcoming', label: 'Upcoming', filter: 'published' },
  { id: 'past', label: 'Past', filter: 'locked' },
];

const DEFAULT_TAB = 'contribution';

export const CommunityVaultsList = ({ className = '' }) => {
  const search = useSearch({ from: '/vaults/' });
  const router = useRouter();

  const tabParam = search?.tab || DEFAULT_TAB;
  const initialTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const newTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);
    setActiveTab(newTab);
  }, [tabParam]);

  const handleTabChange = tab => {
    const selectedTab = VAULT_TABS.find(t => t.label === tab);
    if (selectedTab) {
      setActiveTab(selectedTab);
      router.navigate({
        to: '/vaults',
        search: { tab: selectedTab.id },
      });
    }
  };

  const { data, isLoading, error } = useVaults(activeTab.filter);
  const vaults = data?.data?.items || [];

  return (
    <VaultList
      className={className}
      error={error?.message}
      isLoading={isLoading}
      tabs={VAULT_TABS.map(tab => tab.label)}
      title="Community Vaults"
      vaults={vaults}
      onTabChange={handleTabChange}
      activeTab={activeTab.label}
    />
  );
};
