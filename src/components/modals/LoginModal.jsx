import { useState, useEffect } from 'react';
import { Check, X, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions } from '@ada-anvil/weld/react';

import { Spinner } from '@/components/Spinner';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';

import { useBodyOverflow } from '@/hooks/useBodyOverflow';

const TERMS_ACCEPTANCE_KEY = 'dexhunter_terms_accepted';

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

  const [isChecked, setIsChecked] = useState(() => {
    const savedAcceptance = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
    return savedAcceptance === 'true';
  });

  useEffect(() => {
    if (isConnected) {
      setView('sign');
    } else {
      setView('wallets');
    }
  }, [isConnected]);

  useBodyOverflow(isOpen);

  const handleTermsAcceptance = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, newValue.toString());
  };

  if (!isOpen) return null;

  const handleWalletConnect = (walletKey) => onConnect(walletKey);

  const renderWalletsList = () => (
    <>
      <div className="space-y-2 max-h-[30vh] overflow-y-auto px-1">
        {SUPPORTED_WALLETS.map(wallet => (
          <button
            key={wallet.key}
            className="
              flex items-center justify-between w-full p-2 bg-steel-950 rounded-lg
              transition-colors disabled:opacity-50 hover:bg-steel-750
            "
            disabled={isConnectingTo === wallet.key || !isChecked}
            type="button"
            onClick={() => handleWalletConnect(wallet.key)}
          >
            <div className="flex items-center gap-2">
              <img alt="wallet" className="w-8 h-8 md:w-10 md:h-10" height={40} src="/assets/wallet.png" width={40} />
              <span className="font-bold text-sm">
                {wallet.displayName}
              </span>
            </div>
            {isConnectingTo === wallet.key && <Spinner />}
            {!installed.has(wallet.key) && (
              <a
                className="text-sm text-dark-100 p-1"
                href={wallet.website}
                rel="noopener noreferrer"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" size={14} />
              </a>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 md:mt-6">
        <LavaCheckbox
          checked={isChecked}
          description="I have read and accepted the terms of the DexHunter Privacy Policy and Terms of Use"
          label={(
            <span className="text-sm md:text-base">Accept the <span className="text-blue-400">Privacy Policy and Terms of Use</span></span>
          )}
          name="terms"
          onChange={handleTermsAcceptance}
        />
      </div>
    </>
  );

  const renderSignMessage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-orange-500" />
          <div className="text-sm sm:text-base">
            Wallet connected
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-orange-500" />
          ) : (
            <div
              className="w-6 h-6 sm:w-[30px] sm:h-[30px] bg-yellow-500/20 rounded-full flex items-center justify-center text-orange-500"
            >
              2
            </div>
          )}
          <div className="text-sm sm:text-base">
            Sign Message
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
      <div className="text-sm mt-4">
        Having issues? Try{' '}
        <span
          className="cursor-pointer text-orange-500 hover:underline"
          onClick={disconnect}
        >
          disconnecting
        </span>
        {' '}your wallet
      </div>
    </div>
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div
        className="
          fixed z-50 bg-steel-950

          /* Desktop styles */
          md:fixed-center md:w-[360px] md:rounded-[10px]

          /* Mobile styles */
          max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:rounded-t-xl
        "
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
          <p className="font-bold text-2xl max-md:text-xl">
            Connect Wallet
          </p>
          <button
            className="p-1"
            type="button"
            onClick={onClose}
          >
            <X className="w-4 h-4" size={20} />
          </button>
        </div>
        <div className="p-4 md:p-5 md:rounded-b-[10px] max-md:pb-8 max-md:pt-3">
          {view === 'wallets' ? renderWalletsList() : renderSignMessage()}
        </div>
      </div>
    </>
  );
};
