import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { useModalControls } from '@/lib/modals/modal.context';

/**
 * Confirmation the assistant asks for through the backend `launch_vault` action.
 * The user is always the one who starts the launch — the assistant only requests this dialog.
 */
export const LaunchVaultConfirmModal = ({ isOpen = true, onClose, onConfirm, isLaunching, vaultName, description }) => {
  const { closeModal } = useModalControls();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} title="Launch this vault?" size="md">
      <div className="flex flex-col gap-4">
        <p className="text-white/80">
          {vaultName ? (
            <>
              You are about to launch <span className="text-white font-semibold">{vaultName}</span>.
            </>
          ) : (
            'You are about to launch this vault.'
          )}
        </p>
        <p className="text-sm text-dark-100">
          {description || 'Review the configuration and confirm to sign and launch this vault.'}
        </p>
        <div className="flex flex-col md:flex-row gap-3 justify-end mt-4">
          <SecondaryButton className="w-full md:w-auto justify-center" disabled={isLaunching} onClick={handleClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton className="w-full md:w-auto justify-center" disabled={isLaunching} onClick={onConfirm}>
            {isLaunching ? 'Launching…' : 'Launch Vault'}
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
