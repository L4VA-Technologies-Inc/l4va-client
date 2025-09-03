import { TapToolsApiProvider } from '../services/api/taptools';
import toast from 'react-hot-toast';

/**
 * Fetches and formats wallet assets from TapTools API
 * @param {Object} wallet - Wallet instance with handler and balanceAda
 * @param {Set} whitelistedPolicies - Set of whitelisted policy IDs (empty Set means all allowed)
 * @returns {Promise<Array>} Array of formatted assets
 */
export const fetchAndFormatWalletAssets = async (wallet, whitelistedPolicies = new Set()) => {
  try {
    const changeAddress = await wallet.handler.getChangeAddressBech32();
    const { data } = await TapToolsApiProvider.getWalletSummary(changeAddress);

    const formattedAssets = [];

    // Add ADA as a fungible token
    // Maybe we will remove this in the future
    const adaAsset = {
      id: 'lovelace',
      name: 'ADA',
      policyId: 'lovelace',
      quantity: wallet.balanceAda || 0,
      decimals: 6,
      type: 'ada',
      assetName: 'lovelace',
      image: '/assets/icons/ada.png',
    };

    if (whitelistedPolicies.size === 0 || whitelistedPolicies.has(adaAsset.policyId)) {
      formattedAssets.push(adaAsset);
    }

    if (data?.assets) {
      const otherAssets = data.assets
        .map(asset => {
          const isWhitelisted = whitelistedPolicies.size === 0 || whitelistedPolicies.has(asset.metadata?.policyId);

          if (!isWhitelisted) return null;

          if (asset.isNft) {
            return {
              id: asset.tokenId,
              name: asset.displayName || asset.name,
              policyId: asset.metadata.policyId,
              image: asset.metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '/placeholder.svg',
              description: asset.metadata.description,
              quantity: asset.quantity,
              type: 'NFT',
              assetName: asset.metadata.assetName,
              metadata: asset.metadata,
            };
          }
          if (asset.isFungibleToken) {
            return {
              id: asset.tokenId,
              name: asset.displayName || asset.name,
              policyId: asset.metadata.policyId,
              quantity: asset.quantity,
              decimals: asset.metadata.decimals,
              type: 'FT',
              assetName: asset.metadata.assetName,
              metadata: asset.metadata,
            };
          }
          return null;
        })
        .filter(Boolean);
      formattedAssets.push(...otherAssets);
    }

    return formattedAssets;
  } catch (err) {
    console.error('Error fetching wallet summary:', err);
    toast.error('Failed to load assets');
    return [];
  }
};

/**
 * Fetches and formats wallet assets without ADA (for whitelist purposes)
 * @param {Object} wallet - Wallet instance with handler and balanceAda
 * @param {Set} whitelistedPolicies - Set of whitelisted policy IDs (empty Set means all allowed)
 * @returns {Promise<Array>} Array of formatted assets without ADA
 */
export const fetchWalletAssetsForWhitelist = async (wallet, whitelistedPolicies = new Set()) => {
  try {
    const changeAddress = await wallet.handler.getChangeAddressBech32();
    const { data } = await TapToolsApiProvider.getWalletSummary(changeAddress);

    const formattedAssets = [];

    if (data?.assets) {
      const otherAssets = data.assets
        .map(asset => {
          const isWhitelisted = whitelistedPolicies.size === 0 || whitelistedPolicies.has(asset.metadata?.policyId);

          if (!isWhitelisted) return null;

          if (asset.isNft) {
            return {
              id: asset.tokenId,
              name: asset.displayName || asset.name,
              policyId: asset.metadata.policyId,
              image: asset.metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '/placeholder.svg',
              description: asset.metadata.description,
              quantity: asset.quantity,
              type: 'NFT',
              assetName: asset.metadata.assetName,
              metadata: asset.metadata,
            };
          }
          if (asset.isFungibleToken) {
            return {
              id: asset.tokenId,
              name: asset.displayName || asset.name,
              policyId: asset.metadata.policyId,
              quantity: asset.quantity,
              decimals: asset.metadata.decimals,
              type: 'FT',
              assetName: asset.metadata.assetName,
              metadata: asset.metadata,
            };
          }
          return null;
        })
        .filter(Boolean);
      formattedAssets.push(...otherAssets);
    }

    return formattedAssets;
  } catch (err) {
    console.error('Error fetching wallet summary:', err);
    toast.error('Failed to load assets');
    return [];
  }
};

/**
 * Extracts unique policy IDs from wallet assets
 * @param {Array} assets - Array of formatted assets
 * @returns {Array} Array of unique policy IDs with asset names
 */
export const extractPolicyIds = (assets) => {
  const policyMap = new Map();
  
  assets.forEach(asset => {
    if (asset.policyId && !policyMap.has(asset.policyId)) {
      policyMap.set(asset.policyId, {
        policyId: asset.policyId,
        name: asset.name,
        type: asset.type,
        image: asset.image
      });
    }
  });
  
  return Array.from(policyMap.values());
};
