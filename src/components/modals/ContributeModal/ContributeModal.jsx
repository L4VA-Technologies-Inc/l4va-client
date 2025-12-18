import { useState, useEffect, useMemo, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { NFTItem } from './NFTItem';
import { FTItem } from './FTItem';
import { SelectedAssetItem } from './SelectedAssetItem';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import MetricCard from '@/components/shared/MetricCard';
import { useTransaction } from '@/hooks/useTransaction';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';
import { BUTTON_DISABLE_THRESHOLD_MS } from '@/components/vaults/constants/vaults.constants';
import { getContributionStatus } from '@/utils/vaultContributionLimits';
import { useVaultAssets } from '@/services/api/queries';
import { InfiniteScrollList } from '@/components/shared/InfiniteScrollList';
import { useInfiniteWalletAssets } from '@/hooks/useInfiniteWalletAssets';

const DEFAULT_ASSET_VALUE_ADA = 152;
const MAX_NFT_PER_TRANSACTION = 10;
const MAX_FT_PER_TRANSACTION = 10;

const testnetPrices = {
  f61a534fd4484b4b58d5ff18cb77cfc9e74ad084a18c0409321c811a: 0.00526,
  ed8145e0a4b8b54967e8f7700a5ee660196533ded8a55db620cc6a37: 0.00374,
  '755457ffd6fffe7b20b384d002be85b54a0b3820181f19c5f9032c2e': 250.0,
  fd948c7248ecef7654f77a0264a188dccc76bae5b73415fc51824cf3: 19000.0,
  add6529cc60380af5d51566e32925287b5b04328332652ccac8de0a9: 36.0,
  '4e529151fe66164ebcf52f81033eb0ec55cc012cb6c436104b30fa36': 69.0,
  '0b89a746fd2d859e0b898544487c17d9ac94b187ea4c74fd0bfbab16': 3400.0,
  '436ca2e51fa2887fa306e8f6aa0c8bda313dd5882202e21ae2972ac8': 115.93,
  '0d27d4483fc9e684193466d11bc6d90a0ff1ab10a12725462197188a': 188.57,
  '53173a3d7ae0a0015163cc55f9f1c300c7eab74da26ed9af8c052646': 100000.0,
  '91918871f0baf335d32be00af3f0604a324b2e0728d8623c0d6e2601': 250000.0,
};

// IPFS URL resolver
const getIPFSUrl = src => {
  if (!src) return src;

  // Handle IPFS URLs
  if (src.startsWith('ipfs://')) {
    const hash = src.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  return src;
};

// Enhanced NFT/FT items with IPFS support
const EnhancedNFTItem = ({ nft, isSelected, isDisabled, onToggle }) => {
  const enhancedNft = {
    ...nft,
    src: getIPFSUrl(nft.metadata.image),
  };

  return <NFTItem isSelected={isSelected} isDisabled={isDisabled} nft={enhancedNft} onToggle={onToggle} />;
};

const EnhancedFTItem = ({ ft, amount, isDisabled, onAmountChange }) => {
  const enhancedFt = {
    ...ft,
    src: getIPFSUrl(ft.metadata.image),
  };

  return <FTItem amount={amount} isDisabled={isDisabled} ft={enhancedFt} onAmountChange={onAmountChange} />;
};

export const ContributeModal = ({ vault, onClose, isOpen }) => {
  const { name, recipientAddress, assetsWhitelist } = vault;
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [selectedAmount, setSelectedAmount] = useState({});
  const selectedNFTsCount = useMemo(() => selectedNFTs.filter(asset => !asset.isFungibleToken).length, [selectedNFTs]);
  const selectedFTsCount = useMemo(() => selectedNFTs.filter(asset => asset.isFungibleToken).length, [selectedNFTs]);

  const wallet = useWallet(
    'handler',
    'isConnected',
    'balanceAda',
    'balanceDecoded',
    'isUpdatingUtxos',
    'changeAddressBech32'
  );
  const { sendTransaction, status, error } = useTransaction();
  const { data: vaultAssetsData } = useVaultAssets(vault?.id);

  const whitelistedPolicies = useMemo(() => {
    if (!assetsWhitelist?.length) return [];

    const contributedAssets = vaultAssetsData?.data?.items || [];
    const contributionStatus = getContributionStatus(assetsWhitelist, contributedAssets);
    const availablePolicyIds = contributionStatus
      .filter(status => !status.isAtMaxCapacity)
      .map(status => status.policyId);

    return availablePolicyIds;
  }, [assetsWhitelist, vaultAssetsData]);

  const {
    assets: walletAssets,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error: walletError,
    loadMoreAssets,
    refresh,
  } = useInfiniteWalletAssets({
    walletAddress: wallet?.changeAddressBech32,
    whitelistedPolicies,
    activeTab,
  });

  // Calculate estimated value
  let estimatedValue = 0;
  selectedNFTs.forEach(asset => {
    const assetPrice = testnetPrices[asset.metadata?.policyId] || DEFAULT_ASSET_VALUE_ADA;
    if (asset.isFungibleToken && asset.amount) {
      estimatedValue += assetPrice * Number(asset.amount);
    } else {
      estimatedValue += assetPrice;
    }
  });

  // Vault Allocation Formula: (1 - tokens for acq %) × (1 - ((LP % Contribution)/2))
  const tokensForAcqPercent = vault.tokensForAcquires / 100;
  const lpContributionPercent = vault.liquidityPoolContribution / 100;
  const vaultAllocation = (1 - tokensForAcqPercent) * (1 - lpContributionPercent / 2);
  const vaultAllocationPercent = (vaultAllocation * 100).toFixed(2);

  // Estimated Vault Token Amount = Vault Token Allocation % × Vault Token Supply
  const estimatedTickerVal = Math.floor(vaultAllocation * vault.ftTokenSupply).toLocaleString();
  // Estimated ADA to Receive = (1 - Vault Allocation %) × Estimated Value
  const estimatedAdaReceived = ((1 - vaultAllocation) * estimatedValue).toFixed(2).toLocaleString();

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

  const removeNFT = tokenId => setSelectedNFTs(selectedNFTs.filter(nft => nft.tokenId !== tokenId));

  const handleContribute = async () => {
    try {
      const formattedAssets = selectedNFTs.map(asset => {
        if (asset.isFungibleToken) {
          return {
            ...asset,
            quantity: Number(asset.amount),
          };
        }
        return {
          ...asset,
          metadata: asset.metadata,
        };
      });

      await sendTransaction({
        vaultId: vault.id,
        recipient: recipientAddress,
        selectedNFTs: formattedAssets,
      });
      setSelectedNFTs([]);
      setSelectedAmount({});
      refresh(); // Refresh wallet assets after contribution
      onClose();
    } catch (err) {
      toast.error(err.message || error || 'Contribution failed');
    }
  };

  const renderAssetItem = useCallback(
    item => {
      if (activeTab === 'NFT') {
        const isSelected = selectedNFTs.some(selected => selected.tokenId === item.tokenId);
        const isDisabled = !isSelected && selectedNFTsCount >= MAX_NFT_PER_TRANSACTION;

        return (
          <EnhancedNFTItem
            key={item.tokenId}
            nft={item}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onToggle={toggleNFT}
          />
        );
      } else {
        const hasAmount = selectedAmount[item.tokenId] && selectedAmount[item.tokenId] !== '0';
        const isDisabled = !hasAmount && selectedFTsCount >= MAX_FT_PER_TRANSACTION;

        return (
          <EnhancedFTItem
            key={item.tokenId}
            ft={item}
            amount={selectedAmount[item.tokenId] || ''}
            isDisabled={isDisabled}
            onAmountChange={handleFTAmountChange}
          />
        );
      }
    },
    [activeTab, selectedNFTs, selectedAmount, selectedNFTsCount, selectedFTsCount, toggleNFT, handleFTAmountChange]
  );

  const renderFooter = () => {
    const transactionCost = selectedNFTs.length > 0 ? selectedNFTs.length * 5 + 0.77 : 0;

    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {selectedNFTs.length} asset{selectedNFTs.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose} size="sm">
              Close
            </SecondaryButton>
            <PrimaryButton
              disabled={
                selectedNFTs.length === 0 ||
                status !== 'idle' ||
                wallet.isUpdatingUtxos ||
                new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration <
                  Date.now() + BUTTON_DISABLE_THRESHOLD_MS
              }
              onClick={handleContribute}
              size="sm"
              className="capitalize"
            >
              {wallet.isUpdatingUtxos ? 'Updating UTXOs...' : status === 'idle' ? 'Contribute' : status}
            </PrimaryButton>
          </div>
        </div>
        {selectedNFTs.length > 0 && (
          <div className="text-xs text-dark-100 border-t border-steel-800 pt-2">
            Transaction cost: <span className="text-white font-medium">~{transactionCost.toFixed(2)} ADA</span> (5 ADA
            per asset + 0.77 ADA)
          </div>
        )}
      </div>
    );
  };

  // Handle wallet errors
  useEffect(() => {
    if (walletError) {
      console.error('Error loading wallet assets:', walletError);
      toast.error('Failed to load wallet assets');
    }
  }, [walletError]);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Contribute to ${name}`}
      maxHeight="90vh"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Available Assets</h2>
            <LavaTabs activeTab={activeTab} className="bg-steel-850" tabs={['NFT', 'FT']} onTabChange={setActiveTab} />
          </div>
          <div className="space-y-1 h-full flex flex-col">
            <div className="flex justify-between text-dark-100 text-sm px-2">
              <span>Asset</span>
              <span>Policy ID</span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : (
              <InfiniteScrollList
                items={walletAssets}
                renderItem={renderAssetItem}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasNextPage={hasNextPage}
                onLoadMore={loadMoreAssets}
                className="pr-2 max-h-64"
                loadThreshold={50}
              />
            )}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Selected Assets ({selectedNFTs.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {selectedNFTs.length > 0 ? (
              selectedNFTs.map(asset => <SelectedAssetItem key={asset.tokenId} asset={asset} onRemove={removeNFT} />)
            ) : (
              <div className="text-center py-6 text-dark-100 bg-steel-900/50 rounded-lg border border-steel-800/50">
                <p className="mb-2">No assets selected</p>
                <p className="text-sm">Select assets from above to contribute</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium">Contribution Summary</h2>
            <HoverHelp hint="Data are estimates based on the total assets contributed until now (including this transaction). Final Vault allocation and total number of vault tokens awarded will not be finalized until vault successfully locks. See L4VA docs for more information." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Estimated Value is based on current estimation. Final value is calculated at the end of the Contribution Window.*/}
            <MetricCard label="Estimated Value" value={`₳${estimatedValue.toLocaleString()}`} />
            {/* 
                Estimated % of Vault Token allocation, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
             */}
            <MetricCard label="Vault Allocation" value={`${vaultAllocationPercent}%`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* 
                Estimated Vault Token received, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
            */}
            <MetricCard label="Estimated Vault Token Received" value={estimatedTickerVal} />

            {/* 
                Estimated ADA received, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
             */}
            <MetricCard label="Estimated ADA Received" value={estimatedAdaReceived} />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
