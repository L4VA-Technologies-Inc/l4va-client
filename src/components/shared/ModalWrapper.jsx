import { X } from 'lucide-react';

import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { useBodyOverflow } from '@/hooks/useBodyOverflow';

/**
 * @typedef {Object} ModalWrapperProps
 * @property {React.ReactNode} children - The content to render inside the modal
 * @property {string} title - The modal title
 * @property {string} modalName - The name of the modal to match against activeModalData
 * @property {string} [className] - Additional CSS classes for the modal container
 * @property {boolean} [showCloseButton=true] - Whether to show the close button
 * @property {Function} [onClose] - Custom close handler function
 * @property {string} [position='center'] - Modal position: 'center' or 'top-right'
 */

/**
 * Reusable modal wrapper component that provides consistent styling and behavior
 * @param {ModalWrapperProps} props
 */
export const ModalWrapper = ({
  children,
  title,
  modalName,
  className = '',
  showCloseButton = true,
  onClose,
  position = 'center',
}) => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();

  useBodyOverflow(activeModalData?.name === modalName);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  if (activeModalData?.name !== modalName) return null;

  const getPositionClasses = () => {
    if (position === 'top-right') {
      return `
        /* Desktop styles */
        md:absolute md:top-0 md:right-4 md:w-[360px] md:rounded-[10px]

        /* Mobile styles */
        max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:rounded-t-xl
      `;
    }

    // Default center positioning
    return `
      /* Desktop styles */
      md:fixed-center md:w-[360px] md:rounded-[10px]

      /* Mobile styles */
      max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:rounded-t-xl
    `;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleClose} />
      <div
        className={`
          fixed z-50 bg-steel-950
          ${getPositionClasses()}
          ${className}
        `}
      >
        <div
          className="
            flex items-center justify-between px-4 bg-white/5

            /* Desktop styles */
            md:py-3 md:rounded-t-[10px]

            /* Mobile styles */
            max-md:py-3 max-md:rounded-t-xl
          "
        >
          <p className="font-bold text-2xl max-md:text-xl">{title}</p>
          {showCloseButton && (
            <button className="p-1 hover:bg-white/10 rounded-lg transition-colors" type="button" onClick={handleClose}>
              <X className="w-4 h-4" size={20} />
            </button>
          )}
        </div>
        <div className="p-4 md:p-5 md:rounded-b-[10px] max-md:pb-8 max-md:pt-3">{children}</div>
      </div>
    </>
  );
};
