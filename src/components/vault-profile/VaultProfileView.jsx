import { EyeIcon, BarChart3 } from 'lucide-react';
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
import L4vaIcon from '@/icons/l4va.svg?react';
import { useNavigate } from '@tanstack/react-router';


const BUTTON_DISABLE_THRESHOLD_MS = 5 * 60 * 1000;

export const VaultProfileView = ({ vault }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('Assets');
  const { openModal } = useModalControls();

  const navigate = useNavigate();

  useVaultStatusTracker(vault?.id);

  const handleTabChange = tab => setActiveTab(tab);

  const renderActionButton = () => {
    // Disable Contribute and Acquire buttons if time less than 5 min
    const buttonConfig = {
      Assets: {
        text: 'Contribute',
        handleClick: () => openModal('ContributeModal', { vault }),
        available:
          vault.vaultStatus === VAULT_STATUSES.CONTRIBUTION &&
          new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration >
            Date.now() + BUTTON_DISABLE_THRESHOLD_MS,
      },
      Acquire: {
        text: 'Acquire',
        handleClick: () => openModal('AcquireModal', { vault }),
        available:
          vault.vaultStatus === VAULT_STATUSES.ACQUIRE &&
          new Date(vault.acquirePhaseStart).getTime() + vault.acquireWindowDuration >
            Date.now() + BUTTON_DISABLE_THRESHOLD_MS,
      },
      Governance: {
        text: 'Create Proposal',
        available: true,
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
        <button
          onClick={() => openModal('ChartModal', { vault })}
          className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1 hover:bg-steel-750 transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-orange-500" />
        </button>
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
          <PrimaryButton onClick={() => navigate({ to: '/vaults' })}>Go back</PrimaryButton>
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
            {vault.vaultImage ? (
              <img src={vault.vaultImage} alt={vault.name} className="object-cover w-full h-auto max-h-[380px]" />
            ) : (
              <div className="w-full h-[380px] bg-steel-850 flex items-center justify-center">
                <L4vaIcon className="h-16 w-16 text-white" />
              </div>
            )}
          </div>
          <p className="mb-2 font-medium">{getCountdownName(vault)}</p>
          <div className="mb-6">
            {vault.vaultStatus !== 'ready-for-governance' && (
              <VaultCountdown
                className="h-[65px]"
                endTime={getCountdownTime(vault)}
                isLocked={vault.vaultStatus === 'locked' || vault.vaultStatus === 'governance'}
              />
            )}
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
                fdv={vault.fdv ? `${vault.fdv}$` : 'N/A'}
                fdvTvl={vault.fdvTvl || 'N/A'}
                tvl={vault.assetsPrices.totalValueUsd ? `${vault.assetsPrices.totalValueUsd}$` : 'N/A'}
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
