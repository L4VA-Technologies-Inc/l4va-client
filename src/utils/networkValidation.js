import { environments, NETWORK_TYPES, WALLET_WHITELIST } from '@/constants/core.constants.js';

const isMainnetAddress = address => address && address.startsWith('addr1');

const isTestnetAddress = address => address && address.startsWith('addr_test');

export const validateWalletNetwork = (address, environment, changeAddress = null) => {
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
      const addressToCheck = changeAddress || address;

      if (WALLET_WHITELIST.length > 0 && !WALLET_WHITELIST.includes(addressToCheck)) {
        return { isValid: false, networkType: NETWORK_TYPES.WALLET_NOT_WHITELISTED };
      }
    }

    return { isValid: true, networkType: null };
  }

  return { isValid: true, networkType: null };
};
