import { useState, useEffect, useMemo, useRef } from 'react';
import { Check, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions, useWallet } from '@ada-anvil/weld/react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import toast from 'react-hot-toast';

import { EvmWalletPicker } from './EvmWalletPicker';

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
import { setRecentWalletId } from '@/lib/evm/walletRegistry';

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

  // Robinhood Chain (EVM) — connect via wagmi, then log in by signing a backend challenge.
  const {
    isConnected: isRobinhoodConnected,
    address: robinhoodAddress,
    connector: activeRobinhoodConnector,
  } = useAccount();
  const {
    connectors,
    connectAsync: connectRobinhoodAsync,
    isPending: isRobinhoodConnecting,
    variables: robinhoodConnectVars,
  } = useConnect();
  const { disconnectAsync: disconnectRobinhood } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  // Guards against double-clicks / overlapping connects — wagmi's isPending alone
  // is not enough (MetaMask Flask keeps a pending requestPermissions across calls).
  const robinhoodConnectLockRef = useRef(false);
  // Bumped per connect attempt; a result from an older (cancelled) attempt is ignored.
  const robinhoodAttemptRef = useRef(0);

  // Dedupe EIP-6963 wallets by id (StrictMode can announce them twice) and keep only
  // real, browser-detected extensions — drops the generic "injected" fallback as well
  // as SDK-based connectors (e.g. Coinbase), which are merged in separately below.
  // MetaMask + MetaMask Flask both inject and corrupt each other's RPC stream — if both
  // are present, keep only Flask in the list (still tell the user to disable the other).
  const robinhoodConnectors = useMemo(() => {
    const seen = new Set();
    const tempConnectors = connectors.map(v => ({
      ...v,
      displayName: v.name,
      key: v.id,
      installed: v.type === 'injected',
    }));
    const unique = tempConnectors.filter(connector => {
      if (seen.has(connector.id)) return false;
      seen.add(connector.id);
      return true;
    });
    const injectedOnly = unique.filter(connector => connector.id !== 'injected' && connector.type === 'injected');

    const metamaskFamily = injectedOnly.filter(c => (c.name || c.displayName || '').toLowerCase().includes('metamask'));
    if (metamaskFamily.length <= 1) return injectedOnly;

    const flask = metamaskFamily.find(c => (c.name || c.displayName || '').toLowerCase().includes('flask'));
    const keepId = (flask || metamaskFamily[0]).id;
    return injectedOnly.filter(c => {
      const name = (c.name || c.displayName || '').toLowerCase();
      if (!name.includes('metamask')) return true;
      return c.id === keepId;
    });
  }, [connectors]);

  const hasConflictingMetaMasks = useMemo(() => {
    // Prefer rdns/id (EIP-6963) over display name — "MetaMask Flask" contains
    // "metamask" and was falsely tripping a name-based check.
    const injected = connectors.filter(c => c.type === 'injected' && c.id !== 'injected');
    const hasMetaMask = injected.some(c => {
      const id = (c.id || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      return id === 'io.metamask' || (name === 'metamask' && !name.includes('flask'));
    });
    const hasFlask = injected.some(c => {
      const id = (c.id || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      return id === 'io.metamask.flask' || name.includes('flask');
    });
    return hasMetaMask && hasFlask;
  }, [connectors]);

  // Backend issues a single-use message; the wallet personal_signs it to prove ownership.
  const loginWithRobinhoodAddress = async (address, walletId) => {
    if (!address) return;
    const { data: challenge } = await CoreApiProvider.evmChallenge(address);
    const evmSignature = await signMessageAsync({ account: address, message: challenge.message });
    const res = await login(null, null, address, network, evmSignature);
    if (!res?.user) return;

    setRecentWalletId(walletId);
    closeModal();
    if (!res.user.email) {
      openModal('EmailModal');
    }
    if (activeModalData?.props?.onSuccess) {
      activeModalData.props.onSuccess();
    }
  };

  const clearEvmLoginFlags = () => {
    sessionStorage.removeItem('evm_intentional_disconnect');
    sessionStorage.removeItem('evm_login_in_progress');
  };

  // onDisplayUri: WalletConnect pairing uri, rendered by EvmWalletPicker as a QR (desktop)
  // or handed to the wallet app via deep link (mobile).
  // Not gated on wagmi's isPending: an abandoned WalletConnect pairing never settles,
  // so cancelRobinhoodConnect releases the lock and the stale attempt is ignored.
  const handleRobinhoodConnect = async (connector, { walletId, onDisplayUri } = {}) => {
    if (!connector || robinhoodConnectLockRef.current) return;
    robinhoodConnectLockRef.current = true;
    const attempt = ++robinhoodAttemptRef.current;
    walletId = walletId || connector.id;

    // Already connected — login in place. Never switch chain during login (second
    // MetaMask popup → accountsChanged flicker → "Wallet changed" logout).
    if (
      isRobinhoodConnected &&
      robinhoodAddress &&
      (!activeRobinhoodConnector || activeRobinhoodConnector.id === connector.id)
    ) {
      try {
        await loginWithRobinhoodAddress(robinhoodAddress, walletId);
      } catch (error) {
        const msg = String(error?.shortMessage || error?.message || '');
        if (error?.code === 4001 || msg.toLowerCase().includes('rejected')) {
          toast.error('Signature rejected in wallet');
        } else {
          toast.error(msg || 'Failed to sign in');
        }
      } finally {
        robinhoodConnectLockRef.current = false;
      }
      return;
    }

    sessionStorage.setItem('evm_intentional_disconnect', '1');
    sessionStorage.setItem('evm_login_in_progress', '1');

    const onConnectorMessage = ({ type, data }) => {
      if (type === 'display_uri' && attempt === robinhoodAttemptRef.current) onDisplayUri?.(data);
    };
    if (onDisplayUri) connector.emitter.on('message', onConnectorMessage);

    try {
      if (isRobinhoodConnected) {
        await disconnectRobinhood();
      }

      // Single wagmi connect only — do NOT also call eth_requestAccounts / poll
      // eth_accounts. Extra RPC traffic desyncs MetaMask Flask's inpage stream
      // ("StreamMiddleware - Unknown response id" spam) and blocks connect.
      const data = await connectRobinhoodAsync({ connector });
      if (attempt !== robinhoodAttemptRef.current) return;
      const address = data?.accounts?.[0];
      if (!address) {
        toast.error('Wallet connection was not completed');
        return;
      }

      await loginWithRobinhoodAddress(address, walletId);
    } catch (error) {
      if (attempt !== robinhoodAttemptRef.current) return;
      const msg = String(error?.shortMessage || error?.message || '');
      if (error?.code === 4001 || msg.toLowerCase().includes('rejected')) {
        toast.error('Connection rejected in wallet');
      } else if (error?.code === -32002 || msg.includes('already pending')) {
        toast.error('Pending request in Flask — reject it, then click Connect once');
      } else {
        toast.error(msg || 'Failed to connect wallet');
      }
    } finally {
      if (onDisplayUri) connector.emitter.off('message', onConnectorMessage);
      if (attempt === robinhoodAttemptRef.current) {
        clearEvmLoginFlags();
        robinhoodConnectLockRef.current = false;
      }
    }
  };

  const cancelRobinhoodConnect = () => {
    robinhoodAttemptRef.current += 1;
    robinhoodConnectLockRef.current = false;
    clearEvmLoginFlags();
  };

  const handleEvmWalletPick = (connector, options) => {
    if (!isChecked || !isCheckedService) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    return handleRobinhoodConnect(connector, options);
  };

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
    if (isRobinHood) {
      const connector = connectors.find(c => c.id === walletKey);
      handleRobinhoodConnect(connector);
    } else {
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
    }

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

  const renderEvmWallets = () => (
    <>
      {hasConflictingMetaMasks && (
        <p className="mb-3 text-sm text-orange-500 px-1">
          MetaMask and MetaMask Flask are both enabled. Disable one in your browser extensions, then refresh — both at
          once breaks connect.
        </p>
      )}
      <EvmWalletPicker
        connectingId={isRobinhoodConnecting ? robinhoodConnectVars?.connector?.id : null}
        connectors={connectors}
        detectedConnectors={robinhoodConnectors}
        disabled={!isChecked || !isCheckedService}
        onCancel={cancelRobinhoodConnect}
        onConnect={handleEvmWalletPick}
      >
        {termsCheckboxes}
      </EvmWalletPicker>
    </>
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

  return (
    <ModalWrapper isOpen title="Connect Wallet" onClose={closeModal} size="md">
      {view !== 'wallets' ? renderSignMessage() : isRobinHood ? renderEvmWallets() : renderWalletsList()}
    </ModalWrapper>
  );
};
