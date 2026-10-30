import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react';
import { defineChain as defineAppKitChain, type AppKitNetwork } from '@reown/appkit/networks';
import { defineChain, type Chain } from 'viem';
import { http } from 'wagmi';

import { IS_ROBINHOOD_TESTNET } from '@/lib/evm/network';

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

// Wallet connection (wallet list, EIP-6963, WalletConnect QR / mobile deep links, Coinbase)
// is Reown AppKit's modal. The adapter builds the wagmi config, so every wagmi hook in the
// app keeps working unchanged. WalletConnect needs a real Reown Cloud project id, and the
// app's domains must be in that project's allowlist.
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!walletConnectProjectId) {
  console.error('VITE_WALLETCONNECT_PROJECT_ID is not set — wallet connection will not work');
}

const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.l4va.org';

const toAppKitNetwork = (chain: Chain): AppKitNetwork =>
  defineAppKitChain({
    ...chain,
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${chain.id}`,
  } as Parameters<typeof defineAppKitChain>[0]);

const networks: [AppKitNetwork, ...AppKitNetwork[]] =
  robinhoodChain.id === robinhoodUniswapChain.id
    ? [toAppKitNetwork(robinhoodChain)]
    : [toAppKitNetwork(robinhoodChain), toAppKitNetwork(robinhoodUniswapChain)];

const transports: Record<number, ReturnType<typeof http>> = {
  [robinhoodChain.id]: http(robinhoodChain.rpcUrls.default.http[0]),
};
if (robinhoodUniswapChain.id !== robinhoodChain.id) {
  transports[robinhoodUniswapChain.id] = http(robinhoodUniswapChain.rpcUrls.default.http[0]);
}

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId: walletConnectProjectId,
  transports,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: networks[0],
  projectId: walletConnectProjectId,
  metadata: {
    name: 'L4VA',
    description: 'L4VA vaults',
    url: appOrigin,
    icons: [`${appOrigin}/favicon/apple-touch-icon-rh.png`],
  },
  // Terms acceptance lives in AppKit's legal checkbox — the login opens AppKit directly.
  termsConditionsUrl: `${appOrigin}/terms-of-service`,
  privacyPolicyUrl: `${appOrigin}/privacy-policy`,
  // Wallets only: sign-in is our own backend challenge (LoginModal), not Reown accounts.
  features: {
    legalCheckbox: true,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
    send: false,
    receive: false,
    history: false,
    analytics: false,
  },
  themeMode: 'dark',
  // Accent = Robinhood --color-primary (css/index.css).
  themeVariables: { '--w3m-accent': '#00C805', '--w3m-z-index': 1000 },
});
