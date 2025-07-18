import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

import { VAULT_STATUSES, VAULT_TAGS_OPTIONS } from '@/components/vaults/constants/vaults.constants';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { Chip } from '@/components/shared/Chip';
import { VaultCountdown } from '@/components/vault-profile/VaultCountdown';
import { VaultContribution } from '@/components/vault-profile/VaultContribution';
import { VaultStats } from '@/components/vault-profile/VaultStats';
import { VaultTabs } from '@/components/vault-profile/VaultTabs';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { useVaultStatusTracker } from '@/hooks/useVaultStatusTracker';
import { getCountdownName, getCountdownTime, formatCompactNumber } from '@/utils/core.utils';

export const VaultProfileView = ({ vault }) => {
  const { isAuthenticated } = useAuth();
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
      <PrimaryButton
        disabled={!config.available || !isAuthenticated}
        className="uppercase"
        onClick={config.handleClick}
      >
        {config.text}
      </PrimaryButton>
    );
  };
  const renderVaultInfo = () => (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{vault.name}</h1>
        <p className="text-dark-100 text-sm mb-2">VAULT ID: {vault.id}</p>
        {vault.tags && vault.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vault.tags.map(tag => {
              const tagOption = VAULT_TAGS_OPTIONS.find(option => option.value === tag);
              const tagLabel = tagOption ? tagOption.label : tag;
              return <Chip key={tag} label={tagLabel} size="sm" className="bg-steel-850 text-white border-steel-750" />;
            })}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <span className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1">
          <EyeIcon className="w-4 h-4 text-orange-500" />
          <span>{formatCompactNumber(200)}</span>
        </span>
      </div>
    </div>
  );

  const renderPublishedOverlay = () => {
    if (vault.vaultStatus !== VAULT_STATUSES.PUBLISHED) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-steel-950 rounded-xl p-8 flex flex-col items-center space-y-4 max-w-md mx-4">
          <Spinner />
          <h3 className="text-xl font-semibold text-white">Registering on Blockchain</h3>
          <p className="text-sm text-gray-300 text-center">
            Your vault is being registered on the blockchain. This process may take a few moments.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderPublishedOverlay()}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 space-y-4 bg-steel-950 rounded-xl p-4">
          <div className="overflow-hidden rounded-lg">
            <img src={vault.vaultImage} alt={vault.name} className="w-full object-cover max-w-[450px]" />
          </div>
          <p className="mb-2 font-medium">{getCountdownName(vault)}</p>
          <div className="mb-6">
            <VaultCountdown
              className="h-[65px]"
              endTime={getCountdownTime(vault)}
              isLocked={vault.vaultStatus === 'locked' || vault.vaultStatus === 'governance'}
            />
          </div>
          <VaultContribution vault={vault} />
        </div>
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-steel-950 rounded-xl p-4">
            {renderVaultInfo()}
            <div className="mb-6">
              <p className="text-sm">{vault.description || 'No description'}</p>
            </div>
            <div className="mb-6">
              <VaultStats
                assetValue={vault.assetValueUsd || 0}
                ftGains={vault.ftGains || 'N/A'}
                fdv={vault.fdv || 'N/A'}
                fdvTvl={vault.fdvTvl || 'N/A'}
                tvl={vault.tvl || 'N/A'}
              />
            </div>
            <div className="flex justify-center mb-6">{renderActionButton()}</div>
            <VaultTabs activeTab={activeTab} vault={vault} onTabChange={handleTabChange} />
          </div>
        </div>
      </div>
    </>
  );
};
