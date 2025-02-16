import { useState, useEffect } from 'react';
import { Check, X, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions } from '@ada-anvil/weld/react';

import { Spinner } from '../Spinner.jsx';
import { PrimaryButton } from '../shared/PrimaryButton.jsx';

export const LoginModal = ({
  isOpen,
  onClose,
  isConnected,
  isConnectingTo,
  isAuthenticated,
  onConnect,
  onSignMessage,
  isLoading,
  disconnect,
}) => {
  const [view, setView] = useState('wallets');
  const installed = useExtensions('supportedMap');

  useEffect(() => {
    if (isConnected) {
      setView('sign');
    } else {
      setView('wallets');
    }
  }, [isConnected]);

  if (!isOpen) return null;

  const handleWalletConnect = (walletKey) => {
    onConnect(walletKey);
  };

  return (
    <div className="fixed inset-0 pointer-events-none bg-gray-900/40">
      <div className="absolute inset-0" />
      <div className="relative flex items-center justify-center p-2 sm:p-4 h-full">
        <div
          className="bg-primary-background rounded-xl w-full max-w-md mx-2 p-4 sm:p-6 pointer-events-auto"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold ">
              {view === 'wallets' ? 'Connect your wallet' : 'Sign in'}
            </h2>
            <button
              className=" p-1"
              type="button"
              onClick={onClose}
            >
              <X className="sm:w-6 sm:h-6" size={20} />
            </button>
          </div>
          {view === 'wallets' ? (
            <div className="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto">
              {SUPPORTED_WALLETS.map(wallet => (
                <button
                  key={wallet.key}
                  className="flex items-center justify-between w-full p-3 sm:p-4 bg-dark-600 rounded-lg  transition-colors disabled:opacity-50"
                  disabled={isConnectingTo === wallet.key}
                  type="button"
                  onClick={() => handleWalletConnect(wallet.key)}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-medium text-sm sm:text-base">{wallet.displayName}</span>
                  </div>
                  {isConnectingTo === wallet.key && <Spinner />}
                  {!installed.has(wallet.key) && (
                    <a
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      href={wallet.website}
                      rel="noopener noreferrer"
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="sm:w-4 sm:h-4" size={14} />
                      Install
                    </a>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-main-orange" />
                  <div className=" text-sm sm:text-base">
                    Wallet connected
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-main-orange" />
                  ) : (
                    <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] bg-yellow-500/20 rounded-full flex items-center justify-center text-main-orange">
                      2
                    </div>
                  )}
                  <div className=" text-sm sm:text-base">
                    Sign Terms of Use
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <PrimaryButton
                  disabled={isLoading}
                  icon={isLoading ? Spinner : undefined}
                  size="small"
                  onClick={onSignMessage}
                >
                  {isLoading ? 'Signing message...' : 'Sign message'}
                </PrimaryButton>
              </div>
              <div className="text-sm  mt-4">
                Having issues? Try{' '}
                <span
                  className="cursor-pointer text-main-orange hover:underline"
                  onClick={disconnect}
                >
                  disconnecting
                </span>
                {' '}your wallet
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
