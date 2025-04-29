import { InvestmentsList } from '@/components/vault-profile/InvestmentsList';
import { VaultAssetsList } from '@/components/vault-profile/VaultAssetsList';
import { VaultSettings } from '@/components/vault-profile/VaultSettings';
import { VaultGovernance } from '@/components/vault-profile/VaultGovernance';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { mockInvestments } from '@/mocks/vaultAssets';

export const VaultTabs = ({ vault, activeTab, onTabChange }) => {
  const tabContent = {
    Assets: <VaultAssetsList assets={vault.assets} />,
    Invest: <InvestmentsList investments={mockInvestments} />,
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
          className="w-full bg-steel-850"
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
