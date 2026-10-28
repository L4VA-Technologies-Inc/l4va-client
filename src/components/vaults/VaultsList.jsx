import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

import VaultListItem from '@/components/vaults/VaultListItem';
import VaultFilter from '@/components/shared/VaultFilter';
import { VaultCard } from '@/components/vaults/VaultCard';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useModalControls } from '@/lib/modals/modal.context';
import { Pagination } from '@/components/shared/Pagination';
import { LavaSearchInput } from '@/components/shared/LavaInput.jsx';
import { LavaTabs } from '@/components/shared/LavaTabs.jsx';

// Loading placeholders shaped like VaultCard / VaultListItem, so the page doesn't jump.
const Bone = ({ className = '' }) => <div className={clsx('animate-pulse rounded bg-steel-850', className)} />;

const VaultCardSkeleton = () => (
  <div className="w-full max-w-md rounded-xl bg-steel-950 overflow-hidden flex flex-col" aria-hidden="true">
    <Bone className="h-52 rounded-none" />
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Bone className="h-16 w-16 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Bone className="h-4 w-1/2" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-3/4" />
        </div>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4 mt-auto">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Bone className="h-3 w-10" />
            <Bone className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
    <div className="h-10 px-6 pb-6" />
  </div>
);

const VaultListItemSkeleton = () => (
  <div className="relative mb-6" aria-hidden="true">
    <Bone className="hidden md:block absolute bottom-9 left-2.5 w-[98px] h-[98px] rounded-2xl" />
    <div className="md:ml-[120px] mb-3 space-y-2">
      <Bone className="h-6 w-48" />
      <Bone className="h-3.5 w-72 max-w-full" />
    </div>
    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 py-4 border-[var(--color-steel-750)] border rounded-2xl bg-[var(--color-steel-950)] md:pl-[110px]">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={clsx('flex flex-col items-center gap-2', i === 4 && 'hidden md:flex')}>
          <Bone className="h-3.5 w-10" />
          <Bone className="h-4 w-14" />
        </div>
      ))}
    </div>
  </div>
);

const LoadingState = ({ viewType }) =>
  viewType === 'table' ? (
    <div className="flex flex-col gap-6 mt-6">
      {Array.from({ length: 4 }, (_, i) => (
        <VaultListItemSkeleton key={i} />
      ))}
    </div>
  ) : (
    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 flex-wrap items-stretch justify-center w-full gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <VaultCardSkeleton key={i} />
      ))}
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
  // Showing the previous result while the next one loads (tab / filter / page switch).
  isRefreshing = false,
  error = null,
  onTabChange,
  renderEmptyState = EmptyState,
  appliedFilters = {},
  onApplyFilters,
  activeTab: externalActiveTab,
  pagination,
  onPageChange,
  onSearch,
  toolbar = null,
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
      onApplyStage: onTabChange,
      initialFilters: appliedFilters,
      activeStage: activeTab,
      myVaults: Boolean(appliedFilters?.myVaults),
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
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 flex-wrap items-stretch justify-center w-full gap-6">
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
        {toolbar}
        {tabs.length > 0 && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
            <div className="flex-1 w-full lg:w-auto">
              <LavaTabs
                className="overflow-x-auto text-sm lg:text-base w-full"
                activeTab={activeTab}
                tabs={tabs}
                onTabChange={handleTabChange}
              />
            </div>
            <div className="flex w-full flex-col sm:flex-row gap-4">
              <LavaSearchInput name="name" placeholder="Search by name" onChange={onSearch} />
              <VaultFilter handleOpenFilters={handleOpenFilters} viewType={viewType} setViewType={setViewType} />
            </div>
          </div>
        )}
        {isLoading ? (
          <LoadingState viewType={viewType} />
        ) : error ? (
          <div className="text-center text-red-600 py-8">Something went wrong</div>
        ) : vaults.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div
              className={clsx('transition-opacity duration-200', isRefreshing && 'opacity-50 pointer-events-none')}
              aria-busy={isRefreshing}
            >
              {renderVaultsView()}
            </div>
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
