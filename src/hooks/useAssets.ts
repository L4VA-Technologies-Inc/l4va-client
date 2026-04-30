import { useCallback, useEffect, useRef, useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { VaultsApiProvider } from '@/services/api/vaults';

/** Matches backend `VerificationPlatform` / token_verifications.platform */
export enum VerificationPlatform {
  DEXHUNTER = 'dexhunter',
  ADA_ANVIL = 'ada_anvil',
  TAPTOOLS = 'taptools',
  MANUAL = 'manual',
  JPG_STORE = 'jpg_store',
}

const VERIFICATION_PLATFORM_LABELS: Record<VerificationPlatform, string> = {
  [VerificationPlatform.DEXHUNTER]: 'DexHunter',
  [VerificationPlatform.ADA_ANVIL]: 'ADA Anvil',
  [VerificationPlatform.TAPTOOLS]: 'TapTools',
  [VerificationPlatform.MANUAL]: 'Manual',
  [VerificationPlatform.JPG_STORE]: 'JPG Store',
};

export function getVerificationPlatformLabel(platform: VerificationPlatform | null | undefined): string | null {
  if (platform == null) return null;
  return VERIFICATION_PLATFORM_LABELS[platform] ?? null;
}

function parseVerificationPlatform(raw: unknown): VerificationPlatform | null {
  if (typeof raw !== 'string') return null;
  const value = Object.values(VerificationPlatform).find(v => v === raw);
  return (value as VerificationPlatform | undefined) ?? null;
}

type CollectionLookupRaw = {
  policyId?: string;
  policy_id?: string;
  collectionName?: string | null;
  collection_name?: string | null;
  isVerified?: boolean;
  is_verified?: boolean;
  platform?: unknown;
  tokenVerification?: { platform?: unknown; is_verified?: boolean };
  isLpToken?: boolean;
  is_lp_token?: boolean;
};

function normalizeCollectionLookupItem(raw: CollectionLookupRaw): {
  policyId: string;
  collectionName: string | null;
  isVerified: boolean;
  verificationPlatform: VerificationPlatform | null;
  isLpToken: boolean;
} {
  const policyId = raw.policyId ?? raw.policy_id ?? '';
  const collectionName = raw.collectionName ?? raw.collection_name ?? null;
  const isVerified = raw.isVerified ?? raw.is_verified ?? false;
  const platformRaw = raw.platform ?? raw.tokenVerification?.platform;
  const verificationPlatform = isVerified ? parseVerificationPlatform(platformRaw) : null;
  const isLpToken = raw.isLpToken ?? raw.is_lp_token ?? false;
  return { policyId, collectionName, isVerified, verificationPlatform, isLpToken };
}

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
  assetName: string;
  count: number;
  collectionName: string | null;
  isVerified: boolean;
  /** Present when `isVerified` and API returned a platform */
  verificationPlatform: VerificationPlatform | null;
  /** Whether this is an LP token requiring dynamic pricing */
  isLpToken: boolean;
}

const PAGE_SIZE = 10;
const COLLECTION_BATCH_SIZE = 20;

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

type GroupedPolicyBase = Omit<GroupedPolicy, 'collectionName' | 'isVerified' | 'verificationPlatform'>;

/** Fingerprint of grouped wallet policies; invalidates search cache when IDs, counts, or labels change. */
function walletPolicySetKey(grouped: GroupedPolicyBase[]): string {
  if (grouped.length === 0) return '0';
  return grouped
    .map(p => `${p.policyId}\t${p.count}\t${p.name}\t${p.assetName}`)
    .sort()
    .join('\n');
}

const groupAssetsByPolicy = (assets: WalletAsset[]): GroupedPolicyBase[] => {
  const grouped = new Map<
    string,
    { policyId: string; name: string; assetName: string; count: number; isLpToken: boolean }
  >();

  assets.forEach(asset => {
    if (grouped.has(asset.policyId)) {
      const existing = grouped.get(asset.policyId)!;
      existing.count += 1;
    } else {
      grouped.set(asset.policyId, {
        policyId: asset.policyId,
        name: asset.name,
        assetName: asset.assetNameHex,
        count: 1,
        isLpToken: false,
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

  const allGroupedRef = useRef<GroupedPolicyBase[]>([]);
  const collectionNamesCache = useRef<
    Map<
      string,
      {
        collectionName: string | null;
        isVerified: boolean;
        verificationPlatform: VerificationPlatform | null;
        isLpToken: boolean;
      }
    >
  >(new Map());
  /** Serializes cache-miss fetches so parallel callers (Strict Mode, open + search) share one wave of HTTP requests */
  const fetchCollectionsQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  /** Full-wallet list with collection metadata; avoids re-hydrating on every debounced search keystroke */
  const searchHydratedRef = useRef<{ key: string; policies: GroupedPolicy[] } | null>(null);
  const currentPageRef = useRef(0);
  const prevBalanceRef = useRef<any>(null);

  const allAssets = balanceDecoded ? parseBalanceToAssets(balanceDecoded) : [];
  const allGrouped = groupAssetsByPolicy(allAssets);

  // Reset when balance changes
  if (balanceDecoded !== prevBalanceRef.current) {
    prevBalanceRef.current = balanceDecoded;
    allGroupedRef.current = allGrouped;
    currentPageRef.current = 0;
    searchHydratedRef.current = null;
  } else {
    allGroupedRef.current = allGrouped;
    if (searchHydratedRef.current && searchHydratedRef.current.key !== walletPolicySetKey(allGrouped)) {
      searchHydratedRef.current = null;
    }
  }

  const fetchCollections = useCallback((collections: GroupedPolicyBase[]): Promise<GroupedPolicy[]> => {
    const run = async (): Promise<GroupedPolicy[]> => {
      const uncachedCollections = collections.filter(policy => !collectionNamesCache.current.has(policy.policyId));

      if (uncachedCollections.length > 0) {
        // Process in batches to stay within the backend's 20-item limit per request
        for (let i = 0; i < uncachedCollections.length; i += COLLECTION_BATCH_SIZE) {
          const batch = uncachedCollections.slice(i, i + COLLECTION_BATCH_SIZE);
          try {
            const response = await VaultsApiProvider.getCollectionNames(batch);
            const payload = response.data;
            const items: CollectionLookupRaw[] = Array.isArray(payload) ? payload : (payload?.data ?? []);

            items.forEach(raw => {
              const normalized = normalizeCollectionLookupItem(raw);
              if (!normalized.policyId) return;
              collectionNamesCache.current.set(normalized.policyId, {
                collectionName: normalized.collectionName,
                isVerified: normalized.isVerified,
                verificationPlatform: normalized.verificationPlatform,
                isLpToken: normalized.isLpToken,
              });
            });
          } catch (error) {
            console.error('Error fetching collection names:', error);
            batch.forEach(collection => {
              collectionNamesCache.current.set(collection.policyId, {
                collectionName: null,
                isVerified: false,
                verificationPlatform: null,
                isLpToken: false,
              });
            });
          }
        }
      }

      return collections.map(policy => {
        const cached = collectionNamesCache.current.get(policy.policyId);
        return {
          ...policy,
          collectionName: cached?.collectionName ?? null,
          isVerified: cached?.isVerified ?? false,
          verificationPlatform: cached?.verificationPlatform ?? null,
          isLpToken: cached?.isLpToken ?? false,
        };
      });
    };

    const next = fetchCollectionsQueueRef.current.then(() => run());
    fetchCollectionsQueueRef.current = next.catch(() => {});
    return next;
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      const grouped = allGroupedRef.current;
      const start = 0;
      const end = (page + 1) * PAGE_SIZE;
      const slice = grouped.slice(start, end);

      const collections = await fetchCollections(slice);

      setVisiblePolicies(collections);
      setHasMore(end < grouped.length);
    },
    [fetchCollections]
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
      const grouped = allGroupedRef.current;
      if (!query) return [];

      const search = query.toLowerCase();
      const snapshotKey = walletPolicySetKey(grouped);
      const cached = searchHydratedRef.current;

      let allWithNames: GroupedPolicy[];
      if (cached?.key === snapshotKey) {
        allWithNames = cached.policies;
      } else {
        allWithNames = await fetchCollections(grouped);
        let key = walletPolicySetKey(allGroupedRef.current);
        if (key !== snapshotKey) {
          allWithNames = await fetchCollections(allGroupedRef.current);
          key = walletPolicySetKey(allGroupedRef.current);
        }
        searchHydratedRef.current = { key, policies: allWithNames };
      }

      return allWithNames.filter(
        p =>
          p.assetName.toLowerCase().includes(search) ||
          p.policyId.toLowerCase().includes(search) ||
          Boolean(p.collectionName && p.collectionName.toLowerCase().includes(search))
      );
    },
    [fetchCollections]
  );

  // Batch-lookup for a list of policy IDs — makes a single fetchCollections call
  // instead of N parallel searchPolicies calls (which each fetch all wallet assets).
  const lookupPolicies = useCallback(
    async (policyIds: string[]): Promise<GroupedPolicy[]> => {
      if (policyIds.length === 0) return [];
      const items: GroupedPolicyBase[] = policyIds.map(id => {
        const existing = allGroupedRef.current.find(p => p.policyId === id);
        return existing ?? { policyId: id, name: '', assetName: '', count: 1, isLpToken: false };
      });
      return fetchCollections(items);
    },
    [fetchCollections]
  );

  if (!balanceDecoded) {
    return {
      data: { data: [] },
      assets: [],
      allPolicies: [] as GroupedPolicyBase[],
      isBalanceLoaded: false,
      isLoading: false,
      hasMore: false,
      isLoadingMore: false,
      loadMore: () => {},
      searchPolicies: async () => [],
      lookupPolicies: async () => [],
    };
  }

  return {
    data: {
      data: visiblePolicies,
    },
    assets: allAssets,
    // Full wallet policy list (all pages) — used to detect stale draft whitelist items
    allPolicies: allGrouped,
    isBalanceLoaded: true,
    isLoading: false,
    hasMore,
    isLoadingMore,
    loadMore,
    searchPolicies,
    lookupPolicies,
  };
};
