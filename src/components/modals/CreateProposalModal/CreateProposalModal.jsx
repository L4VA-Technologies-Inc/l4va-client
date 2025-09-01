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
import { useCreateProposal } from '@/services/api/queries';

export const CreateProposalModal = ({ onClose, isOpen, vault }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('staking');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [proposalData, setProposalData] = useState({});

  const createProposalMutation = useCreateProposal();

  const executionOptions = [
    { value: 'staking', label: 'Staking' },
    { value: 'distribution', label: 'Distributing' },
    { value: 'termination', label: 'Terminating' },
    { value: 'burning', label: 'Burning' },
  ];

  const handleCreateProposal = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      // Build the base proposal data
      const proposalPayload = {
        title: proposalTitle,
        description: proposalDescription,
        type: selectedOption, // Backend expects UPPERCASE enum values
      };

      // Handle different proposal types
      if (selectedOption === 'staking') {
        // Add FTs and NFTs directly to the payload for staking
        proposalPayload.fts = proposalData.fungibleTokens || [];
        proposalPayload.nfts = proposalData.nonFungibleTokens || [];

        // Add start date if provided
        if (proposalData.proposalStart) {
          proposalPayload.startDate = new Date(proposalData.proposalStart).toISOString();
        }
      } else if (selectedOption === 'distribution') {
        // Add distribution assets directly to the payload
        proposalPayload.distributionAssets = proposalData.distributionAssets || [];

        // Add start date if provided
        if (proposalData.proposalStart) {
          proposalPayload.startDate = new Date(proposalData.proposalStart).toISOString();
        }
      } else if (selectedOption === 'termination') {
        // For termination, add as metadata
        proposalPayload.metadata = {
          reason: proposalData.reason || '',
          terminationDate: proposalData.terminationDate || null,
        };
      } else if (selectedOption === 'burning') {
        // For burning, add as metadata
        proposalPayload.metadata = {
          burnAssets: proposalData.burnAssets || [],
        };
      }

      const response = await createProposalMutation.mutateAsync({
        vaultId: vault.id,
        proposalData: proposalPayload,
      });

      console.log('Proposal created successfully:', response);

      toast.success('Proposal created successfully!');
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to create proposal. Please try again.');
    }
  };

  const handleDataChange = useCallback(data => {
    setProposalData(prev => ({ ...prev, ...data }));
  }, []);

  const handleChangeExecutionOption = value => {
    setProposalData({});
    setSelectedOption(value);
  };

  const renderFooter = () => (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-400">New proposal</div>
      <div className="flex gap-2">
        <SecondaryButton onClick={onClose} size="sm">
          Cancel
        </SecondaryButton>
        <PrimaryButton disabled={!proposalTitle.trim()} onClick={handleCreateProposal} size="sm" className="capitalize">
          Create
        </PrimaryButton>
      </div>
    </div>
  );

  return (
    <>
      <ModalWrapper
        size="2xl"
        isOpen={isOpen}
        onClose={onClose}
        title={`Create Proposal for ${vault.name}`}
        maxHeight="90vh"
        footer={renderFooter()}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <LavaSteelInput
              label="Proposal Title"
              placeholder="Enter proposal title"
              value={proposalTitle}
              onChange={value => setProposalTitle(value)}
            />
            <LavaSteelTextarea
              label="Proposal Description"
              placeholder="Enter proposal description"
              value={proposalDescription}
              onChange={value => setProposalDescription(value)}
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
              <Terminating vaultId={vault?.id} onClose={() => setSelectedOption('staking')} />
            )}
            {selectedOption === 'burning' && (
              <Burning vaultId={vault?.id} onClose={() => setSelectedOption('staking')} />
            )}
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
