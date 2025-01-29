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
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0" />
      <div className="relative flex items-center justify-center p-4 h-full">
        <div className="bg-white rounded-xl w-full max-w-md p-6 pointer-events-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {view === 'wallets' ? 'Connect your wallet' : 'Sign in'}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              type="button"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
          {view === 'wallets' ? (
            <div className="space-y-3">
              {SUPPORTED_WALLETS.map(wallet => (
                <button
                  key={wallet.key}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-900 transition-colors disabled:opacity-50"
                  disabled={isConnectingTo === wallet.key}
                  type="button"
                  onClick={() => handleWalletConnect(wallet.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{wallet.displayName}</span>
                  </div>
                  {isConnectingTo === wallet.key && <Spinner />}
                  {!installed.has(wallet.key) && (
                    <a
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      href={wallet.website}
                      rel="noopener noreferrer"
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                      Install
                    </a>
                  )}
                </button>
              ))}
              <p className="text-gray-500 text-sm">* Unverified wallets</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-[30px] h-[30px] text-yellow-500" />
                  <div className="text-gray-900">
                    Wallet connected
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
