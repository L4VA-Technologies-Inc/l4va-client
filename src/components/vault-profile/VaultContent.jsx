import { useState } from 'react';
import { VaultAssetsList } from '@/components/vault-profile/VaultAssetsList';
import { LavaTabs } from '@/components/shared/LavaTabs';

export const VaultContent = ({ vault }) => {
  const [activeTab, setActiveTab] = useState('Assets');

  const tabContent = {
    Assets: <VaultAssetsList assets={vault.assets} />,
    Investments: <div>Investments content</div>,
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
          onTabChange={setActiveTab}
        />
      </div>
      <div className="grid grid-cols-5 gap-4 mb-4 text-dark-100 text-sm">
        <div>Access</div>
        <div>Name</div>
        <div>Value</div>
        <div>% Vault</div>
        <div className="text-right">Contribute</div>
      </div>
      {tabContent[activeTab]}
    </>
  );
};