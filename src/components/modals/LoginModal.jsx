import { useState, useEffect } from 'react';
import { Check, X, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions } from '@ada-anvil/weld/react';

import { Spinner } from '@/components/Spinner';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';

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

  const handleTermsAcceptance = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, newValue.toString());
  };

  if (!isOpen) return null;

  const handleWalletConnect = (walletKey) => onConnect(walletKey);

  const renderWalletsList = () => (
    <>
      <div className="space-y-2 max-h-[30vh] overflow-y-auto">
        {SUPPORTED_WALLETS.map(wallet => (
          <button
            key={wallet.key}
            className="
              flex items-center justify-between w-full p-2 bg-dark-600 rounded-lg
              transition-colors disabled:opacity-50 hover:bg-[#2D3049]
            "
            disabled={isConnectingTo === wallet.key || !isChecked}
            type="button"
            onClick={() => handleWalletConnect(wallet.key)}
          >
            <div className="flex items-center gap-2">
              <img alt="wallet" height={40} src="/assets/wallet.png" width={40} />
              <span className="font-bold text-sm">
                {wallet.displayName}
              </span>
            </div>
            {isConnectingTo === wallet.key && <Spinner />}
            {!installed.has(wallet.key) && (
              <a
                className="text-sm text-dark-100"
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
      <div className="mt-6">
        <LavaCheckbox
          checked={isChecked}
          description="I have read and accepted the terms of the DexHunter Privacy Policy and Terms of Use"
          label={(
            <>Accept the <span className="text-blue-400">Privacy Policy and Terms of Use</span></>
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
          <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-main-orange" />
          <div className="text-sm sm:text-base">
            Wallet connected
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-main-orange" />
          ) : (
            <div
              className="w-6 h-6 sm:w-[30px] sm:h-[30px] bg-yellow-500/20 rounded-full flex items-center justify-center text-main-orange"
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
          className="cursor-pointer text-main-orange hover:underline"
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
      <div className="bg-[#181A2A] absolute top-0 right-4 z-50 w-[360px] rounded-t-[10px]">
        <div className="rounded-t-[10px] flex items-center justify-between px-4 py-2 bg-white/5">
          <p className="font-bold text-2xl">
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
        <div className="p-4 rounded-b-[10px]">
          {view === 'wallets' ? renderWalletsList() : renderSignMessage()}
        </div>
      </div>
    </>
  );
};
