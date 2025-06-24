import { useState } from 'react';

import { VAULT_STATUSES } from '../vaults/constants/vaults.constants';

import { useVaultStatusTracker } from '@/hooks/useVaultStatusTracker';
import { VaultContribution } from '@/components/vault-profile/VaultContribution';
import { VaultCountdown } from '@/components/vault-profile/VaultCountdown';
import { VaultTabs } from '@/components/vault-profile/VaultTabs';
import { VaultStats } from '@/components/vault-profile/VaultStats';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useModalControls } from '@/lib/modals/modal.context';
import { formatCompactNumber, getCountdownName, getCountdownTime } from '@/utils/core.utils';
import EyeIcon from '@/icons/eye.svg?react';

export const VaultProfileView = ({ vault }) => {
  const [activeTab, setActiveTab] = useState('Assets');
  const { openModal } = useModalControls();

  useVaultStatusTracker(vault?.id);

  const handleTabChange = tab => setActiveTab(tab);

  const renderActionButton = () => {
    const buttonConfig = {
      Assets: {
        text: 'Contribute',
        handleClick: () => openModal('ContributeModal', { vault }),
        available: vault.vaultStatus === VAULT_STATUSES.CONTRIBUTION,
      },
      Acquire: {
        text: 'Acquire',
        handleClick: () => openModal('AcquireModal', { vault }),
        available: vault.vaultStatus === VAULT_STATUSES.ACQUIRE,
      },
      Governance: {
        text: 'Create Proposal',
        handleClick: () => openModal('CreateProposalModal', { vault }),
      },
      Settings: null,
    };

    const config = buttonConfig[activeTab];

    if (!config) return null;

    return (
      <PrimaryButton disabled={!config.available} className="uppercase" onClick={config.handleClick}>
        {config.text}
      </PrimaryButton>
    );
  };

  const renderVaultInfo = () => (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">{vault.name}</h1>
        <p className="text-dark-100 text-sm">VAULT ID: {vault.id}</p>
      </div>
      <div className="flex gap-2">
        <span className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1">
          <EyeIcon className="w-4 h-4 text-orange-500" />
          <span>{formatCompactNumber(200)}</span>
        </span>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <div className="bg-steel-950 rounded-xl p-6">
        <img
          alt={vault.name}
          className="w-full aspect-square rounded-xl object-cover mb-6"
          src={vault.vaultImage || '/assets/vaults/space-man.webp'}
        />
        <p className="mb-2 font-medium">{getCountdownName(vault)}</p>
        <div className="mb-6">
          <VaultCountdown
            endTime={getCountdownTime(vault)}
            isLocked={vault.vaultStatus === 'locked' || vault.vaultStatus === 'governance'}
          />
        </div>
        <VaultContribution vault={vault} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="grid grid-cols-12 gap-4">
          {renderSidebar()}
          <div className="col-span-8 space-y-4">
            <div className="bg-steel-950 rounded-xl p-6">
              {renderVaultInfo()}
              {vault.description ? <p className="text-dark-100 mb-6">{vault.description}</p> : null}
              <div className="mb-6">
                <VaultStats acquired={0} requireReservedCostUsd={vault.requireReservedCostUsd} />
              </div>
              <div className="flex justify-center mb-6">{renderActionButton()}</div>
              <VaultTabs activeTab={activeTab} vault={vault} onTabChange={handleTabChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
