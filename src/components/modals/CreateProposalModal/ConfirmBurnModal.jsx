import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export const ConfirmBurnModal = ({ onClose, isOpen, onConfirm }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md p-6 bg-steel-950 border-none">
        <VisuallyHidden>
          <DialogTitle>Burn Vault</DialogTitle>
        </VisuallyHidden>
        <DialogDescription className="text-center text-white/80 my-6 text-lg">
          Do you want to burn this vault?
        </DialogDescription>
        <div className="flex justify-center gap-4">
          <SecondaryButton onClick={onClose} className="px-6">
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={onConfirm} className="px-6">
            Yes
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
