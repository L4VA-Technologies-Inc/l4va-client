import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';
import { useNetwork } from '@/hooks/useNetwork';
import { VaultTypeFilter } from '@/components/vaults/index/VaultTypeFilter';
import { useVaultArchetypes } from '@/hooks/useVaultArchetypes';

const VAULT_TABS = [
  { id: 'all', label: 'All', filter: 'all' },
  { id: 'upcoming', label: 'Upcoming', filter: 'published' },
  { id: 'contribution', label: 'Contribute', filter: 'contribution' },
  { id: 'expansion', label: 'Expansion', filter: 'expansion' },
  { id: 'acquire', label: 'Acquire', filter: 'acquire' },
  { id: 'past', label: 'Locked', filter: 'locked' },
  { id: 'govern', label: 'Govern', filter: 'govern' },
  { id: 'terminated', label: 'Terminated', filter: 'terminated' },
];

const DEFAULT_TAB = 'all';

export const CommunityVaultsList = ({ className = '' }) => {
  const search = useSearch({ from: '/vaults/' });
  const router = useRouter();
  const communityVaultsListRef = useRef(null);
  const archetypes = useVaultArchetypes();

  const tabParam = search?.tab || DEFAULT_TAB;
  const initialTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);

  const { network } = useNetwork();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit: 12,
    filter: initialTab.filter,
    search: '',
    chainType: network,
  });

  useEffect(() => {
    const newTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);
    setActiveTab(newTab);
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: newTab.filter,
    }));
  }, [tabParam]);

  // Keep the vault search in sync with the network selected in the header.
  useEffect(() => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      chainType: network,
      page: 1,
    }));
  }, [network]);

  const handleSearch = useCallback(searchText => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      search: searchText,
      page: 1,
    }));
  }, []);

  const handleTabChange = tab => {
    const selectedTab = VAULT_TABS.find(t => t.label === tab);
    if (selectedTab) {
      setActiveTab(selectedTab);
      setAppliedFilters(prevFilters => ({
        ...prevFilters,
        page: 1,
        filter: selectedTab.filter,
      }));
      router.navigate({
        to: '/vaults',
        search: { tab: selectedTab.id },
        resetScroll: false,
        replace: true,
      });
    }
  };

  // Vault types only exist on Robinhood; drop the filter when switching to Cardano.
  const isRobinhood = network === 'robinhood';
  useEffect(() => {
    if (!isRobinhood) {
      setAppliedFilters(prevFilters =>
        prevFilters.vaultArchetype ? { ...prevFilters, vaultArchetype: undefined, page: 1 } : prevFilters
      );
    }
  }, [isRobinhood]);

  const handleArchetypeChange = vaultArchetype => {
    setAppliedFilters(prevFilters => ({ ...prevFilters, vaultArchetype, page: 1 }));
  };

  const { data, isLoading, isPlaceholderData, error } = useVaults(appliedFilters);
  const vaults = data?.data?.items || [];

  const pagination = data?.data
    ? {
        currentPage: data.data.page,
        totalPages: data.data.totalPages,
        totalItems: data.data.total,
        limit: data.data.limit,
      }
    : null;

  const handleApplyFilters = filters => {
    setAppliedFilters(prevFilters => ({
      page: 1,
      limit: prevFilters.limit || 12,
      filter: prevFilters.filter || 'contribution',
      chainType: network,
      vaultArchetype: prevFilters.vaultArchetype,
      ...filters,
    }));
  };

  const handlePageChange = page => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: page,
    }));

    if (communityVaultsListRef.current) {
      communityVaultsListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div ref={communityVaultsListRef}>
      <VaultList
        className={className}
        error={error?.message}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        tabs={VAULT_TABS.filter(tab => !(network === 'robinhood' && tab.id === 'contribution')).map(tab => tab.label)}
        title="All Vaults"
        vaults={vaults}
        onTabChange={handleTabChange}
        activeTab={activeTab.label}
        appliedFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        toolbar={
          // Nothing to filter by when the chain only offers one vault type.
          isRobinhood && archetypes.hasChoice ? (
            <VaultTypeFilter value={appliedFilters.vaultArchetype} onChange={handleArchetypeChange} />
          ) : null
        }
      />
    </div>
  );
};
