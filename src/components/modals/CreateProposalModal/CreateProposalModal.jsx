import { useState } from 'react';

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

export const CreateProposalModal = ({ onClose, isOpen, vault }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('staking');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const executionOptions = [
    { value: 'staking', label: 'Staking' },
    { value: 'distributing', label: 'Distributing' },
    { value: 'terminating', label: 'Terminating' },
    { value: 'burning', label: 'Burning' },
  ];

  const handleCreateProposal = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      console.log('Creating proposal:', {
        title: proposalTitle,
        description: proposalDescription,
        executionType: selectedOption,
        vaultName: vault.name,
      });
      setShowConfirmation(false);
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
              onChange={value => setSelectedOption(value)}
            />
          </div>

          <div className="space-y-4">
            {selectedOption === 'staking' && <Staking />}
            {selectedOption === 'distributing' && <Distributing />}
            {selectedOption === 'terminating' && <Terminating onClose={() => setSelectedOption('staking')} />}
            {selectedOption === 'burning' && <Burning onClose={() => setSelectedOption('staking')} />}
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
