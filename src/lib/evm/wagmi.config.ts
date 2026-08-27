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
      http: [
        import.meta.env.VITE_ROBINHOOD_RPC_URL || 'https://rpc.testnet.chain.robinhood.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url:
        import.meta.env.VITE_ROBINHOOD_BLOCKSCOUT_URL ||
        'https://explorer.testnet.chain.robinhood.com',
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
          http: [
            import.meta.env.VITE_ROBINHOOD_RPC_URL ||
              robinhoodUniswapChain.rpcUrls.default.http[0],
          ],
        },
      },
      blockExplorers: {
        default: {
          name: 'Blockscout',
          url:
            import.meta.env.VITE_ROBINHOOD_BLOCKSCOUT_URL ||
            robinhoodUniswapChain.blockExplorers.default.url,
        },
      },
    });

// shimDisconnect defaults to true in wagmi v3 and forces wallet_requestPermissions
// on every connect. MetaMask Flask frequently leaves that RPC hanging
// ("already pending" / "Unknown response id") — disable it and rely on
// eth_requestAccounts instead.
const connectors = [
  injected({ shimDisconnect: false }),
  coinbaseWallet({ appName: 'L4VA' }),
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
