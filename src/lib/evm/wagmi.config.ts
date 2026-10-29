import { defineChain, type Chain } from 'viem';
import { createConfig, createConnector, http } from 'wagmi';
import { injected, coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

import { IS_ROBINHOOD_TESTNET } from '@/lib/evm/network';
import { isMobileDevice } from '@/lib/evm/walletRegistry';

// Robinhood Chain — Arbitrum L2 (EVM), mainnet launched 2026-07-01.
// Chain ID 4663 (mainnet) / 46630 (testnet). ETH is the native gas token.
// Active network is selected via VITE_ROBINHOOD_NETWORK ('mainnet' | 'testnet'),
// mirroring the Cardano VITE_CARDANO_NETWORK convention.
const IS_TESTNET = IS_ROBINHOOD_TESTNET;

/** Uniswap Trading API + token markets target Robinhood mainnet. */
export const robinhoodUniswapChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_ROBINHOOD_MAINNET_RPC_URL ||
          import.meta.env.VITE_ROBINHOOD_RPC_URL ||
          'https://rpc.mainnet.chain.robinhood.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url:
        import.meta.env.VITE_ROBINHOOD_MAINNET_BLOCKSCOUT_URL ||
        import.meta.env.VITE_ROBINHOOD_BLOCKSCOUT_URL ||
        'https://robinhoodchain.blockscout.com',
    },
  },
});

const robinhoodTestnet = defineChain({
  id: Number(import.meta.env.VITE_ROBINHOOD_CHAIN_ID) || 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_ROBINHOOD_RPC_URL || 'https://rpc.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: import.meta.env.VITE_ROBINHOOD_BLOCKSCOUT_URL || 'https://explorer.testnet.chain.robinhood.com',
    },
  },
});

/** Active app chain (login / vaults) — from VITE_ROBINHOOD_*. */
export const robinhoodChain: Chain = IS_TESTNET
  ? robinhoodTestnet
  : defineChain({
      ...robinhoodUniswapChain,
      id: Number(import.meta.env.VITE_ROBINHOOD_CHAIN_ID) || robinhoodUniswapChain.id,
      rpcUrls: {
        default: {
          http: [import.meta.env.VITE_ROBINHOOD_RPC_URL || robinhoodUniswapChain.rpcUrls.default.http[0]],
        },
      },
      blockExplorers: {
        default: {
          name: 'Blockscout',
          url: import.meta.env.VITE_ROBINHOOD_BLOCKSCOUT_URL || robinhoodUniswapChain.blockExplorers.default.url,
        },
      },
    });

// shimDisconnect defaults to true in wagmi v3 and forces wallet_requestPermissions
// on every connect. MetaMask Flask frequently leaves that RPC hanging
// ("already pending" / "Unknown response id") — disable it and rely on
// eth_requestAccounts instead.
// WalletConnect (QR / deep link for mobile wallets) needs a real Cloud project id; a
// placeholder fails at the relay handshake, so it's only registered when one is set.
// The main connector has showQrModal off: LoginModal renders its own QR (desktop) and
// wallet deep links (mobile) from the connector's `display_uri` message. On mobile a second
// one ("walletConnectModal") opens the official WalletConnect modal for the generic
// WalletConnect tile — same split as RainbowKit.
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const hasWalletConnect = Boolean(walletConnectProjectId) && walletConnectProjectId !== 'your_project_id_here';

const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://l4va.io';

// Mobile MetaMask goes through MetaMask's own SDK (app handoff + request deep links), as
// RainbowKit does — MetaMask mobile over plain WalletConnect is unreliable. Mobile-only:
// the connector claims rdns io.metamask, which would hide the desktop extension's
// EIP-6963 entry from the "Installed" list.
const isMobile = typeof window !== 'undefined' && isMobileDevice();

const walletConnectMetadata = {
  name: 'L4VA',
  description: 'L4VA vaults',
  url: appOrigin,
  icons: [`${appOrigin}/favicon/apple-touch-icon-rh.png`],
};

const walletConnectModal = createConnector(config => ({
  ...walletConnect({
    projectId: walletConnectProjectId,
    showQrModal: true,
    metadata: walletConnectMetadata,
    // Separate session storage so the two WalletConnect connectors don't restore each
    // other's sessions (supported by the provider, missing from wagmi's types).
    ...({ customStoragePrefix: 'l4va-wc-modal' } as object),
  })(config),
  id: 'walletConnectModal',
  name: 'WalletConnect',
}));

const connectors = [
  injected({ shimDisconnect: false }),
  coinbaseWallet({ appName: 'L4VA' }),
  ...(isMobile
    ? [metaMask({ dapp: { name: 'L4VA', url: appOrigin, iconUrl: `${appOrigin}/favicon/apple-touch-icon-rh.png` } })]
    : []),
  ...(hasWalletConnect
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: false,
          metadata: walletConnectMetadata,
        }),
        ...(isMobile ? [walletConnectModal] : []),
      ]
    : []),
];

const chains =
  robinhoodChain.id === robinhoodUniswapChain.id
    ? ([robinhoodChain] as const)
    : ([robinhoodChain, robinhoodUniswapChain] as const);

const transports: Record<number, ReturnType<typeof http>> = {
  [robinhoodChain.id]: http(robinhoodChain.rpcUrls.default.http[0]),
};
if (robinhoodUniswapChain.id !== robinhoodChain.id) {
  transports[robinhoodUniswapChain.id] = http(robinhoodUniswapChain.rpcUrls.default.http[0]);
}

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
});
