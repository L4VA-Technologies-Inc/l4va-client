import React, { useState, useEffect, useMemo } from 'react';
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
import { fetchAndFormatWalletAssets } from '@/utils/walletAssets';

const ASSET_VALUE_USD = 152; // Value per asset in USD

export const ContributeModal = ({ vault, onClose, isOpen }) => {
  const { name, recipientAddress, assetsWhitelist } = vault;
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [isLoading, setIsLoading] = useState(true);
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'isUpdatingUtxos');
  const { sendTransaction, status, error } = useTransaction();
  const [selectedAmount, setSelectedAmount] = useState({});

  const whitelistedPolicies = useMemo(() => {
    return new Set(assetsWhitelist?.map(item => item.policyId) || []);
  }, [assetsWhitelist]);

  const contributionDetails = useMemo(() => {
    const nftCount = selectedNFTs.filter(asset => asset.type === 'NFT').length;
    const ftCount = selectedNFTs.filter(asset => asset.type === 'FT').length;
    const totalAssets = nftCount + ftCount;
    const estimatedValue = totalAssets * ASSET_VALUE_USD;
    const vaultTokenPrice = vault.assetsPrices.totalValueUsd / vault.ftTokenSupply;
    let estimatedTickerVal;

    if (vaultTokenPrice > 0) {
      estimatedTickerVal = estimatedValue / vaultTokenPrice;
    } else {
      estimatedTickerVal = Math.floor(vault.ftTokenSupply * (vault.tokensForAcquires * 0.01));
    }

    const vaultAllocation =
      totalAssets > 0 ? ((estimatedValue / (vault.assetsPrices.totalValueUsd + estimatedValue)) * 100).toFixed(2) : 0;

    return {
      totalAssets,
      vaultAllocation,
      estimatedValue,
      estimatedTickerVal,
    };
  }, [selectedNFTs, vault.assetsPrices.totalValueUsd, vault.ftTokenSupply, vault.tokensForAcquires]);

  const loadWalletAssets = async () => {
    const formattedAssets = await fetchAndFormatWalletAssets(wallet, whitelistedPolicies);
    setAssets(formattedAssets);
  };

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      await loadWalletAssets();
      setIsLoading(false);
    };
    loadAssets();
  }, [wallet.handler]);

  const toggleNFT = asset => {
    if (asset.type === 'FT') return; // Ignore toggle for FT tokens

    if (selectedNFTs.some(nft => nft.id === asset.id)) {
      setSelectedNFTs(selectedNFTs.filter(nft => nft.id !== asset.id));
    } else {
      setSelectedNFTs([...selectedNFTs, asset]);
    }
  };

  const handleFTAmountChange = (ft, amount) => {
    const isValid = amount === '' || /^\d+(\.\d{0,2})?$/.test(amount);

    if (!isValid) return;

    if (Number(amount) >= ft.quantity) {
      amount = Number(ft.quantity).toFixed(2); // Ensure we don't exceed available quantity
    }

    setSelectedAmount(prev => ({
      ...prev,
      [ft.id]: amount,
    }));

    // Update selected NFTs based on amount
    const existingIndex = selectedNFTs.findIndex(nft => nft.id === ft.id);

    if (amount && amount !== '0') {
      if (existingIndex >= 0) {
        setSelectedNFTs(prev => prev.map(item => (item.id === ft.id ? { ...item, amount } : item)));
      } else {
        setSelectedNFTs([...selectedNFTs, { ...ft, amount }]);
      }
    } else {
      if (existingIndex >= 0) {
        setSelectedNFTs(prev => prev.filter(item => item.id !== ft.id));
      }
    }
  };

  const removeNFT = id => setSelectedNFTs(selectedNFTs.filter(nft => nft.id !== id));

  const handleContribute = async () => {
    try {
      const formattedAssets = selectedNFTs.map(asset => {
        if (asset.type === 'FT') {
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
      await loadWalletAssets();
    } catch (err) {
      toast.error(err.message || error || 'Contribution failed');
    }
  };

  const filteredAssets = useMemo(() => assets.filter(asset => asset.type === activeTab), [assets, activeTab]);

  const renderAssetList = () => {
    if (filteredAssets.length === 0) {
      return <div className="flex items-center justify-center h-32 text-dark-100">No {activeTab}s available</div>;
    }

    if (activeTab === 'NFT') {
      return filteredAssets.map(nft => (
        <NFTItem
          key={nft.id}
          isSelected={selectedNFTs.some(selected => selected.id === nft.id)}
          nft={nft}
          onToggle={toggleNFT}
        />
      ));
    }

    return filteredAssets.map(ft => (
      <FTItem key={ft.id} amount={selectedAmount[ft.id] || ''} ft={ft} onAmountChange={handleFTAmountChange} />
    ));
  };

  const renderFooter = () => (
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
            contributionDetails.totalAssets === 0 ||
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
  );

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
            <div className="space-y-2 flex-1 overflow-y-auto pr-2 max-h-64">
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
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Selected Assets ({selectedNFTs.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {selectedNFTs.length > 0 ? (
              selectedNFTs.map(asset => <SelectedAssetItem key={asset.id} asset={asset} onRemove={removeNFT} />)
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
            <MetricCard label="Total Assets Selected" value={contributionDetails.totalAssets} />
            <MetricCard label="Vault Allocation" value={`${contributionDetails.vaultAllocation}%`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Estimated Value" value={`$${contributionDetails.estimatedValue.toLocaleString()}`} />
            <MetricCard
              label="Estimated Vault Token Received"
              value={contributionDetails.estimatedTickerVal.toLocaleString()}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
