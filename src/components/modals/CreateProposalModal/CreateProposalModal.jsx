import { useState } from 'react';

import Staking from '@/components/modals/CreateProposalModal/Staking';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelTextarea } from '@/components/shared/LavaTextarea';
import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';

export const CreateProposalModal = ({ onClose, isOpen, vault }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('staking');

  const executionOptions = [
    { value: 'staking', label: 'Staking' },
    { value: 'distributing', label: 'Distributing' },
    { value: 'terminating', label: 'Terminating' },
    { value: 'burning', label: 'Burning' },
  ];

  const handleCreateProposal = async () => {
    try {
      console.log('Creating proposal:', {
        title: proposalTitle,
        description: proposalDescription,
        vaultName: vault.name,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
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
          <LavaSteelSelect
            options={executionOptions}
            placeholder="Select execution type"
            value={selectedOption}
            onChange={value => setSelectedOption(value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Execution Details</h3>
          {selectedOption === 'staking' && <Staking />}
        </div>
      </div>
    </ModalWrapper>
  );
};
