import { useState, useMemo, useCallback, useEffect } from 'react';

import { AssetsList } from '@/components/modals/AssetsList/AssetsList.jsx';
import { useAssetsToUnlist } from '@/services/api/queries';
import { getIPFSUrl } from '@/utils/core.utils';

const MAX_NFT_PER_TRANSACTION = 10;
const MAX_FT_PER_TRANSACTION = 10;

export const UnlistAction = ({ vaultId, onDataChange }) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [selectedAmount, setSelectedAmount] = useState({});

  const { data: assetsData, isLoading } = useAssetsToUnlist(vaultId);

  const walletAssets = useMemo(() => {
    if (!assetsData?.data) return [];
    return assetsData.data.map(asset => {
      const imageSrc = getIPFSUrl(asset.imageUrl || asset.metadata?.imageUrl || asset.metadata?.image || asset.image);
      const isNft = asset.type === 'nft' || asset.isNft || (!asset.isFungibleToken && asset.type !== 'cnt');
      const isFungibleToken = asset.type === 'cnt' || asset.isFungibleToken || !isNft;

      return {
        id: asset.id, // Preserve UUID from database
        tokenId:
          asset.id ||
          asset.tokenId ||
          `${asset.policy_id || asset.policyId}_${asset.asset_id || asset.assetNameHex || ''}`,
        name: asset.name || asset.displayName || asset.ticker || asset.metadata?.onchainMetadata?.name || 'Unknown',
        quantity: asset.quantity || parseFloat(asset.quantity) || 0,
        isNft,
        isFungibleToken,
        src: imageSrc,
        metadata: {
          policyId: asset.policy_id || asset.policyId || asset.metadata?.policyId,
          image: imageSrc,
          assetName: asset.asset_id || asset.assetNameHex || asset.metadata?.assetName,
          ...asset.metadata,
        },
        ...asset,
      };
    });
  }, [assetsData]);

  const selectedNFTsCount = useMemo(() => selectedNFTs.filter(asset => !asset.isFungibleToken).length, [selectedNFTs]);
  const selectedFTsCount = useMemo(() => selectedNFTs.filter(asset => asset.isFungibleToken).length, [selectedNFTs]);

  const toggleNFT = useCallback(asset => {
    if (asset.isFungibleToken) return;

    setSelectedNFTs(prevSelected => {
      const isSelected = prevSelected.some(nft => nft.tokenId === asset.tokenId);

      if (isSelected) {
        return prevSelected.filter(nft => nft.tokenId !== asset.tokenId);
      } else {
        const nftCount = prevSelected.filter(a => !a.isFungibleToken).length;
        if (nftCount >= MAX_NFT_PER_TRANSACTION) {
          return prevSelected;
        }
        return [...prevSelected, asset];
      }
    });
  }, []);

  const handleFTAmountChange = useCallback((ft, amount) => {
    const isValid = amount === '' || /^\d+(\.\d{0,2})?$/.test(amount);

    if (!isValid) return;

    if (Number(amount) >= ft.quantity) {
      amount = Number(ft.quantity).toFixed(2);
    }

    setSelectedAmount(prev => ({
      ...prev,
      [ft.tokenId]: amount,
    }));

    setSelectedNFTs(prevSelected => {
      const existingIndex = prevSelected.findIndex(nft => nft.tokenId === ft.tokenId);

      if (amount && amount !== '0') {
        if (existingIndex >= 0) {
          return prevSelected.map(item => (item.tokenId === ft.tokenId ? { ...item, amount } : item));
        } else {
          const ftCount = prevSelected.filter(a => a.isFungibleToken).length;
          if (ftCount >= MAX_FT_PER_TRANSACTION) {
            return prevSelected;
          }
          return [...prevSelected, { ...ft, amount }];
        }
      } else {
        if (existingIndex >= 0) {
          return prevSelected.filter(item => item.tokenId !== ft.tokenId);
        }
        return prevSelected;
      }
    });
  }, []);

  const removeNFT = useCallback(tokenId => {
    setSelectedNFTs(prev => prev.filter(nft => nft.tokenId !== tokenId));
  }, []);

  useEffect(() => {
    const formattedAssets = selectedNFTs.map(asset => {
      // Preserve original asset data including id from API
      const baseAsset = {
        id: asset.id, // UUID from database
        ...asset,
      };

      if (asset.isFungibleToken) {
        return {
          ...baseAsset,
          quantity: Number(asset.amount),
        };
      }
      return {
        ...baseAsset,
        metadata: asset.metadata,
      };
    });

    onDataChange?.({
      unlistAssets: formattedAssets,
      isValid: formattedAssets.length > 0,
    });
  }, [selectedNFTs, onDataChange]);

  return (
    <AssetsList
      walletAssets={walletAssets}
      isLoading={isLoading}
      isLoadingMore={false}
      hasNextPage={false}
      loadMoreAssets={() => {}}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedNFTs={selectedNFTs}
      selectedAmount={selectedAmount}
      onToggleNFT={toggleNFT}
      onFTAmountChange={handleFTAmountChange}
      onRemoveNFT={removeNFT}
      selectedNFTsCount={selectedNFTsCount}
      selectedFTsCount={selectedFTsCount}
    />
  );
};
