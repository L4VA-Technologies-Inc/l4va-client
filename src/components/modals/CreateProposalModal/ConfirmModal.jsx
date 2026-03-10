import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { cn } from '@/lib/utils';

export const ConfirmModal = ({ onClose, isOpen, onConfirm }) => {
  return (
    <DialogPrimitive.Root open={isOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-black/50',
            '!z-[95]'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200',
            'sm:max-w-md bg-steel-950 border-none !z-[100]'
          )}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Do you want to create this proposal?</DialogPrimitive.Title>
          </VisuallyHidden>
          <DialogPrimitive.Description className="text-center text-white/80 my-6 text-lg">
            Do you want to create this proposal?
          </DialogPrimitive.Description>
          <div className="flex justify-center gap-4">
            <SecondaryButton onClick={onClose} className="px-6">
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={onConfirm} className="px-6">
              Yes
            </PrimaryButton>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
