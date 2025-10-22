import { useMemo, useState, useEffect } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

export interface WalletAsset {
  id: string;
  policyId: string;
  name: string;
  assetNameHex: string;
  quantity: number;
  image?: string;
  metadata?: any;
}

// Функція для декодування hex в UTF-8 string
const hexToString = (hex: string): string => {
  try {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      if (charCode > 0) {
        str += String.fromCharCode(charCode);
      }
    }
    return str || hex;
  } catch {
    return hex;
  }
};

// Конвертуємо array ключів в hex string
const arrayToHex = (arr: number[]): string => {
  return arr.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

// Парсимо balanceDecoded в assets
const parseBalanceToAssets = (balance: any): WalletAsset[] => {
  try {
    const assets: WalletAsset[] = [];

    if (!Array.isArray(balance) || balance.length < 2) {
      return [];
    }

    const assetsObject = balance[1];

    if (!assetsObject || typeof assetsObject !== 'object') {
      return [];
    }

    Object.keys(assetsObject).forEach(policyIdKey => {
      const policyIdArray = policyIdKey.split(',').map(Number);
      const policyId = arrayToHex(policyIdArray);

      const policyAssets = assetsObject[policyIdKey];

      if (!policyAssets || typeof policyAssets !== 'object') {
        return;
      }

      Object.keys(policyAssets).forEach(assetNameKey => {
        const quantity = policyAssets[assetNameKey];
        
        const assetNameArray = assetNameKey.split(',').map(Number);
        const assetNameHex = arrayToHex(assetNameArray);
        const assetName = hexToString(assetNameHex);

        assets.push({
          id: `${policyId}_${assetNameHex}`,
          policyId,
          name: assetName,
          assetNameHex,
          quantity,
        });
      });
    });

    return assets;
  } catch (error) {
    console.error('Error parsing balance:', error);
    return [];
  }
};

// Отримуємо метадані через Blockfrost API
const fetchAssetMetadata = async (policyId: string, assetNameHex: string) => {
  try {
    const unit = `${policyId}${assetNameHex}`;
    
    // Використовуємо публічний Blockfrost API (mainnet)
    const response = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/assets/${unit}`,
      {
        headers: {
          'project_id': 'mainnetYOUR_PROJECT_ID_HERE', // Треба замінити на свій
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch metadata for ${unit}`);
      return null;
    }

    const data = await response.json();
    
    // Blockfrost повертає onchain_metadata
    const metadata = data.onchain_metadata;
    
    if (!metadata) {
      return null;
    }

    let imageUrl = metadata.image;
    
    // Обробляємо різні формати image
    if (imageUrl) {
      if (Array.isArray(imageUrl)) {
        imageUrl = imageUrl.join('');
      }
      
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      } else if (imageUrl.startsWith('ipfs/')) {
        imageUrl = `https://ipfs.io/ipfs/${imageUrl.replace('ipfs/', '')}`;
      }
    }
    
    return {
      ...metadata,
      image: imageUrl,
    };
  } catch (error) {
    console.error('Error fetching asset metadata:', error);
    return null;
  }
};

// Групуємо assets за policy ID
const groupAssetsByPolicy = (assets: WalletAsset[]) => {
  const grouped = new Map<string, { policyId: string; name: string; count: number; image?: string }>();

  assets.forEach(asset => {
    if (grouped.has(asset.policyId)) {
      const existing = grouped.get(asset.policyId)!;
      existing.count += 1;
    } else {
      grouped.set(asset.policyId, {
        policyId: asset.policyId,
        name: asset.name,
        count: 1,
        image: asset.image,
      });
    }
  });

  return Array.from(grouped.values());
};

export const useAssets = (shouldLoadMetadata = false) => {
  const balanceDecoded = useWallet('balanceDecoded');
  const [assetsWithMetadata, setAssetsWithMetadata] = useState<WalletAsset[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const assets = useMemo(() => {
    if (!balanceDecoded) {
      return [];
    }
    
    return parseBalanceToAssets(balanceDecoded);
  }, [balanceDecoded]);

  // Завантажуємо метадані якщо потрібно
  useEffect(() => {
    if (!shouldLoadMetadata || assets.length === 0) {
      setAssetsWithMetadata(assets);
      return;
    }

    const fetchMetadataForAssets = async () => {
      setIsLoadingMetadata(true);
      
      const assetsWithMeta = await Promise.all(
        assets.map(async (asset) => {
          const metadata = await fetchAssetMetadata(
            asset.policyId,
            asset.assetNameHex
          );
          
          return {
            ...asset,
            image: metadata?.image,
            metadata,
          };
        })
      );
      
      setAssetsWithMetadata(assetsWithMeta);
      setIsLoadingMetadata(false);
    };

    fetchMetadataForAssets();
  }, [assets, shouldLoadMetadata]);

  const finalAssets = shouldLoadMetadata ? assetsWithMetadata : assets;
  const groupedPolicies = useMemo(() => groupAssetsByPolicy(finalAssets), [finalAssets]);

  return {
    data: {
      data: groupedPolicies,
    },
    assets: finalAssets,
    isLoading: false,
    isLoadingMetadata,
  };
};
