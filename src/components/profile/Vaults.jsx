import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { VaultsApiProvider } from '@/services/api/vaults';
import { VaultCard } from '@/components/home/VaultCard';

const VAULT_TABS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  LOCKED: 'Locked'
};

const TABS = Object.values(VAULT_TABS);

const VaultTabs = ({ activeTab, onTabChange }) => (
  <div className="inline-flex rounded-lg p-1">
    {TABS.map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`
          px-8 py-2 rounded-xl text-lg font-medium transition-all
          ${activeTab === tab ? 'bg-[#2D3049]' : 'text-white hover:text-main-orange'}
        `}
      >
        <span className={activeTab === tab ? 'bg-gradient-to-r from-[#FF842C] to-[#FFD012] bg-clip-text text-transparent' : ''}>
          {tab}
        </span>
      </button>
    ))}
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main-orange"></div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
    <p className="text-xl">No vaults found</p>
    <NavLink to="/create" className="mt-2 hover:text-main-orange hover:underline transition-all">
      Create your first vault to get started
    </NavLink>
  </div>
);

export const Vaults = () => {
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
    } catch (error) {
      console.error('Error fetching vaults:', error);
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
          <div className="text-center text-red-500 py-8">{error}</div>
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