import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

import VaultListItem from '@/components/vaults/VaultListItem';
import { LavaTabs } from '@/components/shared/LavaTabs';
import VaultFilter from '@/components/shared/VaultFilter';
import { VaultCard } from '@/components/vaults/VaultCard';
import { Spinner } from '@/components/Spinner';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useModalControls } from '@/lib/modals/modal.context';
import { Pagination } from '@/components/shared/Pagination';

const LoadingState = () => (
  <div className="py-8 flex items-center justify-center">
    <Spinner />
  </div>
);

const EmptyState = () => (
  <div className="py-8">
    <NoDataPlaceholder message="No vaults found" iconBgColor="bg-orange-500/15" iconInnerBgColor="bg-orange-500/30" />
    <div className="mt-4 text-center">
      <Link className={clsx('transition-all')} to="/create">
        <span className="text-orange-500 hover:underline">Create</span> your first vault to get started
      </Link>
    </div>
  </div>
);

export const VaultList = ({
  title = 'Vaults',
  tabs = [],
  vaults = [],
  isLoading = false,
  error = null,
  onTabChange,
  renderEmptyState = EmptyState,
  appliedFilters = {},
  onApplyFilters,
  activeTab: externalActiveTab,
  pagination,
  onPageChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]);
  const [viewType, setViewType] = useState('grid');
  const { openModal } = useModalControls();
  const vaultsListRef = useRef(null);

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const handleTabChange = tab => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleOpenFilters = () =>
    openModal('VaultFiltersModal', {
      onApplyFilters: onApplyFilters,
      initialFilters: appliedFilters,
    });

  const scrollUp = () => {
    if (pagination?.currentPage && vaultsListRef.current) {
      vaultsListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const renderVaultsView = () => {
    if (viewType === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map(vault => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      );
    }
    if (viewType === 'table') {
      return (
        <div className="flex flex-col gap-6 mt-6">
          {vaults.map(vault => (
            <VaultListItem key={vault.id} vault={vault} />
          ))}
        </div>
      );
    }
  };

  return (
    <div ref={vaultsListRef}>
      <div className="flex flex-col gap-6 md:gap-8">
        {title ? <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">{title}</h2> : null}
        {tabs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ">
            <div className="flex-1 w-full sm:w-auto">
              <LavaTabs
                className="overflow-x-auto text-sm md:text-base w-full"
                activeTab={activeTab}
                tabs={tabs}
                onTabChange={handleTabChange}
              />
            </div>
            <VaultFilter handleOpenFilters={handleOpenFilters} viewType={viewType} setViewType={setViewType} />
          </div>
        )}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : vaults.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderVaultsView()}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage || 1}
                  totalPages={pagination.totalPages}
                  onPageChange={page => {
                    onPageChange(page);
                    scrollUp();
                  }}
                  className="justify-center"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
