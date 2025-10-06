import { useRef, useState } from 'react';

import { VaultList } from '@/components/vaults/VaultsList.jsx';
import { useVaults } from '@/services/api/queries.js';

export const FailedVaultsList = ({ className = '' }) => {
  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit: 12,
    filter: 'failed',
    myVaults: false,
  });
  const myVaultsListRef = useRef(null);

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
      filter: prevFilters.filter || 'failed',
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
        tabs={['Failed']}
        title="Failed Vaults"
        vaults={vaults}
        appliedFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
