import { environments, NETWORK_TYPES } from '@/constants/core.constants.js';

export const CURRENT_NETWORK = import.meta.env.VITE_CARDANO_NETWORK;

export const IS_MAINNET = CURRENT_NETWORK === environments.MAINNET;
export const IS_PREPROD = CURRENT_NETWORK === environments.PREPROD;

// Vault creation whitelist for mainnet only
const VAULT_CREATOR_WHITELIST = new Set(
  import.meta.env.VITE_WALLET_WHITELIST?.split(',').filter((addr: string) => addr?.trim()) || []
);

const isMainnetAddress = (address: string) => address && address.startsWith('addr1');
const isTestnetAddress = (address: string) => address && address.startsWith('addr_test');

export const validateWalletNetwork = (address: string) => {
  if (!address) {
    return { isValid: true, networkType: null };
  }

  const isMainnet = isMainnetAddress(address);
  const isTestnet = isTestnetAddress(address);

  if (IS_PREPROD) {
    if (isMainnet) {
      return { isValid: false, networkType: NETWORK_TYPES.MAINNET_ON_TESTNET };
    }
    return { isValid: true, networkType: null };
  } else if (IS_MAINNET) {
    if (isTestnet) {
      return { isValid: false, networkType: NETWORK_TYPES.TESTNET_ON_MAINNET };
    }
  }

  return { isValid: true, networkType: null };
};

/**
 * Check if an address is authorized to create vaults on mainnet
 * On testnet, all addresses are allowed
 * @param address - Cardano wallet address
 * @returns true if address can create vaults, false otherwise
 */
export const canCreateVault = (address: string): boolean => {
  if (IS_PREPROD) {
    return true;
  }

  if (IS_MAINNET) {
    // If whitelist is empty, allow all (shouldn't happen in production)
    if (VAULT_CREATOR_WHITELIST.size === 0) {
      return true;
    }
    return VAULT_CREATOR_WHITELIST.has(address);
  }

  return true;
};
