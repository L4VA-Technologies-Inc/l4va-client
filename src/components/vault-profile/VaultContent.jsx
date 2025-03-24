import { useState } from 'react';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { VaultAssetsList } from './VaultAssetsList';

export const VaultContent = ({ vault }) => {
  const [activeTab, setActiveTab] = useState('Assets');

  const tabContent = {
    'Assets': <VaultAssetsList assets={vault.assets} />,
    'Investments': <div>Investments content</div>,
    'Governance': <div>Governance content</div>,
    'Settings': <div>Settings content</div>,
  };

  const tabs = Object.keys(tabContent);

  return (
    <div className="bg-[#181A2A] rounded-xl p-4">
      <div className="mb-4">
        <LavaTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="w-full bg-[#202233]"
          tabClassName="flex-1 text-center"
          activeTabClassName="text-primary"
          inactiveTabClassName="text-dark-100"
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
    </div>
  );
}; 