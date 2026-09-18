import { ChainType } from '@/utils/types';
import { IS_PREPROD } from '@/utils/networkValidation';

/**
 * Centralized blockchain explorer URL configuration
 * Supports Cardano and the EVM chains (Robinhood, Arc) with testnet/mainnet variants
 */

// Cardano uses VITE_CARDANO_NETWORK (IS_PREPROD). Each EVM chain has its own
// network env, so Arc/Robinhood explorers must not follow the Cardano flag.
const isDefaultTestnet = chainType => {
  if (chainType === ChainType.ARC) {
    return (import.meta.env.VITE_ARC_NETWORK || 'testnet') === 'testnet';
  }
  if (chainType === ChainType.ROBINHOOD) {
    return (import.meta.env.VITE_ROBINHOOD_NETWORK || 'mainnet') === 'testnet';
  }
  return IS_PREPROD;
};

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
  [ChainType.ARC]: {
    mainnet: {
      base: 'https://explorer.arc.io',
    },
    testnet: {
      base: 'https://explorer.testnet.arc.io',
    },
  },
};

const isEvmChainType = chainType => chainType === ChainType.ROBINHOOD || chainType === ChainType.ARC;

/**
 * Get the explorer configuration for a given chain and network
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {object} Explorer configuration
 */
const getExplorerConfig = (chainType = ChainType.CARDANO, isTestnet) => {
  const resolvedTestnet = isTestnet ?? isDefaultTestnet(chainType);
  const network = resolvedTestnet ? 'testnet' : 'mainnet';
  return EXPLORER_URLS[chainType]?.[network] || EXPLORER_URLS[ChainType.CARDANO][network];
};

/**
 * Get transaction explorer URL
 * @param {string} txHash - Transaction hash
 * @param {string} chainType - ChainType.CARDANO or ChainType.ROBINHOOD
 * @param {boolean} isTestnet - Whether to use testnet URLs
 * @returns {string} Transaction explorer URL
 */
export const getTransactionUrl = (txHash, chainType = ChainType.CARDANO, isTestnet) => {
  if (!txHash) return '';

  const config = getExplorerConfig(chainType, isTestnet);

  if (isEvmChainType(chainType)) {
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
export const getAddressUrl = (address, chainType = ChainType.CARDANO, isTestnet) => {
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
export const getPolicyUrl = (policyId, chainType, isTestnet) => {
  if (!policyId) return '';

  const isEvmContractAddress = /^0x[a-fA-F0-9]{40}$/.test(policyId);
  const resolvedChainType = chainType || (isEvmContractAddress ? ChainType.ROBINHOOD : ChainType.CARDANO);
  const resolvedTestnet = isTestnet ?? isDefaultTestnet(resolvedChainType);

  if (isEvmChainType(resolvedChainType)) {
    // EVM chain assets use contract addresses.
    return getTokenUrl(policyId, resolvedChainType, resolvedTestnet);
  }

  const config = getExplorerConfig(ChainType.CARDANO, resolvedTestnet);

  // Use pool.pm for mainnet, cardanoscan for testnet
  if (resolvedTestnet) {
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
export const getTokenUrl = (tokenId, chainType = ChainType.CARDANO, isTestnet) => {
  if (!tokenId) return '';

  const config = getExplorerConfig(chainType, isTestnet);

  if (isEvmChainType(chainType)) {
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
export const getBlockUrl = (blockId, chainType = ChainType.CARDANO, isTestnet) => {
  if (!blockId) return '';

  const config = getExplorerConfig(chainType, isTestnet);

  if (isEvmChainType(chainType)) {
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
