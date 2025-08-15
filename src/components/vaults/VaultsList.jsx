import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { Filter, GridIcon, ListIcon } from 'lucide-react';

import VaultListItem from '@/components/vaults/VaultListItem';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { VaultCard } from '@/components/vaults/VaultCard';
import { Spinner } from '@/components/Spinner';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useModalControls } from '@/lib/modals/modal.context';

const LoadingState = () => (
  <div className="py-8 flex items-center justify-center">
    <Spinner />
  </div>
);

const ViewToggle = ({ activeView, onViewChange }) => (
  <div className="flex items-center space-x-2">
    <button className="p-2 hover:bg-steel-800" onClick={() => onViewChange('grid')} aria-label="Grid view">
      <GridIcon
        className="w-4 h-4"
        color={activeView === 'grid' ? 'var(--color-dark-100)' : 'var(--color-steel-750)'}
      />
    </button>
    <button className="p-2 hover:bg-steel-800" onClick={() => onViewChange('table')} aria-label="Table view">
      <ListIcon
        className="w-4 h-4"
        color={activeView === 'table' ? 'var(--color-dark-100)' : 'var(--color-steel-750)'}
      />
    </button>
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
  activeTab: externalActiveTab,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]);
  const [viewType, setViewType] = useState('grid');
  const { openModal } = useModalControls();

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const handleTabChange = tab => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleOpenFilters = () => openModal('VaultFiltersModal');

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
    <div>
      <div className="flex flex-col gap-6 md:gap-8">
        <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase">{title}</h2>
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
            <div className="flex items-center w-full sm:w-auto gap-2">
              <SecondaryButton onClick={handleOpenFilters} className="w-full sm:w-auto">
                <Filter className="w-4 h-4" />
                Filters
              </SecondaryButton>
              <ViewToggle activeView={viewType} onViewChange={setViewType} />
            </div>
          </div>
        )}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : vaults.length === 0 ? (
          renderEmptyState()
        ) : (
          renderVaultsView()
        )}
      </div>
    </div>
  );
};
