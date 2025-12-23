import { ModalWrapper } from '@/components/shared/ModalWrapper';
import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useModalControls } from '@/lib/modals/modal.context';

export const DeleteDraftConfirmModal = ({ isOpen = true, onClose, onConfirm, vaultName }) => {
  const { closeModal } = useModalControls();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} title="Delete draft" size="md">
      <div className="flex flex-col gap-4">
        <p className="text-white/80">
          Are you sure you want to delete {vaultName ? 'the draft ' : 'this draft'}
          {vaultName && <span className="font-semibold text-white">{vaultName}</span>}?
        </p>
        <p className="text-sm text-dark-100">This action cannot be undone.</p>
        <div className="flex flex-col md:flex-row gap-3 justify-end mt-4">
          <SecondaryButton className="w-full md:w-auto justify-center" onClick={handleClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleConfirm}>
            Delete
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
