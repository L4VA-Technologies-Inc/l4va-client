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

/**
 * Check if the whitelist removal time has passed
 * Beginning on Monday March 30th @ 12pm PDT, all addresses can create vaults
 * @returns true if we're past the removal time (whitelist is no longer enforced)
 */
const isWhitelistRemovalTimeReached = (): boolean => {
  const now = new Date().getTime();
  const removeWhitelistAfter = new Date('2026-03-30T12:00:00-07:00').getTime();
  return now > removeWhitelistAfter;
};

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
 * After March 30, 2026 @ 12pm PDT, all addresses are allowed on mainnet
 * @param address - Cardano wallet address
 * @returns true if address can create vaults, false otherwise
 */
export const canCreateVault = (address: string): boolean => {
  if (IS_PREPROD) {
    return true;
  }

  if (IS_MAINNET) {
    // After whitelist removal time, allow all addresses
    if (isWhitelistRemovalTimeReached()) {
      return true;
    }

    // If whitelist is empty, allow all (shouldn't happen before removal time)
    if (VAULT_CREATOR_WHITELIST.size === 0) {
      return true;
    }
    return VAULT_CREATOR_WHITELIST.has(address);
  }

  return true;
};
