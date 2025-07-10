import { VaultAcquiredAssetsList } from '@/components/vault-profile/VaultAcquiredAssetsList';
import { VaultContributedAssetsList } from '@/components/vault-profile/VaultContributedAssetsList';
import { VaultSettings } from '@/components/vault-profile/VaultSettings';
import { VaultGovernance } from '@/components/vault-profile/VaultGovernance';
import { LavaTabs } from '@/components/shared/LavaTabs';

export const VaultTabs = ({ vault, activeTab, onTabChange }) => {
  const tabContent = {
    Assets: <VaultContributedAssetsList vault={vault} />,
    Acquire: <VaultAcquiredAssetsList vault={vault} />,
    Governance: <VaultGovernance vault={vault} />,
    Settings: <VaultSettings vault={vault} />,
  };

  const tabs = Object.keys(tabContent);

  return (
    <>
      <div className="mb-6">
        <LavaTabs
          activeTab={activeTab}
          activeTabClassName="text-primary"
          className="w-full bg-steel-850 overflow-x-auto text-sm md:text-base"
          inactiveTabClassName="text-dark-100"
          tabClassName="flex-1 text-center"
          tabs={tabs}
          onTabChange={onTabChange}
        />
      </div>
      {tabContent[activeTab]}
    </>
  );
};
