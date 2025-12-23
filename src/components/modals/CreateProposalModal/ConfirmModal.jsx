import { useEffect } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export const ConfirmModal = ({ onClose, isOpen, onConfirm }) => {
  useEffect(() => {
    if (isOpen) {
      const overlay = document.querySelector('[data-radix-dialog-overlay]');
      if (overlay) {
        overlay.style.zIndex = '90';
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md p-6 bg-steel-950 border-none !z-[100]">
        <VisuallyHidden>
          <DialogTitle>Do you want to create this proposal?</DialogTitle>
        </VisuallyHidden>
        <DialogDescription className="text-center text-white/80 my-6 text-lg">
          Do you want to create this proposal?
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
