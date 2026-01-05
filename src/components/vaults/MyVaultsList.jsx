import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@tanstack/react-router';

import { VaultList } from '@/components/vaults/VaultsList';
import { useVaults } from '@/services/api/queries';
import { capitalizeFirst } from '@/utils/core.utils.js';

const VAULT_TABS = {
  ALL: 'All',
  DRAFT: 'Draft',
  UPCOMING: 'Upcoming',
  OPEN: 'Open',
  LOCKED: 'Locked',
  GOVERN: 'Govern',
  FAILED: 'Failed',
  TERMINATED: 'Terminated',
};

const TABS = Object.values(VAULT_TABS);

export const MyVaultsList = ({ className = '', initialTab }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    const normalized = initialTab ? capitalizeFirst(initialTab) : null;

    if (normalized === 'Published') return 'Upcoming';

    if (normalized && TABS.includes(normalized)) {
      return normalized;
    }

    return TABS[0];
  });

  const [appliedFilters, setAppliedFilters] = useState(() => {
    const capitalizedTab = initialTab ? capitalizeFirst(initialTab) : TABS[0];
    const initialActiveTab = capitalizedTab && TABS.includes(capitalizedTab) ? capitalizedTab : TABS[0];
    const newTab =
      initialActiveTab === 'Upcoming'
        ? 'published'
        : initialActiveTab === 'Contribute'
          ? 'contribution'
          : initialActiveTab.toLowerCase();
    return {
      page: 1,
      limit: 12,
      filter: newTab,
      myVaults: true,
      search: '',
    };
  });

  const myVaultsListRef = useRef(null);

  useEffect(() => {
    const newTab =
      activeTab === 'Upcoming' ? 'published' : activeTab === 'Contribute' ? 'contribution' : activeTab.toLowerCase();

    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: newTab,
    }));
  }, [activeTab]);

  const handleSearch = useCallback(searchText => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      search: searchText,
      page: 1,
    }));
  }, []);

  const handleTabChange = tab => {
    const newTab = tab === 'Upcoming' ? 'published' : tab === 'Contribute' ? 'contribution' : tab.toLowerCase();

    setActiveTab(tab);
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: 1,
      filter: newTab,
    }));
    router.navigate({
      to: '/profile',
      search: prev => ({ ...prev, tab: newTab }),
      resetScroll: false,
      replace: true,
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
