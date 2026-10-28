import MetaMaskIcon from '@/icons/metamask.svg?react';
import CoinbaseIcon from '@/icons/coinbase.svg?react';
import TrustWalletIcon from '@/icons/trustwallet.svg?react';
import OkxIcon from '@/icons/okx.svg?react';
import BinanceIcon from '@/icons/binance.svg?react';
import WalletConnectIcon from '@/icons/walletconnect.svg?react';
// <img> (not svgr) — these logos carry gradient ids that collide when inlined twice.
import rainbowIconUrl from '@/icons/rainbow.svg?url';
import rabbyIconUrl from '@/icons/rabby.svg?url';
import phantomIconUrl from '@/icons/phantom.svg?url';
import uniswapIconUrl from '@/icons/uniswap.svg?url';

export const WALLET_LEARN_MORE_URL = 'https://ethereum.org/en/wallets/';

const RECENT_WALLET_KEY = 'l4va_evm_recent_wallet';
// Read by @walletconnect/sign-client: every later request (personal_sign) re-opens
// this app on mobile, so the user isn't left waiting on a backgrounded wallet.
const WC_DEEPLINK_CHOICE_KEY = 'WALLETCONNECT_DEEPLINK_CHOICE';

export const isAndroid = () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    // iPadOS reports itself as desktop Safari.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export const isMobileDevice = () => isAndroid() || isIOS();

// Wallet in-app browsers (MetaMask, Trust, Rainbow, …) inject window.ethereum.
export const hasInjectedProvider = () => typeof window !== 'undefined' && Boolean(window.ethereum);

/**
 * Curated EVM wallets, RainbowKit-style. `wcDeepLink` builds the mobile link that hands a
 * WalletConnect pairing uri to the native app; `wcDeepLinkBase` is what sign-client
 * reopens for later requests. Android gets the raw `wc:` uri (OS app chooser), like RainbowKit.
 * `connect: 'coinbase'` uses Coinbase's own SDK connector (popup / app handoff) instead of WC;
 * `connect: 'download'` wallets have no WalletConnect support: on desktop picking one opens its
 * download page (an installed extension shows up under "Installed" via EIP-6963 instead); on
 * mobile `inAppBrowserUrl` reopens this page inside the wallet's own browser, where it injects.
 */
export const EVM_WALLETS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    Icon: MetaMaskIcon,
    kind: 'Mobile Wallet and Extension',
    download: 'https://metamask.io/download/',
    // iOS ignores universal links (metamask.app.link) navigated from async code — the
    // pairing uri arrives after the tap — while a custom scheme still prompts "Open in MetaMask?".
    wcDeepLink: uri =>
      isIOS()
        ? `metamask://wc?uri=${encodeURIComponent(uri)}`
        : `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
    wcDeepLinkBase: isIOS() ? 'metamask://' : 'https://metamask.app.link',
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    shortName: 'Coinbase',
    Icon: CoinbaseIcon,
    kind: 'Mobile Wallet and Extension',
    download: 'https://www.coinbase.com/wallet/downloads',
    connect: 'coinbase',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    iconUrl: rainbowIconUrl,
    kind: 'Mobile Wallet and Extension',
    download: 'https://rainbow.me/download',
    wcDeepLink: uri => (isAndroid() ? uri : `rainbow://wc?uri=${encodeURIComponent(uri)}&connector=l4va`),
    wcDeepLinkBase: 'rainbow://',
  },
  rabby: {
    id: 'rabby',
    name: 'Rabby Wallet',
    shortName: 'Rabby',
    iconUrl: rabbyIconUrl,
    kind: 'Browser Extension',
    download: 'https://rabby.io/',
  },
  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    shortName: 'Trust',
    Icon: TrustWalletIcon,
    kind: 'Mobile Wallet and Extension',
    download: 'https://trustwallet.com/download',
    wcDeepLink: uri => `trust://wc?uri=${encodeURIComponent(uri)}`,
    wcDeepLinkBase: 'trust://',
  },
  okx: {
    id: 'okx',
    name: 'OKX Wallet',
    shortName: 'OKX',
    Icon: OkxIcon,
    kind: 'Mobile Wallet and Extension',
    download: 'https://www.okx.com/web3',
    wcDeepLink: uri => (isAndroid() ? uri : `okex://main/wc?uri=${encodeURIComponent(uri)}`),
    wcDeepLinkBase: 'okex://main',
  },
  binance: {
    id: 'binance',
    name: 'Binance Wallet',
    shortName: 'Binance',
    Icon: BinanceIcon,
    kind: 'Mobile Wallet and Extension',
    download: 'https://www.binance.com/en/web3wallet',
    wcDeepLink: uri => (isAndroid() ? uri : `bnc://app.binance.com/cedefi/wc?uri=${encodeURIComponent(uri)}`),
    wcDeepLinkBase: 'bnc://app.binance.com/cedefi',
  },
  uniswap: {
    id: 'uniswap',
    name: 'Uniswap Wallet',
    shortName: 'Uniswap',
    iconUrl: uniswapIconUrl,
    kind: 'Mobile Wallet and Extension',
    download: 'https://wallet.uniswap.org/',
    wcDeepLink: uri => `uniswap://wc?uri=${encodeURIComponent(uri)}`,
    wcDeepLinkBase: 'uniswap://',
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    iconUrl: phantomIconUrl,
    kind: 'Mobile Wallet and Extension',
    download: 'https://phantom.com/download',
    connect: 'download',
    inAppBrowserUrl: () =>
      `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`,
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    Icon: WalletConnectIcon,
    kind: 'Any WalletConnect wallet',
  },
};

// Desktop "Recommended" section, mobile icon row, and "Get a Wallet" list.
export const RECOMMENDED_WALLET_IDS = [
  'metamask',
  'coinbase',
  'rainbow',
  'rabby',
  'trust',
  'okx',
  'binance',
  'uniswap',
  'phantom',
];
export const MOBILE_WALLET_IDS = ['metamask', 'coinbase', 'rainbow', 'trust', 'phantom', 'okx', 'binance', 'uniswap'];
export const GET_WALLET_IDS = [
  'rabby',
  'metamask',
  'coinbase',
  'rainbow',
  'trust',
  'okx',
  'binance',
  'uniswap',
  'phantom',
];

/** Match a detected (EIP-6963) connector to a curated wallet, for its brand icon. */
export const matchEvmWallet = connector => {
  const rdns = connector?.id?.toLowerCase() || '';
  const name = connector?.name?.toLowerCase() || '';
  if (name.includes('flask')) return null; // keep Flask's own icon
  if (rdns === 'io.metamask' || name === 'metamask') return EVM_WALLETS.metamask;
  if (rdns.startsWith('com.coinbase') || name.includes('coinbase')) return EVM_WALLETS.coinbase;
  if (rdns === 'me.rainbow' || name === 'rainbow') return EVM_WALLETS.rainbow;
  if (rdns === 'io.rabby' || name.includes('rabby')) return EVM_WALLETS.rabby;
  if (rdns === 'com.trustwallet.app' || name.includes('trust')) return EVM_WALLETS.trust;
  if (rdns === 'com.okex.wallet' || name.includes('okx')) return EVM_WALLETS.okx;
  if (rdns.startsWith('com.binance') || name.includes('binance')) return EVM_WALLETS.binance;
  if (rdns === 'org.uniswap.app' || name.includes('uniswap')) return EVM_WALLETS.uniswap;
  if (rdns === 'app.phantom' || name === 'phantom') return EVM_WALLETS.phantom;
  return null;
};

export const getRecentWalletId = () => {
  try {
    return localStorage.getItem(RECENT_WALLET_KEY);
  } catch {
    return null;
  }
};

export const setRecentWalletId = id => {
  try {
    if (id) localStorage.setItem(RECENT_WALLET_KEY, id);
  } catch {
    // storage unavailable (private mode) — "Recent" is cosmetic
  }
};

export const setWalletConnectDeepLinkChoice = wallet => {
  try {
    if (wallet?.wcDeepLinkBase) {
      localStorage.setItem(WC_DEEPLINK_CHOICE_KEY, JSON.stringify({ href: wallet.wcDeepLinkBase, name: wallet.name }));
    } else {
      localStorage.removeItem(WC_DEEPLINK_CHOICE_KEY);
    }
  } catch {
    // storage unavailable — user switches to the wallet app manually
  }
};
