import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { useWalletSummaryPaginated } from '@/services/api/queries';

// Define the asset type based on your backend AssetValueDto
interface WalletAsset {
  tokenId: string;
  name: string;
  displayName?: string;
  ticker?: string;
  quantity: number;
  isNft: boolean;
  isFungibleToken: boolean;
  priceAda: number;
  priceUsd: number;
  valueAda: number;
  valueUsd: number;
  metadata?: {
    policyId: string;
    fingerprint?: string;
    decimals?: number;
    description?: string;
    image?: string;
    assetName?: string;
    mintTx?: string;
    mintQuantity?: string;
    onchainMetadata?: Record<string, any>;
    mediaType?: string;
    files?: Array<{
      mediaType?: string;
      name?: string;
      src?: string;
    }>;
    attributes?: Record<string, any>;
    fallback?: boolean;
  };
}

interface WalletOverview {
  wallet: string;
  totalValueAda: number;
  totalValueUsd: number;
  lastUpdated: string;
  summary: {
    totalAssets: number;
    nfts: number;
    tokens: number;
    ada: number;
  };
}

export const useInfiniteWalletAssets = ({
  walletAddress,
  activeTab,
  filter = 'all',
  pageSize = 20,
  whitelistedPolicies,
}: {
  walletAddress: string;
  activeTab: 'NFT' | 'FT' | 'ALL';
  filter?: 'all' | 'nfts' | 'tokens';
  pageSize?: number;
  whitelistedPolicies?: string[];
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allAssets, setAllAssets] = useState<WalletAsset[]>([]);
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const loadedPages = useRef(new Set<number>());

  // Use the hook for the current page
  const { data, isLoading, error, refetch } = useWalletSummaryPaginated({
    address: walletAddress,
    page: currentPage,
    limit: pageSize,
    filter,
    whitelistedPolicies,
  });

  // Reset when dependencies change
  useEffect(() => {
    setCurrentPage(1);
    setAllAssets([]);
    setOverview(null);
    setHasNextPage(false);
    loadedPages.current.clear();
  }, [walletAddress, filter, pageSize]);

  // Handle new data from the hook
  useEffect(() => {
    if (data?.data && !loadedPages.current.has(currentPage)) {
      loadedPages.current.add(currentPage);

      if (currentPage === 1) {
        // First page - replace all data
        setAllAssets(data.data.assets || []);
        setOverview(data.data.overview);
      } else {
        // Subsequent pages - append data
        setAllAssets(prev => [...prev, ...(data.data.assets || [])]);
      }

      setHasNextPage(data.data.pagination?.hasNextPage || false);
    }
  }, [data, currentPage]);

  const loadMoreAssets = useCallback(() => {
    if (hasNextPage && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage, isLoading]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setAllAssets([]);
    setOverview(null);
    setHasNextPage(false);
    loadedPages.current.clear();
    refetch();
  }, [refetch]);

  const filteredAssets = useMemo(() => {
    if (!allAssets.length) return [];

    return allAssets.filter(asset => {
      if (activeTab === 'NFT') {
        return asset.isNft;
      } else if (activeTab === 'FT') {
        return asset.isFungibleToken;
      }
      return true;
    });
  }, [allAssets, activeTab]);

  return {
    assets: filteredAssets,
    overview,
    isLoading: isLoading && currentPage === 1,
    isLoadingMore: isLoading && currentPage > 1,
    hasNextPage,
    error: error?.message || null,
    loadMoreAssets,
    refresh,
  };
};
