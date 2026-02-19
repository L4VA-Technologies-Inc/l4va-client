import { useEffect, useCallback } from 'react';
import { useRouter } from '@tanstack/react-router';

import { useAuth } from '@/lib/auth/auth.js';
import VaultContributedAssetsList from '@/components/vault-profile/VaultContributedAssetsList';
import { VaultAcquiredAssetsList } from '@/components/vault-profile/VaultAcquiredAssetsList';
import { VaultSettings } from '@/components/vault-profile/VaultSettings';
import { VaultGovernance } from '@/components/vault-profile/VaultGovernance';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { VaultChatWrapper } from '@/components/vault-profile/VaultChat';
import { VaultActivity } from '@/components/vault-profile/VaultActivity.jsx';
import { useModalControls } from '@/lib/modals/modal.context';

export const VaultTabs = ({ vault, activeTab: propActiveTab, onTabChange }) => {
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useModalControls();
  const router = useRouter();

  const baseTabContent = {
    Assets: <VaultContributedAssetsList vault={vault} />,
    Tokens: <VaultAcquiredAssetsList vault={vault} />,
    Governance: <VaultGovernance vault={vault} />,
    Activity: <VaultActivity vault={vault} />,
  };

  const tabContent = {
    ...baseTabContent,
    ...(vault.isChatVisible && isAuthenticated ? { Chat: <VaultChatWrapper vault={vault} /> } : {}),
    Settings: <VaultSettings vault={vault} />,
  };

  const tabs = Object.keys(tabContent);

  const handleTabSelect = useCallback(
    selectedTab => {
      if (selectedTab === 'Activity' && !user) {
        openModal('LoginModal');
        return;
      }

      onTabChange(selectedTab);
      router.navigate({
        search: prev => ({ ...prev, tab: selectedTab }),
      });
    },
    [user, onTabChange, router, openModal]
  );

  useEffect(() => {
    if (propActiveTab && !tabs.includes(propActiveTab)) {
      handleTabSelect('Assets');
    }
  }, [propActiveTab, tabs, handleTabSelect]);

  const activeTab = tabs.includes(propActiveTab) ? propActiveTab : 'Assets';

  return (
    <>
      <div className="mb-6">
        <div className="flex-1 w-full sm:w-auto">
          <LavaTabs
            activeTab={activeTab}
            activeTabClassName="text-primary"
            className="w-full md:bg-steel-850 overflow-x-auto text-sm md:text-base"
            inactiveTabClassName="text-dark-100"
            tabClassName="flex-1 text-center"
            tabs={tabs}
            onTabChange={handleTabSelect}
          />
        </div>
      </div>
      {tabContent[activeTab]}
    </>
  );
};
