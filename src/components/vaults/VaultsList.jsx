import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { VaultCard } from '@/components/vaults/VaultCard';
import { Spinner } from '@/components/Spinner';

const LoadingState = () => (
  <div className="py-8 flex items-center justify-center">
    <Spinner />
  </div>
);

const EmptyState = () => (
  <div className="py-8 flex flex-col items-center justify-center">
    <p className="text-xl">No vaults found</p>
    <Link className={clsx('mt-2 transition-all')} to="/create">
      <span className="text-orange-500 hover:underline">Create</span> your first vault to get started
    </Link>
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
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleTabChange = tab => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div>
      <div className="flex flex-col gap-8">
        <h2 className="font-russo text-4xl uppercase">{title}</h2>
        {tabs.length > 0 && <LavaTabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange} />}
      </div>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : vaults.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map(vault => (
            <VaultCard key={vault.id} {...vault} />
          ))}
        </div>
      )}
    </div>
  );
};
