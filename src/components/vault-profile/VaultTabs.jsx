import { InvestmentsList } from '@/components/vault-profile/InvestmentsList';
import { VaultAssetsList } from '@/components/vault-profile/VaultAssetsList';
import { LavaTabs } from '@/components/shared/LavaTabs';

import { mockInvestments } from '@/mocks/vaultAssets';

export const VaultTabs = ({ vault, activeTab, onTabChange }) => {
  const tabContent = {
    Assets: <VaultAssetsList assets={vault.assets} />,
    Invest: <InvestmentsList investments={mockInvestments} />,
    Governance: <div>Governance content</div>,
    Settings: <div>Settings content</div>,
  };

  const tabs = Object.keys(tabContent);

  return (
    <>
      <div className="mb-4">
        <LavaTabs
          activeTab={activeTab}
          activeTabClassName="text-primary"
          className="w-full bg-[#202233]"
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