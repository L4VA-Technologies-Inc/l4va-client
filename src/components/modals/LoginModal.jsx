import { Check, X } from 'lucide-react';

import { Spinner } from '../Spinner.jsx';

export const LoginModal = ({
  isOpen,
  onClose,
  isConnected,
  isAuthenticated,
  onConnect,
  onSignMessage,
  isLoading,
}) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    if (!isConnected) {
      onConnect();
    } else if (!isAuthenticated) {
      onSignMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Check className="w-[30px] h-[30px] text-yellow-500" />
              ) : (
                <div className="w-[30px] h-[30px] bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                  1
                </div>
              )}
              <div className="text-gray-900">
                Connect wallet
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Check className="w-[30px] h-[30px] text-yellow-500" />
              ) : (
                <div className="w-[30px] h-[30px] bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                  2
                </div>
              )}
              <div className="text-gray-900">
                Sign Terms of Use
              </div>
            </div>
          </div>

          <button
            className="w-full h-11 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isLoading}
            onClick={handleContinue}
          >
            {isLoading && <Spinner />}
            {isConnected ? 'Continue in your wallet' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
