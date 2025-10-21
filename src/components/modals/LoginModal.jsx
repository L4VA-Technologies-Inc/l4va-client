import { useState, useEffect } from 'react';
import { Check, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions, useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

const TERMS_ACCEPTANCE_KEY = 'dexhunter_terms_accepted';
const TERMS_ACCEPTANCE_SERVICE_KEY = 'service_terms_accepted';

const messageHex = msg =>
  Array.from(msg)
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

const TermsAgreementText = () => {
  return (
    <>
      I have read and accepted the{' '}
      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
        Privacy Policy
      </a>{' '}
      and{' '}
      <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
        Terms of Use
      </a>
      .
    </>
  );
};

export const LoginModal = () => {
  const { activeModalData } = useModal();
  const { openModal, closeModal } = useModalControls();
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('wallets');
  const installed = useExtensions('supportedMap');

  const { isAuthenticated, login, logout } = useAuth();
  const wallet = useWallet('isConnectingTo', 'isConnected', 'handler', 'stakeAddressBech32', 'changeAddressBech32');
  const connect = useWallet('connect');
  const disconnect = useWallet('disconnect');

  const [isChecked, setIsChecked] = useState(() => {
    const savedAcceptance = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
    return savedAcceptance === 'true';
  });

  const [isCheckedService, setIsCheckedService] = useState(() => {
    const savedAcceptanceService = localStorage.getItem(TERMS_ACCEPTANCE_SERVICE_KEY);
    return savedAcceptanceService === 'true';
  });

  useEffect(() => {
    if (wallet.isConnected) {
      setView('sign');
    } else {
      setView('wallets');
    }
  }, [wallet.isConnected]);

  const handleTermsAcceptance = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, newValue.toString());
  };

  const handleTermsAcceptanceService = () => {
    const newValue = !isCheckedService;
    setIsCheckedService(newValue);
    localStorage.setItem(TERMS_ACCEPTANCE_SERVICE_KEY, newValue.toString());
  };

  const handleConnect = walletKey => {
    if (walletKey) {
      connect(walletKey, {
        onSuccess: () => {
          console.log('Successfully connected to wallet');
          setIsLoading(false);
        },
        onError: error => {
          toast.error('Failed to connect to wallet');
          console.error('Error connecting to wallet:', error);
          setIsLoading(false);
        },
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
    closeModal();
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) return false;
    setIsLoading(true);

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      await login(signature, wallet.stakeAddressBech32, wallet.changeAddressBech32).then(res => {
        if (res && !res.user?.email) {
          openModal('EmailModal');
        }
      });
      closeModal();
      return activeModalData?.props?.onSuccess && activeModalData.props.onSuccess();
    } catch (error) {
      return console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWalletsList = () => {
    const excludedWallets = ['nufiSnap', 'tokeo', 'flint'];
    const filteredWallets = SUPPORTED_WALLETS.filter(wallet => !excludedWallets.includes(wallet.key));
    return (
      <>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto px-1">
          {filteredWallets.map(wallet => (
            <button
              key={wallet.key}
              className="
              flex items-center justify-between w-full p-2 bg-steel-950 rounded-lg
              transition-colors disabled:opacity-50 hover:bg-steel-750
            "
              disabled={wallet.isConnectingTo === wallet.key || !isChecked || !isCheckedService}
              type="button"
              onClick={() => handleConnect(wallet.key)}
            >
              <div className="flex items-center gap-2">
                <img alt="wallet" className="w-6 h-6" src={wallet.icon} />
                <span className="font-bold text-sm">{wallet.displayName}</span>
              </div>
              {wallet.isConnectingTo === wallet.key && <Spinner />}
              {!installed.has(wallet.key) && (
                <a
                  className="text-sm text-dark-100 p-1"
                  href={wallet.website}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={e => e.stopPropagation()}
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
            name="terms"
            onChange={handleTermsAcceptance}
          />
          <LavaCheckbox
            checked={isCheckedService}
            description={<TermsAgreementText />}
            name="service-terms"
            onChange={handleTermsAcceptanceService}
          />
        </div>
      </>
    );
  };

  const renderSignMessage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-orange-500" />
          <div className="text-sm sm:text-base">Wallet connected</div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Check className="w-6 h-6 sm:w-[30px] sm:h-[30px] text-orange-500" />
          ) : (
            <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] bg-yellow-500/20 rounded-full flex items-center justify-center text-orange-500">
              2
            </div>
          )}
          <div className="text-sm sm:text-base">Sign Message</div>
        </div>
      </div>
      <div className="flex justify-center">
        <PrimaryButton disabled={isLoading} icon={isLoading ? Spinner : undefined} onClick={handleSignMessage}>
          {isLoading ? 'Signing Message...' : 'Sign Message'}
        </PrimaryButton>
      </div>
      <div className="text-sm mt-4">
        Having issues? Try{' '}
        <span className="cursor-pointer text-orange-500 hover:underline" onClick={handleDisconnect}>
          disconnecting
        </span>{' '}
        your wallet
      </div>
    </div>
  );

  return (
    <ModalWrapper isOpen title="Connect Wallet" onClose={closeModal} size="md">
      {view === 'wallets' ? renderWalletsList() : renderSignMessage()}
    </ModalWrapper>
  );
};
