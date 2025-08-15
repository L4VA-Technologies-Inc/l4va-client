import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export const ConfirmModal = ({ onClose, isOpen, onConfirm }) => {
  return (
    <>
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-steel-950 border-none">
          <VisuallyHidden>
            <DialogTitle>Do you want to create this proposal?</DialogTitle>
          </VisuallyHidden>
          <div className="text-center text-white/80 mb-6">Do you want to create this proposal?</div>
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
    </>
  );
};
