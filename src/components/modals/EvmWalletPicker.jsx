import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Copy, KeyRound, Wallet as WalletLucide } from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import WalletIcon from '@/icons/wallet.svg?react';
import {
  EVM_WALLETS,
  GET_WALLET_IDS,
  MOBILE_WALLET_IDS,
  RECOMMENDED_WALLET_IDS,
  WALLET_LEARN_MORE_URL,
  getRecentWalletId,
  hasInjectedProvider,
  isMobileDevice,
  matchEvmWallet,
  setWalletConnectDeepLinkChoice,
} from '@/lib/evm/walletRegistry';

const WalletLogo = ({ wallet, connector, className = 'w-8 h-8' }) => {
  const rounded = `${className} rounded-lg shrink-0`;
  if (wallet?.Icon) return <wallet.Icon className={rounded} />;
  if (wallet?.iconUrl) return <img alt="" aria-hidden="true" className={rounded} src={wallet.iconUrl} />;
  if (connector?.icon) return <img alt="" aria-hidden="true" className={rounded} src={connector.icon} />;
  return <WalletIcon className={rounded} />;
};

const SubHeader = ({ title, onBack }) => (
  <div className="relative flex items-center justify-center mb-4 min-h-8">
    <button
      aria-label="Back"
      className="absolute left-0 p-1 rounded-lg text-orange-500 hover:bg-white/10 transition-colors"
      type="button"
      onClick={onBack}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <h3 className="font-bold text-lg">{title}</h3>
  </div>
);

const WcStalledNotice = ({ dark }) => (
  <p className={`mt-6 text-sm text-center max-w-xs ${dark ? 'text-slate-950' : 'text-dark-100'}`}>
    Couldn&apos;t reach WalletConnect. Check your connection and that this site uses HTTPS, then go back and try again.
  </p>
);

const SectionTitle = ({ children, accent }) => (
  <div className={`px-2 pt-3 pb-1 text-sm font-bold ${accent ? 'text-orange-500' : 'text-dark-100'}`}>{children}</div>
);

/**
 * RainbowKit-style EVM wallet picker (Installed / Recommended, "What is a Wallet?",
 * "Get a Wallet", desktop QR, mobile app deep links). It only picks a connector —
 * LoginModal's `onConnect(connector, { walletId, onDisplayUri })` connects and signs in.
 */
export const EvmWalletPicker = ({
  connectors,
  detectedConnectors,
  disabled,
  connectingId,
  onConnect,
  onCancel,
  children,
}) => {
  const isMobile = useMemo(isMobileDevice, []);
  const [view, setView] = useState('list'); // list | what | get | qr | opening
  const [activeWallet, setActiveWallet] = useState(null);
  const [wcUri, setWcUri] = useState(null);
  const [wcUriTimedOut, setWcUriTimedOut] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const recentId = useMemo(getRecentWalletId, []);

  const coinbaseConnector = connectors.find(c => c.type === 'coinbaseWallet');
  const wcConnector = connectors.find(c => c.type === 'walletConnect');
  const injectedConnector = connectors.find(c => c.id === 'injected');

  // The relay normally hands over a pairing uri within a couple of seconds; surface a stall
  // instead of spinning forever (blocked relay, project-id domain allowlist, insecure origin).
  useEffect(() => {
    setWcUriTimedOut(false);
    if (wcUri || (view !== 'qr' && view !== 'opening')) return;
    const timer = setTimeout(() => setWcUriTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [wcUri, view]);

  useEffect(() => {
    if (!wcUri || view !== 'qr') {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(wcUri, { margin: 1, width: 560, errorCorrectionLevel: 'M' })
      .then(url => !cancelled && setQrDataUrl(url))
      .catch(() => !cancelled && setQrDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [wcUri, view]);

  const backToList = () => {
    if (view === 'qr' || view === 'opening') onCancel?.();
    setWcUri(null);
    setActiveWallet(null);
    setView('list');
  };

  const connectWithWalletConnect = async wallet => {
    if (!wcConnector) {
      toast.error('WalletConnect is not configured');
      return;
    }
    setActiveWallet(wallet);
    setWcUri(null);
    setView(isMobile ? 'opening' : 'qr');
    // Mobile: sign-client re-opens the chosen app for the sign-in signature too.
    setWalletConnectDeepLinkChoice(isMobile ? wallet : null);

    await onConnect(wcConnector, {
      walletId: wallet.id,
      onDisplayUri: uri => {
        setWcUri(uri);
        if (isMobile && wallet.wcDeepLink) {
          window.location.href = wallet.wcDeepLink(uri);
        }
      },
    });
    // Reached on failure or cancel; on success LoginModal closes and unmounts us.
    setView(current => (current === 'qr' || current === 'opening' ? 'list' : current));
  };

  const connectCurated = wallet => {
    if (wallet.connect === 'download') {
      if (isMobile && wallet.inAppBrowserUrl) {
        window.location.href = wallet.inAppBrowserUrl();
      } else {
        window.open(wallet.download, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    if (wallet.connect === 'coinbase') {
      if (coinbaseConnector) onConnect(coinbaseConnector, { walletId: wallet.id });
      return;
    }
    connectWithWalletConnect(wallet);
  };

  const connectDetected = connector => {
    onConnect(connector, { walletId: matchEvmWallet(connector)?.id || connector.id });
  };

  // ---- desktop list ------------------------------------------------------------

  const installedRows = detectedConnectors
    .map(connector => {
      const wallet = matchEvmWallet(connector);
      return { key: connector.id, connector, wallet, walletId: wallet?.id || connector.id };
    })
    .sort((a, b) => (b.walletId === recentId) - (a.walletId === recentId));
  const installedWalletIds = new Set(installedRows.map(r => r.walletId));

  const recommendedRows = [
    ...(wcConnector ? [EVM_WALLETS.walletconnect] : []),
    ...RECOMMENDED_WALLET_IDS.filter(id => !installedWalletIds.has(id)).map(id => EVM_WALLETS[id]),
  ];
  // Generic window.ethereum connector — covers legacy wallets that inject without an
  // EIP-6963 announcement (they never reach "Installed"), and whichever extension currently
  // owns window.ethereum otherwise.
  const legacyBrowserConnector = hasInjectedProvider() ? injectedConnector : null;

  const renderListRow = ({ key, wallet, connector, name, walletId, onClick }) => {
    const isConnecting = connectingId && (connectingId === connector?.id || connectingId === walletId);
    return (
      <button
        key={key}
        className="flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors hover:bg-steel-750 disabled:opacity-50 disabled:hover:bg-transparent"
        disabled={disabled}
        type="button"
        onClick={onClick}
      >
        <WalletLogo connector={connector} wallet={wallet} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{name}</div>
          {walletId === recentId && <div className="text-xs text-orange-500">Recent</div>}
        </div>
        {isConnecting && <Spinner />}
      </button>
    );
  };

  const renderDesktopList = () => (
    <>
      <div className="max-h-[42vh] overflow-y-auto -mx-1 px-1">
        {installedRows.length > 0 && (
          <>
            <SectionTitle accent>Installed</SectionTitle>
            {installedRows.map(({ key, connector, wallet, walletId }) =>
              renderListRow({
                key,
                connector,
                wallet,
                walletId,
                name: connector.name,
                onClick: () => connectDetected(connector),
              })
            )}
          </>
        )}
        <SectionTitle>{installedRows.length > 0 ? 'Recommended' : 'Popular'}</SectionTitle>
        {recommendedRows.map(wallet =>
          renderListRow({
            key: wallet.id,
            wallet,
            walletId: wallet.id,
            name: wallet.name,
            onClick: () => connectCurated(wallet),
          })
        )}
        {legacyBrowserConnector && (
          <>
            <SectionTitle>Other</SectionTitle>
            {renderListRow({
              key: 'browser',
              connector: legacyBrowserConnector,
              walletId: legacyBrowserConnector.id,
              name: 'Browser Wallet',
              onClick: () => connectDetected(legacyBrowserConnector),
            })}
          </>
        )}
      </div>
      {children}
      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-white/10 text-sm">
        <span className="text-dark-100">New to Ethereum wallets?</span>
        <button className="font-bold text-orange-500 hover:underline" type="button" onClick={() => setView('what')}>
          Learn More
        </button>
      </div>
    </>
  );

  // ---- mobile list -------------------------------------------------------------

  const renderMobileList = () => {
    // Inside a wallet's in-app browser the injected provider is the wallet itself.
    const browserConnector = hasInjectedProvider() ? detectedConnectors[0] || injectedConnector : null;
    const tiles = [
      ...(browserConnector
        ? [
            {
              key: 'browser',
              label: 'Browser Wallet',
              wallet: matchEvmWallet(browserConnector),
              connector: browserConnector,
              onClick: () => connectDetected(browserConnector),
            },
          ]
        : []),
      ...MOBILE_WALLET_IDS.map(id => EVM_WALLETS[id])
        .filter(wallet => wallet.connect || wcConnector)
        .map(wallet => ({
          key: wallet.id,
          label: wallet.shortName || wallet.name,
          wallet,
          onClick: () => connectCurated(wallet),
        })),
    ];

    return (
      <>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {tiles.map(tile => (
            <button
              key={tile.key}
              className="flex flex-col items-center gap-2 w-[72px] shrink-0 disabled:opacity-50"
              disabled={disabled}
              type="button"
              onClick={tile.onClick}
            >
              {tile.key === 'browser' && !tile.wallet && !tile.connector?.icon ? (
                <span className="w-14 h-14 rounded-2xl bg-steel-750 flex items-center justify-center">
                  <WalletLucide className="w-7 h-7" />
                </span>
              ) : (
                <WalletLogo className="w-14 h-14" connector={tile.connector} wallet={tile.wallet} />
              )}
              <span className="text-xs text-center leading-tight">{tile.label}</span>
            </button>
          ))}
        </div>
        {children}
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <h4 className="font-bold mb-2">What is a Wallet?</h4>
          <p className="text-sm text-dark-100 mb-4">
            A wallet is used to send, receive, store, and display digital assets. It&apos;s also a new way to log in,
            without needing to create new accounts and passwords on every website.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="py-3 rounded-lg border border-white/10 font-bold text-sm text-orange-500 hover:bg-white/5"
              type="button"
              onClick={() => setView('get')}
            >
              Get a Wallet
            </button>
            <a
              className="py-3 rounded-lg border border-white/10 font-bold text-sm text-orange-500 hover:bg-white/5"
              href={WALLET_LEARN_MORE_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn More
            </a>
          </div>
        </div>
      </>
    );
  };

  // ---- shared sub-views --------------------------------------------------------

  const renderWhatIsAWallet = () => (
    <>
      <SubHeader title="What is a Wallet?" onBack={backToList} />
      <div className="space-y-6 py-4">
        <div className="flex gap-4">
          <span className="w-12 h-12 rounded-xl bg-steel-750 flex items-center justify-center shrink-0">
            <WalletLucide className="w-6 h-6 text-orange-500" />
          </span>
          <div>
            <div className="font-bold mb-1">A Home for your Digital Assets</div>
            <p className="text-sm text-dark-100">
              Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="w-12 h-12 rounded-xl bg-steel-750 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6 text-orange-500" />
          </span>
          <div>
            <div className="font-bold mb-1">A New Way to Log In</div>
            <p className="text-sm text-dark-100">
              Instead of creating new accounts and passwords on every website, just connect your wallet.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 pt-2">
        <PrimaryButton size="sm" onClick={() => setView('get')}>
          Get a Wallet
        </PrimaryButton>
        <a
          className="font-bold text-sm text-orange-500 hover:underline"
          href={WALLET_LEARN_MORE_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Learn More
        </a>
      </div>
    </>
  );

  const renderGetAWallet = () => (
    <>
      <SubHeader title="Get a Wallet" onBack={() => setView(isMobile ? 'list' : 'what')} />
      <div className="space-y-1">
        {GET_WALLET_IDS.map(id => EVM_WALLETS[id]).map(wallet => (
          <div key={wallet.id} className="flex items-center gap-3 p-2">
            <WalletLogo className="w-12 h-12" wallet={wallet} />
            <div className="flex-1 min-w-0">
              <div className="font-bold">{wallet.name}</div>
              <div className="text-sm text-dark-100">{wallet.kind}</div>
            </div>
            <a
              className="px-3 py-1.5 rounded-lg bg-steel-750 font-bold text-sm text-orange-500 hover:bg-white/10"
              href={wallet.download}
              rel="noopener noreferrer"
              target="_blank"
            >
              GET
            </a>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        <div className="font-bold mb-1">Not what you&apos;re looking for?</div>
        <p className="text-sm text-dark-100">
          Select a wallet on the main screen to get started with a different wallet provider.
        </p>
      </div>
    </>
  );

  const copyUri = async () => {
    try {
      await navigator.clipboard.writeText(wcUri);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const renderQr = () => (
    <>
      <SubHeader title={`Scan with ${activeWallet?.name}`} onBack={backToList} />
      <div className="flex flex-col items-center">
        <div className="relative w-[280px] h-[280px] max-w-full rounded-2xl bg-white p-3 flex items-center justify-center">
          {qrDataUrl ? (
            <>
              <img alt="WalletConnect QR code" className="w-full h-full" src={qrDataUrl} />
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white p-1.5 rounded-xl">
                  <WalletLogo className="w-11 h-11" wallet={activeWallet} />
                </span>
              </span>
            </>
          ) : wcUriTimedOut ? (
            <WcStalledNotice dark />
          ) : (
            <Spinner />
          )}
        </div>
        <p className="text-sm text-dark-100 text-center mt-4 max-w-xs">
          {activeWallet?.id === 'walletconnect'
            ? 'Scan with any WalletConnect-compatible wallet on your phone.'
            : `Open ${activeWallet?.name} on your phone and scan this code to connect.`}
        </p>
        <button
          className="flex items-center gap-2 mt-3 text-sm font-bold text-orange-500 hover:underline disabled:opacity-50"
          disabled={!wcUri}
          type="button"
          onClick={copyUri}
        >
          <Copy className="w-4 h-4" /> Copy link
        </button>
        {activeWallet?.download && (
          <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-white/10 text-sm">
            <span className="text-dark-100">Don&apos;t have {activeWallet.name}?</span>
            <a
              className="px-3 py-1.5 rounded-lg bg-steel-750 font-bold text-orange-500 hover:bg-white/10"
              href={activeWallet.download}
              rel="noopener noreferrer"
              target="_blank"
            >
              GET
            </a>
          </div>
        )}
      </div>
    </>
  );

  // Mobile after tapping a WC wallet: we auto-redirect on display_uri, but browsers can
  // block a navigation that isn't tied to a tap — the button is the user-gesture fallback.
  const renderOpening = () => (
    <>
      <SubHeader title={activeWallet?.name} onBack={backToList} />
      <div className="flex flex-col items-center text-center py-4">
        <WalletLogo className="w-20 h-20" wallet={activeWallet} />
        <div className="font-bold mt-4">Opening {activeWallet?.name}…</div>
        <p className="text-sm text-dark-100 mt-1 max-w-xs">
          Confirm the connection in the app, then return here to sign in. The app will ask for one more signature.
        </p>
        {wcUri && activeWallet?.wcDeepLink ? (
          <PrimaryButton
            className="mt-6"
            size="sm"
            onClick={() => {
              window.location.href = activeWallet.wcDeepLink(wcUri);
            }}
          >
            Open {activeWallet.name}
          </PrimaryButton>
        ) : wcUriTimedOut ? (
          <WcStalledNotice />
        ) : (
          <div className="mt-6">
            <Spinner />
          </div>
        )}
        {activeWallet?.download && (
          <a
            className="mt-4 text-sm text-orange-500 hover:underline"
            href={activeWallet.download}
            rel="noopener noreferrer"
            target="_blank"
          >
            Don&apos;t have {activeWallet.name}? Get it
          </a>
        )}
      </div>
    </>
  );

  switch (view) {
    case 'what':
      return renderWhatIsAWallet();
    case 'get':
      return renderGetAWallet();
    case 'qr':
      return renderQr();
    case 'opening':
      return renderOpening();
    default:
      return isMobile ? renderMobileList() : renderDesktopList();
  }
};
