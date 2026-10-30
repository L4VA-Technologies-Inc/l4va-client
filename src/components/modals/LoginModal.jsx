import { useState, useEffect, useRef } from 'react';
import { Check, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions, useWallet } from '@ada-anvil/weld/react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import toast from 'react-hot-toast';

import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { CoreApiProvider } from '@/services/api/core';
import { useNetwork } from '@/hooks/useNetwork';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { validateWalletNetwork } from '@/utils/networkValidation';
import WalletIcon from '@/icons/wallet.svg?react';

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
  const { isRobinHood, network } = useNetwork();
  const { isAuthenticated, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('wallets');
  const installed = useExtensions('supportedMap');

  // Robinhood Chain (EVM) — no modal of ours: Reown AppKit's modal connects the wallet
  // (terms are its legal checkbox), then we log in by signing a backend challenge with it.
  const { isConnected: isRobinhoodConnected, address: robinhoodAddress } = useAccount();
  const { disconnectAsync: disconnectRobinhood } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { open: openAppKit } = useAppKit();
  const { open: isAppKitOpen } = useAppKitState();
  // Bumped every time the login is opened. A wallet can leave a request hanging forever
  // (e.g. OKX when its popup is closed instead of rejected); a newer attempt supersedes it
  // and the stale one's result is ignored.
  const evmAttemptRef = useRef(0);
  // AppKit reports open=false until its modal has actually opened; only a close after
  // that means the user dismissed it.
  const appKitWasOpenRef = useRef(false);

  // Backend issues a single-use message; the wallet personal_signs it to prove ownership.
  const loginWithRobinhoodAddress = async (address, attempt) => {
    const isCurrent = () => attempt === evmAttemptRef.current;
    sessionStorage.setItem('evm_login_in_progress', '1');
    try {
      const { data: challenge } = await CoreApiProvider.evmChallenge(address);
      const evmSignature = await signMessageAsync({ account: address, message: challenge.message });
      if (!isCurrent()) return;
      const res = await login(null, null, address, network, evmSignature);
      closeModal();
      if (!res?.user) {
        toast.error(res?.message || 'Failed to sign in');
        return;
      }
      if (!res.user.email) {
        openModal('EmailModal');
      }
      if (activeModalData?.props?.onSuccess) {
        activeModalData.props.onSuccess();
      }
    } catch (error) {
      if (!isCurrent()) return;
      closeModal();
      const msg = String(error?.shortMessage || error?.response?.data?.message || error?.message || '');
      if (error?.code === 4001 || msg.toLowerCase().includes('rejected')) {
        toast.error('Signature rejected in wallet');
      } else {
        toast.error(msg || 'Failed to sign in');
      }
    } finally {
      if (isCurrent()) {
        sessionStorage.removeItem('evm_login_in_progress');
        sessionStorage.removeItem('evm_intentional_disconnect');
      }
    }
  };

  // Every open of the login on Robinhood (openModal sets a new activeModalData each time,
  // even when the login is already active) goes straight to AppKit's wallet list. A wallet
  // left connected from an unfinished login is disconnected first, so the user can always
  // pick a different wallet.
  useEffect(() => {
    if (!isRobinHood) return;
    const attempt = ++evmAttemptRef.current;
    appKitWasOpenRef.current = false;
    (async () => {
      if (isRobinhoodConnected) {
        // The wallet-change watchdog must not log out between disconnect and the new connect.
        sessionStorage.setItem('evm_intentional_disconnect', '1');
        await disconnectRobinhood().catch(() => {});
      }
      if (attempt === evmAttemptRef.current) openAppKit({ view: 'Connect' });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRobinHood, activeModalData]);

  useEffect(() => {
    if (!isRobinHood) return;
    if (isAppKitOpen) {
      appKitWasOpenRef.current = true;
      return;
    }
    if (!appKitWasOpenRef.current) return;
    appKitWasOpenRef.current = false;
    if (isRobinhoodConnected && robinhoodAddress) {
      loginWithRobinhoodAddress(robinhoodAddress, evmAttemptRef.current);
    } else {
      // Dismissed without connecting.
      sessionStorage.removeItem('evm_intentional_disconnect');
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRobinHood, isAppKitOpen, isRobinhoodConnected, robinhoodAddress]);

  const wallet = useWallet(
    'isConnectingTo',
    'isConnected',
    'handler',
    'stakeAddressBech32',
    'changeAddressBech32',
    'networkId'
  );
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

  const handleDisconnect = (keepModalOpen = false) => {
    disconnect();
    logout();
    if (!keepModalOpen) {
      closeModal();
    }
  };

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
    if (!walletKey) {
      toast.error('Please select a wallet');
      return;
    }

    if (!isChecked || !isCheckedService) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    connect(walletKey, {
      onSuccess: ({ changeAddressBech32 }) => {
        const { isValid, networkType } = validateWalletNetwork(changeAddressBech32);

        if (!isValid) {
          disconnect();
          closeModal();
          openModal('MainNetModal', {
            networkType,
            onDisconnect: handleDisconnect,
          });
        } else {
          console.log('Successfully connected to wallet');
        }
      },
      onError: error => {
        const errorMessage = error?.message || 'Failed to connect to wallet';
        toast.error(errorMessage);
        console.error('Error connecting to wallet:', error);
      },
    });

    setIsLoading(false);
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) {
      toast.error('Wallet is not connected');
      return false;
    }

    setIsLoading(true);

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      const res = await login(signature, wallet.stakeAddressBech32, wallet.changeAddressBech32, network);

      if (!res?.user?.address) {
        toast.error('Failed to authenticate: Invalid response from server');
        return false;
      }
      const { isValid, networkType } = validateWalletNetwork(res.user.address, wallet.changeAddressBech32);
      if (!isValid) {
        disconnect();
        logout();
        closeModal();
        openModal('MainNetModal', {
          networkType,
          onDisconnect: handleDisconnect,
        });
        return false;
      }

      closeModal();

      if (!res.user?.email) {
        openModal('EmailModal');
      }

      if (activeModalData?.props?.onSuccess) {
        activeModalData.props.onSuccess();
      }

      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // The "sign" step signs with the Cardano (Weld) wallet. On Robinhood a still-connected
  // Cardano wallet (e.g. Eternl) must not hijack it — EVM login goes through wagmi.
  useEffect(() => {
    if (!isRobinHood && wallet.isConnected) {
      setView('sign');
    } else {
      setView('wallets');
    }
  }, [wallet.isConnected, isRobinHood]);

  const termsCheckboxes = (
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
  );

  const renderWalletsList = () => {
    const excludedWallets = ['nufiSnap', 'tokeo', 'flint'];
    const cardanoWallets = SUPPORTED_WALLETS.filter(wallet => !excludedWallets.includes(wallet.key));
    // Installed wallets always sort to the top; relative order within each group is preserved.
    const sortedCardanoWallets = [...cardanoWallets].sort(
      (a, b) => (installed.has(a.key) ? 0 : 1) - (installed.has(b.key) ? 0 : 1)
    );

    const renderWalletRow = walletItem => {
      const isConnecting = walletItem.isConnectingTo === walletItem.key;
      return (
        <div
          key={walletItem.key}
          className="
              flex items-center justify-between w-full p-2 bg-steel-950 rounded-lg
              transition-colors hover:bg-steel-750
            "
        >
          <button
            className="flex items-center gap-2 flex-1 text-left disabled:opacity-50"
            disabled={isConnecting || !isChecked || !isCheckedService}
            type="button"
            onClick={() => handleConnect(walletItem.key)}
          >
            {walletItem.icon ? (
              <img alt="" aria-hidden="true" className="w-6 h-6" src={walletItem.icon} />
            ) : (
              <WalletIcon className="w-6 h-6" />
            )}
            <span className="font-bold text-sm">{walletItem.displayName}</span>
          </button>
          <div className="flex items-center">
            {isConnecting && <Spinner />}
            {!installed.has(walletItem.key) && (
              <a
                className="text-sm text-dark-100 p-1"
                href={walletItem.website}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={`Download ${walletItem.displayName}`}
              >
                <Download className="w-4 h-4" size={14} />
              </a>
            )}
          </div>
        </div>
      );
    };

    return (
      <>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto px-1">{sortedCardanoWallets.map(renderWalletRow)}</div>
        {termsCheckboxes}
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

  if (isRobinHood) return null;

  return (
    <ModalWrapper isOpen title="Connect Wallet" onClose={closeModal} size="md">
      {view !== 'wallets' ? renderSignMessage() : renderWalletsList()}
    </ModalWrapper>
  );
};
