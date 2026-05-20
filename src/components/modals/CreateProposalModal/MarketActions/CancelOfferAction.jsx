import { useState, useMemo, useCallback, useEffect } from 'react';

import { AssetsList } from '@/components/modals/AssetsList/AssetsList.jsx';
import { useOffersToCancel } from '@/services/api/queries';

const MAX_NFT_PER_TRANSACTION = 10;
const PAGE_SIZE = 20;

const mapOfferToAsset = asset => {
  const imageSrc = asset.imageUrl;

  return {
    id: asset.id,
    tokenId:
      asset.id || asset.tokenId || `${asset.policy_id || asset.policyId}_${asset.asset_id || asset.assetNameHex || ''}`,
    name: asset.name || asset.displayName || asset.ticker || asset.metadata?.onchainMetadata?.name || 'Unknown',
    quantity: asset.quantity || parseFloat(asset.quantity) || 0,
    isNft: true,
    isFungibleToken: false,
    src: imageSrc,
    metadata: {
      policyId: asset.policy_id || asset.policyId || asset.metadata?.policyId,
      image: imageSrc,
      assetName: asset.asset_id || asset.assetNameHex || asset.metadata?.assetName,
      ...asset.metadata,
    },
    ...asset,
  };
};

export const CancelOfferAction = ({ vaultId, onDataChange }) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useOffersToCancel(vaultId, {
    limit: PAGE_SIZE,
    search: searchQuery,
  });

  const walletAssets = useMemo(() => {
    const allAssets = data?.pages?.flatMap(page => page.items || []) ?? [];

    return allAssets.map(mapOfferToAsset);
  }, [data]);

  const selectedNFTsCount = selectedNFTs.length;

  const toggleNFT = useCallback(asset => {
    setSelectedNFTs(prevSelected => {
      const isSelected = prevSelected.some(nft => nft.tokenId === asset.tokenId);

      if (isSelected) {
        return prevSelected.filter(nft => nft.tokenId !== asset.tokenId);
      }

      if (prevSelected.length >= MAX_NFT_PER_TRANSACTION) {
        return prevSelected;
      }

      return [...prevSelected, asset];
    });
  }, []);

  const removeNFT = useCallback(tokenId => {
    setSelectedNFTs(prev => prev.filter(nft => nft.tokenId !== tokenId));
  }, []);

  const loadMoreAssets = useCallback(() => fetchNextPage(), [fetchNextPage]);

  useEffect(() => {
    const formattedAssets = selectedNFTs.map(asset => ({
      id: asset.id,
      ...asset,
      metadata: asset.metadata,
    }));

    onDataChange?.({
      cancelOfferAssets: formattedAssets,
      isValid: formattedAssets.length > 0,
    });
  }, [selectedNFTs, onDataChange]);

  return (
    <AssetsList
      walletAssets={walletAssets}
      isLoading={isLoading}
      isLoadingMore={isFetchingNextPage}
      hasNextPage={hasNextPage}
      loadMoreAssets={loadMoreAssets}
      activeTab="NFT"
      onTabChange={() => {}}
      selectedNFTs={selectedNFTs}
      selectedAmount={{}}
      onToggleNFT={toggleNFT}
      onFTAmountChange={() => {}}
      onRemoveNFT={removeNFT}
      selectedNFTsCount={selectedNFTsCount}
      selectedFTsCount={0}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      showTabs={false}
      title="Available Assets To Cancel"
    />
  );
};
