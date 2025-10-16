import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@tanstack/react-router';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';

const VAULT_TABS = {
  ALL: 'All',
  DRAFT: 'Draft',
  OPEN: 'Open',
  LOCKED: 'Locked',
  GOVERN: 'Govern',
  FAILED: 'Failed',
  TERMINATED: 'Terminated',
};

const TABS = Object.values(VAULT_TABS);

export const MyVaultsList = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab && TABS.includes(initialTab)) {
      return initialTab;
    }
    return TABS[0];
  });

  const [appliedFilters, setAppliedFilters] = useState(() => {
    const initialActiveTab = initialTab && TABS.includes(initialTab) ? initialTab : TABS[0];
    return {
      page: 1,
      limit: 12,
      filter: initialActiveTab.toLowerCase(),
      myVaults: true,
      search: '',
    };
  });

  const myVaultsListRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: activeTab.toLowerCase(),
    }));
  }, [activeTab]);

  const handleSearch = searchText => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      search: searchText,
      page: 1,
    }));
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: tab.toLowerCase(),
    }));
    router.navigate({
      to: '/vaults/my',
      search: { tab: tab },
    });
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
      myVaults: true,
      filter: prevFilters.filter || 'contribution',
      ...filters,
    }));
  };

  const handlePageChange = page => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: page,
    }));

    if (myVaultsListRef.current) {
      myVaultsListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div ref={myVaultsListRef}>
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
        onSearch={handleSearch}
      />
    </div>
  );
};
