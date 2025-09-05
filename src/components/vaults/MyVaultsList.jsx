import { useState, useEffect } from 'react';
import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  LOCKED: 'Locked',
};

const TABS = Object.values(VAULT_TABS);

export const MyVaultsList = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit: 12,
    filter: activeTab.toLowerCase(),
    isOwner: true
  });

  useEffect(() => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: activeTab.toLowerCase()
    }));
  }, [activeTab]);

  const handleTabChange = tab => {
    setActiveTab(tab);
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: tab.toLowerCase()
    }));
  };

  const { data, isLoading, error } = useVaults(activeTab.toLowerCase(), appliedFilters);
  const vaults = data?.data?.items || [];

  const pagination = data?.data ? {
    currentPage: data.data.page,
    totalPages: data.data.totalPages,
    totalItems: data.data.total,
    limit: data.data.limit
  } : null;

  const handleApplyFilters = (filters) => {
    setAppliedFilters(prevFilters => ({
      page: 1,
      limit: prevFilters.limit || 12,
      filter: prevFilters.filter || 'contribution',
      ...filters
    }));
  };

  const handlePageChange = (page) => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: page
    }));
  };

  return (
    <VaultList
      className={className}
      error={error?.message}
      isLoading={isLoading}
      tabs={TABS}
      title="My Vaults"
      vaults={vaults}
      onTabChange={handleTabChange}
      activeTab={activeTab}
      appliedFilters={appliedFilters}
      onApplyFilters={handleApplyFilters}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};
