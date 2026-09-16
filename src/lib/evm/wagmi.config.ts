import { defineChain, type Chain } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// Robinhood Chain — Arbitrum L2 (EVM), mainnet launched 2026-07-01.
// Chain ID 4663 (mainnet) / 46630 (testnet). ETH is the native gas token.
// Active network is selected via VITE_ROBINHOOD_NETWORK ('mainnet' | 'testnet'),
// mirroring the Cardano VITE_CARDANO_NETWORK convention.
const ROBINHOOD_NETWORK = import.meta.env.VITE_ROBINHOOD_NETWORK || 'mainnet';
const IS_TESTNET = ROBINHOOD_NETWORK === 'testnet';

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
        'https://explorer.mainnet.chain.robinhood.com',
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
const connectors = [injected({ shimDisconnect: false }), coinbaseWallet({ appName: 'L4VA' })];

// Arc — Circle's EVM L1, USDC is the native gas token (18 decimals).
// Chain ID 5042 (mainnet) / 5042002 (testnet). Network via VITE_ARC_NETWORK.
const IS_ARC_TESTNET = (import.meta.env.VITE_ARC_NETWORK || 'testnet') === 'testnet';
const ARC_DEFAULTS = IS_ARC_TESTNET
  ? { id: 5042002, name: 'Arc Testnet', rpc: 'https://rpc.testnet.arc.io', explorer: 'https://explorer.testnet.arc.io' }
  : { id: 5042, name: 'Arc', rpc: 'https://rpc.mainnet.arc.io', explorer: 'https://explorer.arc.io' };

export const arcChain: Chain = defineChain({
  id: Number(import.meta.env.VITE_ARC_CHAIN_ID) || ARC_DEFAULTS.id,
  name: ARC_DEFAULTS.name,
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_ARC_RPC_URL || ARC_DEFAULTS.rpc] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: import.meta.env.VITE_ARC_EXPLORER_URL || ARC_DEFAULTS.explorer },
  },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
  },
  testnet: IS_ARC_TESTNET,
});

/** Active wagmi chain for each EVM network the user can select. */
export const evmChainByNetwork: Record<string, Chain> = {
  robinhood: robinhoodChain,
  arc: arcChain,
};

const chains = [
  robinhoodChain,
  ...(robinhoodUniswapChain.id !== robinhoodChain.id ? [robinhoodUniswapChain] : []),
  arcChain,
] as [Chain, ...Chain[]];

const transports: Record<number, ReturnType<typeof http>> = Object.fromEntries(
  chains.map(chain => [chain.id, http(chain.rpcUrls.default.http[0])])
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
});
