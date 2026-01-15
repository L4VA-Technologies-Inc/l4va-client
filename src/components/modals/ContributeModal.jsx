import { useState, useEffect, useMemo, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { ModalWrapper } from '@/components/shared/ModalWrapper.jsx';
import PrimaryButton from '@/components/shared/PrimaryButton.tsx';
import SecondaryButton from '@/components/shared/SecondaryButton.tsx';
import MetricCard from '@/components/shared/MetricCard.jsx';
import { useTransaction } from '@/hooks/useTransaction.js';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';
import { BUTTON_DISABLE_THRESHOLD_MS } from '@/components/vaults/constants/vaults.constants.js';
import { getContributionStatus } from '@/utils/vaultContributionLimits.js';
import { useVaultAssets } from '@/services/api/queries.js';
import { useInfiniteWalletAssets } from '@/hooks/useInfiniteWalletAssets.ts';
import { AssetsList } from '@/components/modals/AssetsList/AssetsList.jsx';
import { useCurrency } from '@/hooks/useCurrency';

const MAX_NFT_PER_TRANSACTION = 10;
const MAX_FT_PER_TRANSACTION = 10;

export const ContributeModal = ({ vault, onClose, isOpen }) => {
  const { currencySymbol, isAda } = useCurrency();
  const { name, recipientAddress, assetsWhitelist } = vault;
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [selectedAmount, setSelectedAmount] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
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
    search: searchQuery.trim() || '',
  });

  // Calculate estimated value
  let estimatedValue = 0;
  selectedNFTs.forEach(asset => {
    estimatedValue += isAda ? asset.valueAda : asset.valueUsd;
  });

  // Vault Allocation Formula: (1 - tokens for acq %) × (1 - ((LP % Contribution)/2))
  const tokensForAcqPercent = vault.tokensForAcquires / 100;
  const lpContributionPercent = vault.liquidityPoolContribution / 100;
  const vaultAllocation = (1 - tokensForAcqPercent) * (1 - lpContributionPercent / 2);
  const vaultAllocationPercent = (vaultAllocation * 100).toFixed(2);

  // Estimated Vault Token Amount = Vault Token Allocation % × Vault Token Supply
  const estimatedTickerVal = Math.floor(vaultAllocation * vault.ftTokenSupply).toLocaleString();
  // Estimated Amount to Receive = (1 - Vault Allocation %) × Estimated Value
  const estimatedReceived = ((1 - vaultAllocation) * estimatedValue).toFixed(2).toLocaleString();
  const estimatedReceivedLabel = isAda ? 'Estimated ADA Received' : 'Estimated USD Received';

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
        <AssetsList
          walletAssets={walletAssets}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasNextPage={hasNextPage}
          loadMoreAssets={loadMoreAssets}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedNFTs={selectedNFTs}
          selectedAmount={selectedAmount}
          onToggleNFT={toggleNFT}
          onFTAmountChange={handleFTAmountChange}
          onRemoveNFT={removeNFT}
          selectedNFTsCount={selectedNFTsCount}
          selectedFTsCount={selectedFTsCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium">Contribution Summary</h2>
            <HoverHelp hint="Data are estimates based on the total assets contributed until now (including this transaction). Final Vault allocation and total number of vault tokens awarded will not be finalized until vault successfully locks. See L4VA docs for more information." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Estimated Value is based on current estimation. Final value is calculated at the end of the Contribution Window.*/}
            <MetricCard label="Estimated Value" value={`${currencySymbol}${estimatedValue.toLocaleString()}`} />
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
                Estimated amount received, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
             */}
            <MetricCard label={estimatedReceivedLabel} value={`${currencySymbol}${estimatedReceived}`} />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
