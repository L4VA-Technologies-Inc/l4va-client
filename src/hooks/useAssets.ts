import { useMemo } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

export interface WalletAsset {
  id: string;
  policyId: string;
  name: string;
  assetNameHex: string;
  quantity: number;
}

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

const arrayToHex = (arr: number[]): string => {
  return arr.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

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

const groupAssetsByPolicy = (assets: WalletAsset[]) => {
  const grouped = new Map<string, { policyId: string; name: string; count: number }>();

  assets.forEach(asset => {
    if (grouped.has(asset.policyId)) {
      const existing = grouped.get(asset.policyId)!;
      existing.count += 1;
    } else {
      grouped.set(asset.policyId, {
        policyId: asset.policyId,
        name: asset.name,
        count: 1,
      });
    }
  });

  return Array.from(grouped.values());
};

export const useAssets = () => {
  const balanceDecoded = useWallet('balanceDecoded');

  const assets = useMemo(() => {
    if (!balanceDecoded) {
      return [];
    };

    return parseBalanceToAssets(balanceDecoded);
  }, [balanceDecoded]);

  const groupedPolicies = useMemo(() => groupAssetsByPolicy(assets), [assets]);

  return {
    data: {
      data: groupedPolicies,
    },
    assets,
    isLoading: false,
  };
};