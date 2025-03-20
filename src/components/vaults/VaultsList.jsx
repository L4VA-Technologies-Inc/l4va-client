import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { VaultsApiProvider } from '@/services/api/vaults';

import { VaultCard } from '@/components/vaults/VaultCard';
import { Spinner } from '@/components/Spinner';

const VAULT_TABS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  LOCKED: 'Locked',
};

const TABS = Object.values(VAULT_TABS);

const VaultTabs = ({ activeTab, onTabChange }) => (
  <div className="inline-flex rounded-lg p-1">
    {TABS.map((tab) => (
      <button
        key={tab}
        className={clsx(
          'px-8 py-2 rounded-xl text-lg font-medium transition-all',
          activeTab === tab ? 'bg-[#2D3049]' : 'text-white hover:text-main-orange',
        )}
        type="button"
        onClick={() => onTabChange(tab)}
      >
        <span
          className={clsx(
            activeTab === tab && 'text-orange-gradient',
          )}
        >
          {tab}
        </span>
      </button>
    ))}
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner />
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-dark-100">
    <p className="text-xl">
      No vaults found
    </p>
    <NavLink
      className={clsx(
        'mt-2 transition-all',
        'hover:text-main-orange hover:underline',
      )}
      to="/create"
    >
      Create your first vault to get started
    </NavLink>
  </div>
);

export const VaultsList = ({ isMyVaults = false }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVaults = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (tab) {
        case VAULT_TABS.DRAFT:
          response = await VaultsApiProvider.getMyDraftVaults();
          break;
        case VAULT_TABS.OPEN:
          response = await VaultsApiProvider.getMyOpenVaults();
          break;
        case VAULT_TABS.LOCKED:
          response = await VaultsApiProvider.getMyLockedVaults();
          break;
        default:
          break;
      }
      setVaults(response.data.items || []);
    } catch (err) {
      console.error('Error fetching vaults:', err);
      setError('Failed to load vaults. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults(activeTab);
  }, [activeTab]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="font-russo text-[40px] uppercase mb-8">
        My Vaults
      </h1>
      <div className="mb-8">
        <VaultTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="mt-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center text-main-red py-8">{error}</div>
        ) : vaults.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} {...vault} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
