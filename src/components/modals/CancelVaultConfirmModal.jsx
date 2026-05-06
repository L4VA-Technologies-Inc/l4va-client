import { ModalWrapper } from '@/components/shared/ModalWrapper';
import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';

export const CancelVaultConfirmModal = ({ isOpen = true, onClose, onConfirm, isLoading = false, vaultName }) => {
  const footer = (
    <div className="flex flex-col md:flex-row gap-3 justify-end">
      <SecondaryButton className="w-full md:w-auto justify-center" onClick={onClose} disabled={isLoading}>
        Cancel
      </SecondaryButton>
      <PrimaryButton className="w-full md:w-auto justify-center" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? 'Cancelling...' : 'Confirm cancel'}
      </PrimaryButton>
    </div>
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cancel vault" size="md" footer={footer}>
      <div className="flex flex-col gap-4">
        <p className="text-white/80">
          Are you sure you want to cancel {vaultName ? 'vault ' : 'this vault'}
          {vaultName && <span className="font-semibold text-white">{vaultName}</span>}?
        </p>
        <p className="text-sm text-dark-100">This action cannot be undone.</p>
      </div>
    </ModalWrapper>
  );
};
