import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export const AlertBanner = ({ message, type = 'warning', dismissible = false, onDismiss = null }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  const bgColor = {
    warning: 'bg-yellow-900/30 border-yellow-600/50',
    error: 'bg-red-900/30 border-red-600/50',
    info: 'bg-blue-900/30 border-blue-600/50',
  }[type];

  const textColor = {
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  }[type];

  return (
    <div className={`w-full border-b ${bgColor} py-3 px-4`}>
      <div className="container mx-auto px-4 xl:px-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className={`w-5 h-5 ${textColor} flex-shrink-0`} />
            <p className="text-sm text-white">{message}</p>
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={`${textColor} hover:opacity-80 transition-opacity flex-shrink-0`}
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
