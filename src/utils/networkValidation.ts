import { environments, NETWORK_TYPES } from '@/constants/core.constants.js';

const environment = import.meta.env.VITE_CARDANO_NETWORK;
const MAINNET_WALLET_WHITELIST = new Set(
  import.meta.env.VITE_WALLET_WHITELIST?.split(',').filter((addr: string) => addr) || []
);

const isMainnetAddress = (address: string) => address && address.startsWith('addr1');
const isTestnetAddress = (address: string) => address && address.startsWith('addr_test');

export const validateWalletNetwork = (address: string) => {
  if (!address) {
    return { isValid: true, networkType: null };
  }

  const isMainnet = isMainnetAddress(address);
  const isTestnet = isTestnetAddress(address);

  if (environment === environments.PREPROD) {
    if (isMainnet) {
      return { isValid: false, networkType: NETWORK_TYPES.MAINNET_ON_TESTNET };
    }
    return { isValid: true, networkType: null };
  } else if (environment === environments.MAINNET) {
    if (isTestnet) {
      return { isValid: false, networkType: NETWORK_TYPES.TESTNET_ON_MAINNET };
    }

    if (isMainnet) {
      const addressToCheck = address;

      if (MAINNET_WALLET_WHITELIST.size > 0 && !MAINNET_WALLET_WHITELIST.has(addressToCheck)) {
        return { isValid: false, networkType: NETWORK_TYPES.WALLET_NOT_WHITELISTED };
      }
    }
    return { isValid: true, networkType: null };
  }

  return { isValid: true, networkType: null };
};
