import { ChainType } from '@/utils/types';
import { IS_PREPROD } from '@/utils/networkValidation';

/**
 * Centralized blockchain explorer URL configuration
 * Supports both Cardano and Robinhood chains with testnet/mainnet variants
 */

const EXPLORER_URLS = {
  [ChainType.CARDANO]: {
    mainnet: {
      base: 'https://cardanoscan.io',
      poolPm: 'https://pool.pm',
    },
    testnet: {
      base: 'https://preprod.cardanoscan.io',
      poolPm: 'https://preprod.pool.pm',
    },
  },
  [ChainType.ROBINHOOD]: {
    mainnet: {
      base: 'https://robinhoodchain.blockscout.com',
    },
    testnet: {
      base: 'https://explorer.testnet.chain.robinhood.com',
    },
  },
};

/**
 * Get the explorer configuration for a given chain and network
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {object} Explorer configuration
 */
const getExplorerConfig = (chainType = ChainType.CARDANO, isTestnet = IS_PREPROD) => {
  const network = isTestnet ? 'testnet' : 'mainnet';
  return EXPLORER_URLS[chainType]?.[network] || EXPLORER_URLS[ChainType.CARDANO][network];
};

/**
 * Get transaction explorer URL
 * @param {string} txHash - Transaction hash
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {string} Transaction explorer URL
 */
export const getTransactionUrl = (txHash, chainType = ChainType.CARDANO, isTestnet = IS_PREPROD) => {
  if (!txHash) return '';

  const config = getExplorerConfig(chainType, isTestnet);

  if (chainType === ChainType.ROBINHOOD) {
    return `${config.base}/tx/${txHash}`;
  }

  // Cardano
  return `${config.base}/transaction/${txHash}`;
};

/**
 * Get address explorer URL
 * @param {string} address - Wallet address
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {string} Address explorer URL
 */
export const getAddressUrl = (address, chainType = ChainType.CARDANO, isTestnet = IS_PREPROD) => {
  if (!address) return '';

  const config = getExplorerConfig(chainType, isTestnet);
  return `${config.base}/address/${address}`;
};

/**
 * Get policy/contract explorer URL
 * @param {string} policyId - Policy ID
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {string} Policy/contract explorer URL
 */
export const getPolicyUrl = (policyId, chainType, isTestnet = IS_PREPROD) => {
  if (!policyId) return '';

  const isEvmContractAddress = /^0x[a-fA-F0-9]{40}$/.test(policyId);
  const resolvedChainType = chainType || (isEvmContractAddress ? ChainType.ROBINHOOD : ChainType.CARDANO);

  if (resolvedChainType === ChainType.ROBINHOOD) {
    // Robinhood Chain assets use EVM contract addresses.
    return getTokenUrl(policyId, resolvedChainType, isTestnet);
  }

  const config = getExplorerConfig(ChainType.CARDANO, isTestnet);

  // Use pool.pm for mainnet, cardanoscan for testnet
  if (isTestnet) {
    return `${config.base}/tokenPolicy/${policyId}`;
  }

  return `${config.poolPm}/policy/${policyId}`;
};

/**
 * Get token explorer URL
 * @param {string} tokenId - Token identifier (policy.assetName for Cardano, contract address for RH)
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {string} Token explorer URL
 */
export const getTokenUrl = (tokenId, chainType = ChainType.CARDANO, isTestnet = IS_PREPROD) => {
  if (!tokenId) return '';

  const config = getExplorerConfig(chainType, isTestnet);

  if (chainType === ChainType.ROBINHOOD) {
    return `${config.base}/token/${tokenId}`;
  }

  // Cardano
  return `${config.base}/token/${tokenId}`;
};

/**
 * Get block explorer URL
 * @param {string|number} blockId - Block number or hash
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {string} Block explorer URL
 */
export const getBlockUrl = (blockId, chainType = ChainType.CARDANO, isTestnet = IS_PREPROD) => {
  if (!blockId) return '';

  const config = getExplorerConfig(chainType, isTestnet);

  if (chainType === ChainType.ROBINHOOD) {
    return `${config.base}/block/${blockId}`;
  }

  // Cardano
  return `${config.base}/block/${blockId}`;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getPolicyUrl instead
 */
export const getPolicyExplorerUrl = getPolicyUrl;
