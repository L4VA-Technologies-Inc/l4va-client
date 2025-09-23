import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { BuyingSelling } from './BuyingSelling';

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

const executionOptions = [
  { value: 'staking', label: 'Staking' },
  { value: 'distribution', label: 'Distributing' },
  { value: 'termination', label: 'Terminating' },
  { value: 'burning', label: 'Burning' },
  { value: 'buy_sell', label: 'Buying/Selling' },
];

export const CreateProposalModal = ({ onClose, isOpen, vault }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('buy_sell');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [proposalData, setProposalData] = useState({});

  const createProposalMutation = useCreateProposal();

  const handleCreateProposal = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      const proposalPayload = {
        title: proposalTitle,
        description: proposalDescription,
        type: selectedOption,
      };

      if (selectedOption === 'staking') {
        proposalPayload.fts = proposalData.fungibleTokens || [];
        proposalPayload.nfts = proposalData.nonFungibleTokens || [];
        if (proposalData.proposalStart) {
          proposalPayload.startDate = new Date(proposalData.proposalStart).toISOString();
        }
      } else if (selectedOption === 'distribution') {
        proposalPayload.distributionAssets = proposalData.distributionAssets || [];

        if (proposalData.proposalStart) {
          proposalPayload.startDate = new Date(proposalData.proposalStart).toISOString();
        }
      } else if (selectedOption === 'termination') {
        proposalPayload.metadata = {
          reason: proposalData.reason || '',
          terminationDate: proposalData.terminationDate || null,
        };
      } else if (selectedOption === 'burning') {
        proposalPayload.metadata = {
          burnAssets: proposalData.burnAssets || [],
        };
      } else if (selectedOption === 'buy_sell') {
        proposalPayload.metadata = proposalData;
      }

      await createProposalMutation.mutateAsync({
        vaultId: vault.id,
        proposalData: proposalPayload,
      });

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
            {selectedOption === 'buy_sell' && <BuyingSelling vaultId={vault?.id} onDataChange={handleDataChange} />}
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
