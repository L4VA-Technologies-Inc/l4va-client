import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { NFTItem } from './NFTItem';
import { FTItem } from './FTItem';
import { ContributionDetails } from './ContributionDetails';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { TapToolsApiProvider } from '@/services/api/taptools';
import { Spinner } from '@/components/Spinner';

import { useTransaction } from '@/hooks/useTransaction';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const RECIPIENT_ADDRESS = 'addr_test1qpngt4n7vyg4uw2dyqhucjxs400hz92zf67l87plrnq9s4evsy3rlxfvscmu2y2c4m98rkkzc4c5txd7034u5a5uejksnnm4yr';

// Constants for calculations
const ASSET_VALUE_USD = 152; // Value per asset in USD
const TICKER_VAL_RATE = 1751.67; // TICKER VAL rate per asset
const VAULT_ALLOCATION_PERCENTAGE = 11; // Fixed allocation percentage

export const ContributeModal = ({
  isOpen,
  vaultName,
  vaultId,
  recipientAddress = RECIPIENT_ADDRESS,
  onClose,
}) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [isLoading, setIsLoading] = useState(true);
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded');
  const { sendTransaction, status, error } = useTransaction();
  const [selectedAmount, setSelectedAmount] = useState({});

  const contributionDetails = useMemo(() => {
    // Count NFTs and FTs with amounts
    const nftCount = selectedNFTs.filter(asset => asset.type === 'NFT').length;
    const ftCount = selectedNFTs.filter(asset => asset.type === 'FT').length;
    const totalAssets = nftCount + ftCount;

    // Calculate estimated values based on total assets
    const estimatedValue = totalAssets * ASSET_VALUE_USD;
    const estimatedTickerVal = totalAssets * TICKER_VAL_RATE;
    const vaultAllocation = totalAssets > 0 ? VAULT_ALLOCATION_PERCENTAGE : 0;

    return {
      totalAssets,
      vaultAllocation,
      estimatedValue,
      estimatedTickerVal,
    };
  }, [selectedNFTs]);

  useEffect(() => {
    const fetchWalletSummary = async () => {
      setIsLoading(true);
      try {
        const changeAddress = await wallet.handler.getChangeAddressBech32();
        const { data } = await TapToolsApiProvider.getWalletSummary(changeAddress);
        if (data?.assets) {
          const formattedAssets = data.assets.map(asset => {
            if (asset.isNft) {
              return {
                id: asset.tokenId,
                name: asset.displayName || asset.name,
                policyId: asset.metadata.policyId,
                image: asset.metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '/placeholder.svg',
                description: asset.metadata.description,
                quantity: asset.quantity,
                type: 'NFT',
              };
            } if (asset.isFungibleToken) {
              return {
                id: asset.tokenId,
                name: asset.displayName || asset.name,
                policyId: asset.metadata.policyId,
                quantity: asset.quantity,
                decimals: asset.metadata.decimals,
                type: 'FT',
              };
            }
            return null;
          }).filter(Boolean);

          setAssets(formattedAssets);
        }
      } catch (err) {
        console.error('Error fetching wallet summary:', err);
        toast.error('Failed to load assets');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWalletSummary();
  }, [wallet.handler]);

  const toggleNFT = (asset) => {
    if (asset.type === 'FT') return; // Ignore toggle for FT tokens

    if (selectedNFTs.some(nft => nft.id === asset.id)) {
      setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== asset.id));
    } else {
      setSelectedNFTs([...selectedNFTs, asset]);
    }
  };

  const handleFTAmountChange = (ft, amount) => {
    setSelectedAmount(prev => ({
      ...prev,
      [ft.id]: amount,
    }));

    // Update selected NFTs based on amount
    const existingIndex = selectedNFTs.findIndex(nft => nft.id === ft.id);

    if (amount && amount !== '0') {
      if (existingIndex >= 0) {
        setSelectedNFTs(prev =>
          prev.map(item =>
            item.id === ft.id ? { ...item, amount } : item,
          ),
        );
      } else {
        setSelectedNFTs([...selectedNFTs, { ...ft, amount }]);
      }
    } else {
      if (existingIndex >= 0) {
        setSelectedNFTs(prev => prev.filter(item => item.id !== ft.id));
      }
    }
  };

  const removeNFT = (id) => setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== id));

  const handleContribute = async () => {
    try {
      const hash = await sendTransaction({
        vaultId,
        selectedNFTs,
        recipient: recipientAddress,
      });

      if (hash) {
        toast.success(`Contribution successful! Hash: ${hash}`);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || error || 'Contribution failed');
    }
  };

  const filteredAssets = useMemo(() =>
    assets.filter(asset => asset.type === activeTab), [assets, activeTab]);

  const renderAssetList = () => {
    if (activeTab === 'NFT') {
      return filteredAssets.map((nft) => (
        <NFTItem
          key={nft.id}
          isSelected={selectedNFTs.some(selected => selected.id === nft.id)}
          nft={nft}
          onToggle={toggleNFT}
        />
      ));
    }

    return filteredAssets.map((ft) => (
      <FTItem
        key={ft.id}
        amount={selectedAmount[ft.id] || ''}
        ft={ft}
        onAmountChange={handleFTAmountChange}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl p-0 bg-steel-950 text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Contribute to {vaultName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">
                Available Assets
              </h2>
              <LavaTabs
                activeTab={activeTab}
                className="bg-steel-850"
                tabs={['NFT', 'FT']}
                onTabChange={setActiveTab}
              />
            </div>
            <div className="space-y-1 h-full flex flex-col">
              <div className="flex justify-between text-dark-100 text-sm px-2">
                <span>Asset</span>
                <span>Policy ID</span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Spinner />
                  </div>
                ) : (
                  renderAssetList()
                )}
              </div>
            </div>
          </div>

          <ContributionDetails
            contributionDetails={contributionDetails}
            selectedNFTs={selectedNFTs}
            status={status}
            onContribute={handleContribute}
            onRemove={removeNFT}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
