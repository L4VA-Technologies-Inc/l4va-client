import { CheckCircle, XCircle, Ellipsis } from 'lucide-react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';

export const VoteConfirmModal = ({ isOpen = true, onClose, onConfirm, voteType, proposalTitle }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getVoteIcon = () => {
    switch (voteType) {
      case 'yes':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'no':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'abstain':
        return <Ellipsis className="w-6 h-6 text-gray-500" />;
      default:
        return null;
    }
  };

  const getVoteLabel = () => {
    switch (voteType) {
      case 'yes':
        return 'Yes';
      case 'no':
        return 'No';
      case 'abstain':
        return 'Abstain';
      default:
        return '';
    }
  };

  const getVoteColor = () => {
    switch (voteType) {
      case 'yes':
        return 'text-green-500';
      case 'no':
        return 'text-red-500';
      case 'abstain':
        return 'text-gray-500';
      default:
        return 'text-white';
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Confirm your vote" size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-steel-850 rounded-lg">
          {getVoteIcon()}
          <div className="flex-1">
            <p className="text-sm text-gray-400">You are voting</p>
            <p className={`text-lg font-semibold ${getVoteColor()}`}>{getVoteLabel()}</p>
          </div>
        </div>

        {proposalTitle && (
          <div className="p-4 bg-steel-850 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">On proposal:</p>
            <p className="text-white">{proposalTitle}</p>
          </div>
        )}

        <p className="text-white/80">Are you sure you want to submit this vote?</p>
        <p className="text-sm text-dark-100">This action cannot be undone.</p>

        <div className="flex flex-col md:flex-row gap-3 justify-end mt-4">
          <SecondaryButton className="w-full md:w-auto justify-center" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleConfirm}>
            Confirm Vote
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
