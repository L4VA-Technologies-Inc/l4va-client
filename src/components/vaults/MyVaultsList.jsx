import { useState } from 'react';
import { VaultList } from '@/components/vaults/VaultsList';
import { useMyDraftVaults, useMyOpenVaults, useMyLockedVaults } from '@/services/api/queries';

const VAULT_TABS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  LOCKED: 'Locked',
};

const TABS = Object.values(VAULT_TABS);

export const MyVaultsList = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const draftVaults = useMyDraftVaults();
  const openVaults = useMyOpenVaults();
  const lockedVaults = useMyLockedVaults();

  const getVaultsData = () => {
    switch (activeTab) {
      case VAULT_TABS.DRAFT:
        return {
          data: draftVaults.data?.data?.items || [],
          isLoading: draftVaults.isLoading,
          error: draftVaults.error?.message,
        };
      case VAULT_TABS.OPEN:
        return {
          data: openVaults.data?.data?.items || [],
          isLoading: openVaults.isLoading,
          error: openVaults.error?.message,
        };
      case VAULT_TABS.LOCKED:
        return {
          data: lockedVaults.data?.data?.items || [],
          isLoading: lockedVaults.isLoading,
          error: lockedVaults.error?.message,
        };
      default:
        return { data: [], isLoading: false, error: null };
    }
  };

  const { data: vaults, isLoading, error } = getVaultsData();

  return (
    <VaultList
      className={className}
      error={error}
      isLoading={isLoading}
      tabs={TABS}
      title="My Vaults"
      vaults={vaults}
      onTabChange={setActiveTab}
    />
  );
};
