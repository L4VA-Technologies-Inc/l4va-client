import { useEffect, useState } from 'react';

import { useVaults } from '@/services/api/queries.js';
import { VaultList } from '@/components/vaults/VaultsList.jsx';

const VAULT_TABS = [
  { id: 'contribution', label: 'Contribute', filter: 'contribution' },
  { id: 'acquire', label: 'Acquire', filter: 'acquire' },
  { id: 'upcoming', label: 'Upcoming', filter: 'published' },
  { id: 'past', label: 'Locked', filter: 'locked' },
  { id: 'terminated', label: 'Terminated', filter: 'terminated' },
  { id: 'all', label: 'All', filter: 'all' },
];

const DEFAULT_TAB = 'contribution';

const VaultsFilters = ({ className = '' }) => {
  const tabParam = DEFAULT_TAB;
  const initialTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const newTab = VAULT_TABS.find(tab => tab.id === tabParam) || VAULT_TABS.find(tab => tab.id === DEFAULT_TAB);
    setActiveTab(newTab);
  }, [tabParam]);
  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit: 12,
    filter: initialTab.filter,
  });

  const handleTabChange = tab => {
    const selectedTab = VAULT_TABS.find(t => t.label === tab);
    if (selectedTab) {
      setActiveTab(selectedTab);
      setAppliedFilters(prevFilters => ({
        ...prevFilters,
        page: 1,
        filter: selectedTab.filter,
      }));
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
  };

  return (
    <VaultList
      className={className}
      error={error?.message}
      isLoading={isLoading}
      tabs={VAULT_TABS.map(tab => tab.label)}
      vaults={vaults}
      onTabChange={handleTabChange}
      activeTab={activeTab.label}
      appliedFilters={appliedFilters}
      onApplyFilters={handleApplyFilters}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};

export default VaultsFilters;
