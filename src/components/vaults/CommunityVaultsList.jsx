import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = [
  { id: 'contribution', label: 'Contribute', filter: 'contribution' },
  { id: 'acquire', label: 'Acquire', filter: 'acquire' },
  { id: 'upcoming', label: 'Upcoming', filter: 'published' },
  { id: 'past', label: 'Locked', filter: 'locked' },
  { id: 'terminated', label: 'Terminated', filter: 'terminated' },
];

const DEFAULT_TAB = 'contribution';

export const CommunityVaultsList = ({ className = '' }) => {
  const search = useSearch({ from: '/vaults/' });
  const router = useRouter();
  const communityVaultsListRef = useRef(null);

  const tabParam = search?.tab || DEFAULT_TAB;
  const initialTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit: 12,
    filter: initialTab.filter,
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
      });
    }
  };

  const { data, isLoading, error } = useVaults(appliedFilters);
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
        tabs={VAULT_TABS.map(tab => tab.label)}
        title="All Vaults"
        vaults={vaults}
        onTabChange={handleTabChange}
        activeTab={activeTab.label}
        appliedFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
