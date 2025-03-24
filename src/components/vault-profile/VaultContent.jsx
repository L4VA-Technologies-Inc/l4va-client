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
    <div className="bg-dark-600 rounded-xl p-6">
      <LavaTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="w-full bg-dark-700 rounded-xl mb-6"
        tabClassName="flex-1 text-center"
        activeTabClassName="text-primary"
        inactiveTabClassName="text-dark-100"
      />

      {/* Table header */}
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