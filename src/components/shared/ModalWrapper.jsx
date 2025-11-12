import { X } from 'lucide-react';
import { useEffect } from 'react';

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

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
      case 'responsive':
      default:
        return 'md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={`
          fixed z-70 bg-steel-950 flex flex-col shadow-xl

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {header ? (
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 flex-shrink-0 md:rounded-t-lg max-md:rounded-t-xl">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden" />
            <h2
              id="modal-title"
              className="font-bold text-2xl max-md:text-xl max-md:text-center max-md:flex-1 max-md:mt-2"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                className="p-1 hover:bg-white/10 rounded-lg transition-colors max-md:absolute max-md:right-4 max-md:top-3"
                type="button"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" size={20} />
              </button>
            )}
          </div>
        ) : null}
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
      </div>
    </>
  );
};
