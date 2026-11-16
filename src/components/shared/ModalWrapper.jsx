import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  showCloseButton = true,
  maxHeight = '80vh',
  allowBodyScroll = false,
  size = 'responsive',
  header = true,
}) => {
  useEffect(() => {
    if (isOpen && !allowBodyScroll) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, allowBodyScroll]);

  // Restore focus to whatever opened the modal once it closes.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const handleModalKeyDown = e => {
    if (e.key === 'Tab') {
      // Keep Tab cycling inside the modal without a hard focus trap: the AppKit wallet modal
      // and body-level portals (HoverHelp, AssetSearchInput) must still be able to take focus.
      const focusables = [...e.currentTarget.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (e.key !== 'Escape') {
      e.stopPropagation();
    }
  };

  const getWidthClasses = () => {
    switch (size) {
      case 'sm':
        return 'md:max-w-sm';
      case 'md':
        return 'md:max-w-md';
      case 'lg':
        return 'md:max-w-lg';
      case 'xl':
        return 'md:max-w-xl';
      case '2xl':
        return 'md:max-w-2xl';
      case '3xl':
        return 'md:max-w-3xl';
      case '4xl':
        return 'md:max-w-5xl';
      case 'responsive':
      default:
        return 'md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl';
    }
  };

  if (!isOpen) return null;

  // Non-modal Radix gives us the portal, layered Escape (only the top-most modal/popover closes)
  // and title wiring. Backdrop, scroll lock and Tab cycling stay ours so outside layers keep working.
  return (
    <DialogPrimitive.Root open modal={false} onOpenChange={open => !open && onClose()}>
      <DialogPrimitive.Portal>
        <div className="fixed inset-0 z-60 bg-black/60" aria-hidden="true" onClick={onClose} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          aria-modal="true"
          className={`
          fixed z-70 bg-steel-950 flex flex-col shadow-xl outline-none

          /* Desktop styles - centered modal */
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-full ${getWidthClasses()} md:rounded-lg md:max-h-[80vh]

          /* Mobile styles - bottom sheet */
          max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full
          max-md:rounded-t-xl max-md:max-h-[90vh]

          /* Animation */
          animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0
          md:fade-in-0 md:zoom-in-95 duration-300
          ${className}
        `}
          style={{ maxHeight }}
          onKeyDown={handleModalKeyDown}
          onOpenAutoFocus={e => {
            // Focus the dialog itself rather than its first input (no surprise mobile keyboard).
            e.preventDefault();
            e.currentTarget.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={e => e.preventDefault()}
          onInteractOutside={e => e.preventDefault()}
        >
          {header ? (
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 flex-shrink-0 md:rounded-t-lg max-md:rounded-t-xl">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden" />
              <DialogPrimitive.Title className="font-bold text-2xl max-md:text-xl max-md:text-center max-md:flex-1 max-md:mt-2">
                {title}
              </DialogPrimitive.Title>
              {showCloseButton && (
                <button
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors max-md:absolute max-md:right-4 max-md:top-3 focus-visible:outline-2 focus-visible:outline-orange-500"
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" size={20} />
                </button>
              )}
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">{title || 'Dialog'}</DialogPrimitive.Title>
          )}
          <div
            className="flex-1 overflow-y-auto p-4 md:p-6 max-md:pb-8"
            style={{
              maxHeight: footer ? `calc(${maxHeight} - 120px)` : `calc(${maxHeight} - 60px)`,
            }}
          >
            {children}
          </div>
          {footer && (
            <div className="px-4 py-3 md:px-6 md:py-4 bg-white/5 border-t border-white/10 flex-shrink-0 md:rounded-b-lg">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
