import { useState, useEffect, useMemo, useRef } from 'react';
import { Check, Download } from 'lucide-react';
import { SUPPORTED_WALLETS } from '@ada-anvil/weld';
import { useExtensions, useWallet } from '@ada-anvil/weld/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import toast from 'react-hot-toast';

import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { validateWalletNetwork } from '@/utils/networkValidation';
import WalletIcon from '@/icons/wallet.svg?react';
import MetaMaskIcon from '@/icons/metamask.svg?react';
import WalletConnectIcon from '@/icons/walletconnect.svg?react';
import OkxIcon from '@/icons/okx.svg?react';
import BinanceIcon from '@/icons/binance.svg?react';
import CoinbaseIcon from '@/icons/coinbase.svg?react';
import TrustWalletIcon from '@/icons/trustwallet.svg?react';

const TERMS_ACCEPTANCE_KEY = 'dexhunter_terms_accepted';
const TERMS_ACCEPTANCE_SERVICE_KEY = 'service_terms_accepted';

// Curated EVM wallets shown as a "download" row when not detected as installed
// (EIP-6963 only announces wallets actually present) — Coinbase is the exception, its
// SDK connector works even without a detected extension (see coinbaseConnector below).
const POPULAR_EVM_WALLETS = [
  { key: 'metamask', displayName: 'MetaMask', website: 'https://metamask.io/download/', Icon: MetaMaskIcon },
  {
    key: 'walletconnect',
    displayName: 'WalletConnect',
    website: 'https://walletconnect.com/',
    Icon: WalletConnectIcon,
  },
  { key: 'okx', displayName: 'OKX Wallet', website: 'https://www.okx.com/web3', Icon: OkxIcon },
  {
    key: 'binance',
    displayName: 'Binance Wallet',
    website: 'https://www.binance.com/en/web3wallet',
    Icon: BinanceIcon,
  },
  {
    key: 'coinbase',
    displayName: 'Coinbase Wallet',
    website: 'https://www.coinbase.com/wallet/downloads',
    Icon: CoinbaseIcon,
  },
  {
    key: 'trust',
    displayName: 'Trust Wallet',
    website: 'https://trustwallet.com/download',
    Icon: TrustWalletIcon,
  },
];

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

  // Robinhood Chain (EVM) — connect via wagmi, then log in by address (no signature).
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
  // Guards against double-clicks / overlapping connects — wagmi's isPending alone
  // is not enough (MetaMask Flask keeps a pending requestPermissions across calls).
  const robinhoodConnectLockRef = useRef(false);

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

  // Coinbase's SDK connector works without browser detection — it opens its own popup
  // (extension if present, otherwise a QR code for the mobile app) — so it's always
  // offered as connectable rather than gated behind EIP-6963 detection.
  const coinbaseConnector = connectors.find(c => c.type === 'coinbaseWallet');

  // Backend authenticates EVM users by wallet address only (no signature).
  const loginWithRobinhoodAddress = async address => {
    if (!address) return;
    const res = await login(null, null, address, network);
    if (!res?.user) return;

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

  const handleRobinhoodConnect = async connector => {
    if (!connector || isRobinhoodConnecting || robinhoodConnectLockRef.current) return;
    robinhoodConnectLockRef.current = true;

    // Already connected — login in place. Never switch chain during login (second
    // MetaMask popup → accountsChanged flicker → "Wallet changed" logout).
    if (
      isRobinhoodConnected &&
      robinhoodAddress &&
      (!activeRobinhoodConnector || activeRobinhoodConnector.id === connector.id)
    ) {
      try {
        await loginWithRobinhoodAddress(robinhoodAddress);
      } finally {
        robinhoodConnectLockRef.current = false;
      }
      return;
    }

    sessionStorage.setItem('evm_intentional_disconnect', '1');
    sessionStorage.setItem('evm_login_in_progress', '1');

    try {
      if (isRobinhoodConnected) {
        await disconnectRobinhood();
      }

      // Single wagmi connect only — do NOT also call eth_requestAccounts / poll
      // eth_accounts. Extra RPC traffic desyncs MetaMask Flask's inpage stream
      // ("StreamMiddleware - Unknown response id" spam) and blocks connect.
      const data = await connectRobinhoodAsync({ connector });
      const address = data?.accounts?.[0];
      if (!address) {
        toast.error('Wallet connection was not completed');
        return;
      }

      await loginWithRobinhoodAddress(address);
    } catch (error) {
      const msg = String(error?.shortMessage || error?.message || '');
      if (error?.code === 4001 || msg.toLowerCase().includes('rejected')) {
        toast.error('Connection rejected in wallet');
      } else if (error?.code === -32002 || msg.includes('already pending')) {
        toast.error('Pending request in Flask — reject it, then click Connect once');
      } else {
        toast.error(msg || 'Failed to connect wallet');
      }
    } finally {
      clearEvmLoginFlags();
      robinhoodConnectLockRef.current = false;
    }
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

  useEffect(() => {
    if (wallet.isConnected) {
      setView('sign');
    } else {
      setView('wallets');
    }
  }, [wallet.isConnected]);

  const renderWalletsList = () => {
    const excludedWallets = ['nufiSnap', 'tokeo', 'flint'];
    const cardanoWallets = SUPPORTED_WALLETS.filter(wallet => !excludedWallets.includes(wallet.key));
    // Installed wallets always sort to the top; relative order within each group is preserved.
    const sortedCardanoWallets = [...cardanoWallets].sort(
      (a, b) => (installed.has(a.key) ? 0 : 1) - (installed.has(b.key) ? 0 : 1)
    );

    const renderWalletRow = walletItem => {
      const isConnecting = isRobinHood
        ? isRobinhoodConnecting && robinhoodConnectVars?.connector?.id === walletItem.key
        : walletItem.isConnectingTo === walletItem.key;
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
            {walletItem.Icon ? (
              <walletItem.Icon className="w-6 h-6 rounded-md" />
            ) : walletItem.icon ? (
              <img alt="" aria-hidden="true" className="w-6 h-6" src={walletItem.icon} />
            ) : (
              <WalletIcon className="w-6 h-6" />
            )}
            <span className="font-bold text-sm">{walletItem.displayName}</span>
          </button>
          <div className="flex items-center">
            {isConnecting && <Spinner />}
            {!isRobinHood && !installed.has(walletItem.key) && (
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

    const renderDownloadWalletRow = walletItem => {
      const Icon = walletItem.Icon || WalletIcon;
      return (
        <a
          key={walletItem.key}
          className="flex items-center justify-between w-full p-2 bg-steel-950 rounded-lg transition-colors hover:bg-steel-750"
          href={walletItem.website}
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6 rounded-md" />
            <span className="font-bold text-sm">{walletItem.displayName}</span>
          </div>
          <Download className="w-4 h-4 text-dark-100" size={14} />
        </a>
      );
    };

    // Name-match a detected EVM connector against our curated wallet list (e.g. a
    // browser's EIP-6963 "MetaMask" connector matches the 'metamask' entry) so it gets
    // the brand icon and isn't also listed as a separate download prompt.
    const matchPopularEvmWallet = displayName => {
      const name = displayName?.toLowerCase() || '';
      return POPULAR_EVM_WALLETS.find(pw => name.includes(pw.key));
    };

    let evmConnectableWallets = [];
    let evmDownloadWallets = [];
    if (isRobinHood) {
      const detectedKeys = new Set();
      evmConnectableWallets = robinhoodConnectors.map(connector => {
        const match = matchPopularEvmWallet(connector.displayName);
        if (match) detectedKeys.add(match.key);
        return match ? { ...connector, Icon: match.Icon } : connector;
      });

      // Coinbase's SDK connector works without a detected extension (it opens its own
      // popup, falling back to a QR code) — offer it as a connect button unless its
      // browser extension was already picked up above.
      if (!detectedKeys.has('coinbase') && coinbaseConnector) {
        const coinbasePopular = POPULAR_EVM_WALLETS.find(pw => pw.key === 'coinbase');
        evmConnectableWallets.push({ ...coinbasePopular, key: coinbaseConnector.id });
        detectedKeys.add('coinbase');
      }

      evmDownloadWallets = POPULAR_EVM_WALLETS.filter(pw => !detectedKeys.has(pw.key));
    }

    return (
      <>
        {isRobinHood && hasConflictingMetaMasks && (
          <p className="mb-3 text-sm text-orange-500 px-1">
            MetaMask and MetaMask Flask are both enabled. Disable one in your browser extensions, then refresh — both at
            once breaks connect.
          </p>
        )}
        <div className="space-y-2 max-h-[30vh] overflow-y-auto px-1">
          {isRobinHood ? (
            <>
              {evmConnectableWallets.map(renderWalletRow)}
              {evmDownloadWallets.map(renderDownloadWalletRow)}
            </>
          ) : (
            sortedCardanoWallets.map(renderWalletRow)
          )}
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
