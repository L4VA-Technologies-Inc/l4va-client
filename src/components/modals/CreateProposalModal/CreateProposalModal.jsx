import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import Staking from '@/components/modals/CreateProposalModal/Staking';
import Distributing from '@/components/modals/CreateProposalModal/Distributing';
import { ConfirmModal } from '@/components/modals/CreateProposalModal/ConfirmModal';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelTextarea } from '@/components/shared/LavaTextarea';
import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import Terminating from '@/components/modals/CreateProposalModal/Terminating.jsx';
import Burning from '@/components/modals/CreateProposalModal/Burning.jsx';
import { useCreateProposal, useGovernanceProposals } from '@/services/api/queries';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker.js';
import { MIN_CONTRIBUTION_DURATION_MS } from '@/components/vaults/constants/vaults.constants.js';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker.jsx';
import { MarketActions } from '@/components/modals/CreateProposalModal/MarketActions/MarketActions.jsx';

const executionOptions = [
  { value: 'staking', label: 'Staking' },
  { value: 'distribution', label: 'Distributing' },
  { value: 'termination', label: 'Terminating' },
  { value: 'burning', label: 'Burning' },
  { value: 'marketplace_action', label: 'Market Actions' },
];

const initialProposalData = {
  isValid: true,
};

export const CreateProposalModal = ({ onClose, isOpen, vault }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('staking');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [proposalData, setProposalData] = useState(initialProposalData);
  const [proposalStartDate, setProposalStartDate] = useState(null);
  const [proposalDuration, setProposalDuration] = useState(null);
  const [error, setError] = useState(false);

  const createProposalMutation = useCreateProposal();

  const { refetch } = useGovernanceProposals(vault.id);

  const handleCreateProposal = () => {
    if (!isValidProposal()) {
      setError(false);
      setShowConfirmation(true);
    } else {
      setError(true);
    }
  };

  const isValidProposal = () => {
    return (
      !proposalTitle.trim() ||
      !proposalDescription.trim() ||
      !proposalData.isValid ||
      !proposalStartDate ||
      !proposalDuration
    );
  };

  const handleConfirmCreate = async () => {
    try {
      const proposalPayload = {
        title: proposalTitle,
        description: proposalDescription,
        type: selectedOption,
        startDate: proposalStartDate.toISOString(),
        duration: proposalDuration,
      };

      if (selectedOption === 'staking') {
        proposalPayload.fts = proposalData.fungibleTokens || [];
        proposalPayload.nfts = proposalData.nonFungibleTokens || [];
      } else if (selectedOption === 'distribution') {
        proposalPayload.distributionAssets = proposalData.distributionAssets || [];
      } else if (selectedOption === 'termination') {
        proposalPayload.metadata = {
          proposalStart: proposalData.proposalStart || null,
          terminateAssets: proposalData.terminateAssets || [],
        };
      } else if (selectedOption === 'burning') {
        proposalPayload.metadata = {
          burnAssets: proposalData.burnAssets || [],
        };
      } else if (selectedOption === 'marketplace_action') {
        const marketActionType = proposalData.marketActionType || 'buy_sell';

        if (marketActionType === 'update_list') {
          proposalPayload.marketplaceActions = (proposalData.updateListingAssets || [])
            .filter(asset => asset.newPrice && Number(asset.newPrice) > 0)
            .map(asset => ({
              assetId: asset.id,
              exec: 'UPDATE_LISTING',
              newPrice: asset.newPrice,
              market: asset.market || 'WayUp',
            }));
        } else if (marketActionType === 'buy_sell') {
          proposalPayload.type = 'buy_sell';
          proposalPayload.metadata = proposalData;
        } else {
          proposalPayload.marketplaceActions = (proposalData.unlistAssets || []).map(asset => ({
            assetId: asset.id,
            exec: 'UNLIST',
            market: asset.market || 'WayUp',
          }));
        }
      }

      createProposalMutation
        .mutateAsync({
          vaultId: vault.id,
          proposalData: proposalPayload,
        })
        .then(async res => {
          if (res?.data) {
            await refetch();
            toast.success('Proposal created successfully!');
            onClose();
          }
        })
        .catch(err => {
          console.error('Failed to create proposal:', err);
          toast.error(`Failed to create proposal: ${err.response.data.message}`);
        });
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to create proposal. Please try again.');
    }
  };

  const handleDataChange = useCallback(data => {
    setProposalData(prev => ({ ...prev, ...data }));
  }, []);

  const handleChangeExecutionOption = value => {
    setProposalData(initialProposalData);
    setSelectedOption(value);
  };

  const renderFooter = () => (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-400">New proposal</div>
      <div className="flex gap-2">
        <SecondaryButton onClick={onClose} size="sm">
          Cancel
        </SecondaryButton>
        <PrimaryButton onClick={handleCreateProposal} size="sm" className="capitalize">
          Create
        </PrimaryButton>
      </div>
    </div>
  );

  return (
    <>
      <ModalWrapper
        size="3xl"
        isOpen={isOpen}
        onClose={onClose}
        title={`Create Proposal for ${vault.name}`}
        maxHeight="90vh"
        footer={renderFooter()}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <LavaSteelInput
              className="border border-red-600"
              label="Proposal Title*"
              placeholder="Enter proposal title"
              value={proposalTitle}
              onChange={value => setProposalTitle(value)}
              error={error && !proposalTitle}
            />
            <LavaSteelTextarea
              label="Proposal Description*"
              placeholder="Enter proposal description"
              value={proposalDescription}
              onChange={value => setProposalDescription(value)}
              error={error && !proposalDescription}
            />
            <h3 className="text-lg font-medium">Execution Options</h3>
            <LavaSteelSelect
              options={executionOptions}
              placeholder="Select execution type"
              value={selectedOption}
              onChange={handleChangeExecutionOption}
            />
          </div>

          <div className="space-y-4">
            {selectedOption === 'staking' && <Staking vaultId={vault?.id} onDataChange={handleDataChange} />}
            {selectedOption === 'distribution' && <Distributing vaultId={vault?.id} onDataChange={handleDataChange} />}
            {selectedOption === 'termination' && (
              <Terminating
                vaultId={vault?.id}
                onClose={() => setSelectedOption('staking')}
                onDataChange={handleDataChange}
              />
            )}
            {selectedOption === 'burning' && (
              <Burning
                vaultId={vault?.id}
                onClose={() => setSelectedOption('staking')}
                onDataChange={handleDataChange}
                error={error}
              />
            )}
            {selectedOption === 'marketplace_action' && (
              <MarketActions vaultId={vault.id} onDataChange={handleDataChange} error={error} />
            )}

            <div className="mt-8">
              <h4 className="text-white font-medium mb-4">Voting Period</h4>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 relative">
                  <LavaDatePicker
                    label={'Start: *'}
                    value={proposalStartDate}
                    onChange={value => setProposalStartDate(new Date(value))}
                    error={error && !proposalStartDate}
                  />
                </div>
                <div className="flex-1 relative">
                  <LavaIntervalPicker
                    margin={1}
                    label={'Duration:*'}
                    value={proposalDuration}
                    onChange={value => setProposalDuration(value)}
                    placeholder="Set Voting Period"
                    minMs={MIN_CONTRIBUTION_DURATION_MS}
                    error={error && !proposalDuration}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
      <ConfirmModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmCreate}
      />
    </>
  );
};
