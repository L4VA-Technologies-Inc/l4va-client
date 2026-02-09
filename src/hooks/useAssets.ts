import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { VaultsApiProvider } from '@/services/api/vaults';

export interface WalletAsset {
  id: string;
  policyId: string;
  name: string;
  assetNameHex: string;
  quantity: number;
}

export interface GroupedPolicy {
  policyId: string;
  name: string;
  count: number;
  collectionName: string | null;
}

const PAGE_SIZE = 10;

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

const groupAssetsByPolicy = (assets: WalletAsset[]): Omit<GroupedPolicy, 'collectionName'>[] => {
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
  const { balanceDecoded } = useWallet('balanceDecoded', 'isConnected');

  const [visiblePolicies, setVisiblePolicies] = useState<GroupedPolicy[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const allGroupedRef = useRef<Omit<GroupedPolicy, 'collectionName'>[]>([]);
  const collectionNamesCache = useRef<Map<string, string | null>>(new Map());
  const currentPageRef = useRef(0);
  const prevBalanceRef = useRef<any>(null);

  const allAssets = balanceDecoded ? parseBalanceToAssets(balanceDecoded) : [];
  const allGrouped = groupAssetsByPolicy(allAssets);

  // Reset when balance changes
  if (balanceDecoded !== prevBalanceRef.current) {
    prevBalanceRef.current = balanceDecoded;
    allGroupedRef.current = allGrouped;
    currentPageRef.current = 0;
  } else {
    allGroupedRef.current = allGrouped;
  }

  const fetchCollectionNames = useCallback(async (policyIds: string[]): Promise<Map<string, string | null>> => {
    const uncachedIds = policyIds.filter(id => !collectionNamesCache.current.has(id));

    if (uncachedIds.length > 0) {
      try {
        const response = await VaultsApiProvider.getCollectionNames(uncachedIds);
        const items: { policyId: string; collectionName: string | null }[] = response.data;
        items.forEach(item => {
          collectionNamesCache.current.set(item.policyId, item.collectionName);
        });
      } catch (error) {
        console.error('Error fetching collection names:', error);
        uncachedIds.forEach(id => {
          collectionNamesCache.current.set(id, null);
        });
      }
    }

    const result = new Map<string, string | null>();
    policyIds.forEach(id => {
      result.set(id, collectionNamesCache.current.get(id) ?? null);
    });
    return result;
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      const grouped = allGroupedRef.current;
      const start = 0;
      const end = (page + 1) * PAGE_SIZE;
      const slice = grouped.slice(start, end);

      const policyIds = slice.map(p => p.policyId);
      const namesMap = await fetchCollectionNames(policyIds);

      const withNames: GroupedPolicy[] = slice.map(p => ({
        ...p,
        collectionName: namesMap.get(p.policyId) ?? null,
      }));

      setVisiblePolicies(withNames);
      setHasMore(end < grouped.length);
    },
    [fetchCollectionNames]
  );

  // Load initial page when balance arrives
  useEffect(() => {
    if (!balanceDecoded) {
      setVisiblePolicies([]);
      setHasMore(false);
      return;
    }

    currentPageRef.current = 0;
    loadPage(0);
  }, [balanceDecoded, loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPageRef.current + 1;
      currentPageRef.current = nextPage;
      await loadPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, loadPage]);

  const searchPolicies = useCallback(
    async (query: string): Promise<GroupedPolicy[]> => {
      const allGrouped = allGroupedRef.current;
      if (!query) return [];

      const search = query.toLowerCase();

      // First: filter by name / policyId (local data we always have)
      const localMatches = allGrouped.filter(
        p => p.name.toLowerCase().includes(search) || p.policyId.toLowerCase().includes(search)
      );

      // Fetch collection names for matched policies
      const matchedIds = localMatches.map(p => p.policyId);
      const namesMap = await fetchCollectionNames(matchedIds);

      const withNames: GroupedPolicy[] = localMatches.map(p => ({
        ...p,
        collectionName: namesMap.get(p.policyId) ?? null,
      }));

      // Also include policies whose collectionName matches the search
      // (they might not match by name/policyId but do match by collectionName)
      const localMatchIds = new Set(matchedIds);
      const remaining = allGrouped.filter(p => !localMatchIds.has(p.policyId));

      if (remaining.length > 0) {
        const remainingIds = remaining.map(p => p.policyId);
        const remainingNamesMap = await fetchCollectionNames(remainingIds);

        remaining.forEach(p => {
          const collectionName = remainingNamesMap.get(p.policyId) ?? null;
          if (collectionName && collectionName.toLowerCase().includes(search)) {
            withNames.push({ ...p, collectionName });
          }
        });
      }

      return withNames;
    },
    [fetchCollectionNames]
  );

  if (!balanceDecoded) {
    return {
      data: { data: [] },
      assets: [],
      isLoading: false,
      hasMore: false,
      isLoadingMore: false,
      loadMore: () => {},
      searchPolicies: async () => [],
    };
  }

  return {
    data: {
      data: visiblePolicies,
    },
    assets: allAssets,
    isLoading: false,
    hasMore,
    isLoadingMore,
    loadMore,
    searchPolicies,
  };
};
