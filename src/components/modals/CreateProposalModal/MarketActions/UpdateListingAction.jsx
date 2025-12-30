import { useState, useMemo, useCallback, useEffect } from 'react';

import { AssetsList } from '@/components/modals/AssetsList/AssetsList.jsx';
import { SelectedAssetItemWithPrice } from '@/components/modals/AssetsList/SelectedAssetItemWithPrice.jsx';
import { useAssetsToUpdateListing } from '@/services/api/queries';
import { getIPFSUrl } from '@/utils/core.utils';

const MAX_NFT_PER_TRANSACTION = 10;
const MAX_FT_PER_TRANSACTION = 10;

export const UpdateListingAction = ({ vaultId, onDataChange }) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [selectedAmount, setSelectedAmount] = useState({});
  const [newPrices, setNewPrices] = useState({});

  const { data: assetsData, isLoading } = useAssetsToUpdateListing(vaultId);

  const walletAssets = useMemo(() => {
    if (!assetsData?.data) return [];
    return assetsData.data.map(asset => {
      const imageSrc = getIPFSUrl(asset.imageUrl || asset.metadata?.imageUrl || asset.metadata?.image || asset.image);
      const isNft = asset.type === 'nft' || asset.isNft || (!asset.isFungibleToken && asset.type !== 'ft');
      const isFungibleToken = asset.type === 'ft' || asset.isFungibleToken || !isNft;

      return {
        id: asset.id,
        tokenId:
          asset.id ||
          asset.tokenId ||
          `${asset.policy_id || asset.policyId}_${asset.asset_id || asset.assetNameHex || ''}`,
        name: asset.name || asset.displayName || asset.ticker || asset.metadata?.onchainMetadata?.name || 'Unknown',
        quantity: asset.quantity || parseFloat(asset.quantity) || 0,
        isNft,
        isFungibleToken,
        price: asset.price || asset.floor_price || asset.dex_price || 0,
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
        setNewPrices(prev => {
          const updated = { ...prev };
          delete updated[asset.tokenId];
          return updated;
        });
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

    let cappedAmount = amount;
    if (Number(amount) >= ft.quantity) {
      cappedAmount = Number(ft.quantity).toFixed(2);
    }

    setSelectedAmount(prev => ({
      ...prev,
      [ft.tokenId]: cappedAmount,
    }));

    setSelectedNFTs(prevSelected => {
      const existingIndex = prevSelected.findIndex(nft => nft.tokenId === ft.tokenId);

      if (cappedAmount && cappedAmount !== '0') {
        if (existingIndex >= 0) {
          return prevSelected.map(item => (item.tokenId === ft.tokenId ? { ...item, amount: cappedAmount } : item));
        } else {
          const ftCount = prevSelected.filter(a => a.isFungibleToken).length;
          if (ftCount >= MAX_FT_PER_TRANSACTION) {
            return prevSelected;
          }
          return [...prevSelected, { ...ft, amount: cappedAmount }];
        }
      } else {
        if (existingIndex >= 0) {
          setNewPrices(prev => {
            const updated = { ...prev };
            delete updated[ft.tokenId];
            return updated;
          });
          return prevSelected.filter(item => item.tokenId !== ft.tokenId);
        }
        return prevSelected;
      }
    });
  }, []);

  const removeNFT = useCallback(tokenId => {
    setSelectedNFTs(prev => prev.filter(nft => nft.tokenId !== tokenId));
    setNewPrices(prev => {
      const updated = { ...prev };
      delete updated[tokenId];
      return updated;
    });
  }, []);

  const handlePriceChange = useCallback((tokenId, price) => {
    setNewPrices(prev => ({
      ...prev,
      [tokenId]: price,
    }));

    setSelectedNFTs(prev => prev.map(asset => (asset.tokenId === tokenId ? { ...asset, newPrice: price } : asset)));
  }, []);

  useEffect(() => {
    const formattedAssets = selectedNFTs.map(asset => {
      const baseAsset = {
        id: asset.id,
        ...asset,
        newPrice: newPrices[asset.tokenId] || '',
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
      updateListingAssets: formattedAssets,
      isValid:
        formattedAssets.length > 0 && formattedAssets.every(asset => asset.newPrice && Number(asset.newPrice) > 0),
    });
  }, [selectedNFTs, newPrices, onDataChange]);

  const renderSelectedItem = useCallback(
    asset => {
      const enhancedAsset = {
        ...asset,
        src: asset.src || getIPFSUrl(asset.metadata?.image || asset.metadata?.imageUrl || asset.imageUrl),
      };

      return (
        <SelectedAssetItemWithPrice
          key={asset.tokenId}
          asset={enhancedAsset}
          oldPrice={asset.price}
          onRemove={removeNFT}
          onPriceChange={handlePriceChange}
        />
      );
    },
    [removeNFT, handlePriceChange]
  );

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
      renderSelectedItem={renderSelectedItem}
    />
  );
};
