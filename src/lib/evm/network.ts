/**
 * Robinhood network the build targets ('mainnet' | 'testnet'), from VITE_ROBINHOOD_NETWORK.
 * Unset means mainnet. Every Robinhood-specific module reads it from here so links,
 * wallets and the explorer never disagree.
 */
export const ROBINHOOD_NETWORK: 'mainnet' | 'testnet' =
  String(import.meta.env.VITE_ROBINHOOD_NETWORK || 'mainnet').toLowerCase() === 'testnet' ? 'testnet' : 'mainnet';

export const IS_ROBINHOOD_TESTNET = ROBINHOOD_NETWORK === 'testnet';
