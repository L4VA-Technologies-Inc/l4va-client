import { useRouter, useSearch } from '@tanstack/react-router';

import { VaultAcquiredAssetsList } from '@/components/vault-profile/VaultAcquiredAssetsList';
import { VaultContributedAssetsList } from '@/components/vault-profile/VaultContributedAssetsList';
import { VaultSettings } from '@/components/vault-profile/VaultSettings';
import { VaultGovernance } from '@/components/vault-profile/VaultGovernance';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaSelect } from '@/components/shared/LavaSelect';

export const VaultTabs = ({ vault, activeTab: propActiveTab, onTabChange }) => {
  const tabContent = {
    Assets: <VaultContributedAssetsList vault={vault} />,
    Acquire: <VaultAcquiredAssetsList vault={vault} />,
    Governance: <VaultGovernance vault={vault} />,
    Settings: <VaultSettings vault={vault} />,
  };
  const router = useRouter();
  const search = useSearch({ from: '/vaults/$id' });
  const activeTab = propActiveTab || search.tab || 'Assets';
  const tabs = Object.keys(tabContent);

  const tabOptions = tabs.map(tab => ({
    value: tab,
    label: tab,
  }));

  const handleTabSelect = selectedTab => {
    onTabChange(selectedTab);
    router.navigate({
      search: prev => ({ ...prev, tab: selectedTab }),
    });
  };

  return (
    <>
      <div className="mb-6">
        <div className="md:hidden mb-4">
          <LavaSelect
            label="Select Tab"
            options={tabOptions}
            value={activeTab}
            onChange={handleTabSelect}
            placeholder="Select a tab"
          />
        </div>
        <div className="hidden md:block">
          <LavaTabs
            activeTab={activeTab}
            activeTabClassName="text-primary"
            className="w-full bg-steel-850 overflow-x-auto text-sm md:text-base"
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
