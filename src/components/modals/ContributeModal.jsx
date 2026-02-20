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

export const ContributeModal = ({ vault, onClose, isOpen, isExpansion }) => {
  const { currencySymbol, isAda } = useCurrency();
  const { name, recipientAddress, assetsWhitelist } = vault;
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [activeTab, setActiveTab] = useState('NFT');
  const [selectedAmount, setSelectedAmount] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const selectedNFTsCount = useMemo(() => selectedNFTs.filter(asset => !asset.isFungibleToken).length, [selectedNFTs]);
  const selectedFTsCount = useMemo(() => selectedNFTs.filter(asset => asset.isFungibleToken).length, [selectedNFTs]);

  // Detect expansion mode from vault status or isExpansion prop
  const isExpansionMode = isExpansion || vault.vaultStatus === 'expansion';

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
    // For expansion mode, use the expansion policy IDs from whitelist
    if (isExpansionMode && vault?.expansionWhitelist) {
      return vault.expansionWhitelist.map(item => item.policyId);
    }

    // For regular contribution mode
    if (!assetsWhitelist?.length) return [];

    const contributedAssets = vaultAssetsData?.data?.items || [];
    const contributionStatus = getContributionStatus(assetsWhitelist, contributedAssets);
    const availablePolicyIds = contributionStatus
      .filter(status => !status.isAtMaxCapacity)
      .map(status => status.policyId);

    return availablePolicyIds;
  }, [isExpansionMode, vault?.expansionWhitelist, assetsWhitelist, vaultAssetsData]);

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
  // For NFTs: use full asset value
  // For FTs: calculate proportional value based on selected amount vs total quantity
  const estimatedValue = useMemo(() => {
    let total = 0;
    selectedNFTs.forEach(asset => {
      if (asset.isFungibleToken) {
        // For FTs, calculate proportional value based on selected amount
        const selectedQty = Number(asset.amount) || 0;
        const totalQty = Number(asset.quantity) || 1;
        const proportion = selectedQty / totalQty;
        const assetValue = isAda ? asset.valueAda : asset.valueUsd;
        total += assetValue * proportion;
      } else {
        // For NFTs, use full value
        total += isAda ? asset.valueAda : asset.valueUsd;
      }
    });
    return total;
  }, [selectedNFTs, isAda]);

  // Vault Allocation Formula: (1 - tokens for acq %) × (1 - ((LP % Contribution)/2))
  const tokensForAcqPercent = vault.tokensForAcquires / 100;
  const lpContributionPercent = vault.liquidityPoolContribution / 100;
  const vaultAllocation = (1 - tokensForAcqPercent) * (1 - lpContributionPercent / 2);

  // Only show estimates if assets are selected
  const hasSelectedAssets = selectedNFTs.length > 0 && estimatedValue > 0;

  // Expansion mode calculations
  const expansionVTAmount = useMemo(() => {
    if (!isExpansionMode || !hasSelectedAssets) return 0;

    const assetValueAda = isAda ? estimatedValue : estimatedValue / (vault.adaPrice || 1);
    const decimals = vault.ftTokenDecimals ?? 6;
    const decimalMultiplier = Math.pow(10, decimals);

    if (vault.expansionPriceType === 'limit') {
      // Limit price: VT amount = Asset Value (ADA) / Limit Price (ADA per VT)
      if (!vault.expansionLimitPrice || vault.expansionLimitPrice === 0) return 0;
      return (assetValueAda / vault.expansionLimitPrice) * decimalMultiplier;
    } else {
      // Market price: VT amount = Asset Value (ADA) / Current VT Price (ADA per VT)
      const currentVtPrice = vault.vtPrice;
      if (!currentVtPrice || currentVtPrice === 0) return 0;
      return (assetValueAda / currentVtPrice) * decimalMultiplier;
    }
  }, [isExpansionMode, hasSelectedAssets, estimatedValue, isAda, vault]);

  const expansionVTValue = useMemo(() => {
    if (!isExpansionMode || !hasSelectedAssets) return 0;

    const decimals = vault.ftTokenDecimals ?? 6;
    const decimalMultiplier = Math.pow(10, decimals);
    const vtCount = expansionVTAmount / decimalMultiplier;
    const vtPriceInCurrency = isAda ? vault.vtPrice : vault.vtPrice * (vault.adaPrice || 1);

    return vtCount * vtPriceInCurrency;
  }, [isExpansionMode, hasSelectedAssets, expansionVTAmount, isAda, vault]);

  const expansionValueDifference = useMemo(() => {
    if (!isExpansionMode || !hasSelectedAssets || estimatedValue === 0) return 0;
    return ((expansionVTValue - estimatedValue) / estimatedValue) * 100;
  }, [isExpansionMode, hasSelectedAssets, expansionVTValue, estimatedValue]);

  // Get current vault TVL (what contributors have already contributed)
  const currentVaultTVL = isAda
    ? vault.assetsPrices?.totalValueAda || vault.totalAssetsCostAda || 0
    : vault.assetsPrices?.totalValueUsd || vault.totalAssetsCostUsd || 0;

  // Calculate user's share of the total contributor pool
  const totalContributorValue = currentVaultTVL + estimatedValue;
  const userShareOfContributors = totalContributorValue > 0 ? estimatedValue / totalContributorValue : 0;

  // Total tokens available for contributors (after LP and acquirers allocation)
  const tokensForContributors = vaultAllocation * vault.ftTokenSupply;

  // User's proportional share of contributor tokens
  const userEstimatedTokens = hasSelectedAssets ? Math.floor(userShareOfContributors * tokensForContributors) : 0;

  const vaultAllocationPercent = hasSelectedAssets ? (userShareOfContributors * 100).toFixed(2) : '0.00';

  const estimatedTickerVal = hasSelectedAssets ? userEstimatedTokens.toLocaleString() : '0';

  // Estimated Amount to Receive = (1 - Vault Allocation %) × Estimated Value
  const estimatedReceived = hasSelectedAssets
    ? ((1 - vaultAllocation) * estimatedValue).toFixed(2).toLocaleString()
    : '0.00';
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

  const removeNFT = tokenId => {
    setSelectedNFTs(selectedNFTs.filter(nft => nft.tokenId !== tokenId));
    // Also clear the amount for FTs when removed
    setSelectedAmount(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[tokenId];
      return newAmounts;
    });
  };

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
                (isExpansionMode
                  ? vault.expansionPhaseStart &&
                    new Date(vault.expansionPhaseStart).getTime() + vault.expansionDuration <
                      Date.now() + BUTTON_DISABLE_THRESHOLD_MS
                  : new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration <
                    Date.now() + BUTTON_DISABLE_THRESHOLD_MS)
              }
              onClick={handleContribute}
              size="sm"
              className="capitalize"
            >
              {wallet.isUpdatingUtxos ? 'Updating UTXOs...' : status === 'idle' ? 'Contribute' : status}
            </PrimaryButton>
          </div>
        </div>
        <div className="text-xs text-dark-100 border-t border-steel-800 pt-2">
          Transaction cost:{' '}
          <span className="text-white font-medium">
            ~{((vault.protocolContributorsFeeAda || 0) + 1.9).toFixed(2)} ADA
          </span>{' '}
          (
          {vault.protocolContributorsFeeAda > 0
            ? `${vault.protocolContributorsFeeAda?.toFixed(2)} ADA Protocol fees + ~1.9 ADA Network fees`
            : '~1.9 ADA Network fees'}
          )
        </div>
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
            <h2 className="text-xl font-medium">
              {isExpansionMode ? 'Expansion Contribution Summary' : 'Contribution Summary'}
            </h2>
            <HoverHelp
              hint={
                isExpansionMode
                  ? 'You will receive VT tokens for your expansion contribution based on the governance-approved pricing method. VT tokens will be claimable after the expansion phase completes.'
                  : 'Data are estimates based on the total assets contributed until now (including this transaction). Final Vault allocation and total number of vault tokens awarded will not be finalized until vault successfully locks. See L4VA docs for more information.'
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Estimated Value is based on current estimation. Final value is calculated at the end of the Contribution Window.*/}
            <MetricCard
              label={isExpansionMode ? 'Estimated Asset(s) Value' : 'Estimated Value'}
              value={`${currencySymbol}${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            {/* Show protocol fee only if it's greater than 0 */}
            {vault.protocolContributorsFeeAda > 0 && (
              <MetricCard
                label="Protocol Fee"
                value={`${currencySymbol}${isAda ? vault.protocolContributorsFeeAda.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : vault.protocolContributorsFeeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            )}
            {/* 
                Estimated % of Vault Token allocation, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
             */}
            {!isExpansionMode && <MetricCard label="Vault Allocation" value={`${vaultAllocationPercent}%`} />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* 
                Estimated Vault Token received, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
            */}
            {!isExpansionMode && <MetricCard label="Estimated Vault Token Received" value={estimatedTickerVal} />}

            {/* Expansion mode: show VT tokens to receive */}
            {isExpansionMode && (
              <MetricCard
                label="Vault Token to Receive"
                value={
                  hasSelectedAssets
                    ? (expansionVTAmount / Math.pow(10, vault.ftTokenDecimals ?? 6)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '0.00'
                }
              />
            )}

            {/* 
                Estimated amount received, based on assets contributed to date and current floor prices.
                Note: Final Vault Token and ADA amounts depend on Asset Value at the end of Contribution Window and total ADA sent in Acquire phase.
             */}
            {!isExpansionMode && (
              <MetricCard label={estimatedReceivedLabel} value={`${currencySymbol}${estimatedReceived}`} />
            )}

            {/* Expansion mode: show current value of VT tokens */}
            {isExpansionMode && (
              <MetricCard
                label={`Current Value of VT to Receive`}
                value={`${currencySymbol}${expansionVTValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            )}
          </div>

          {/* Expansion mode: show gain/loss percentage */}
          {isExpansionMode && hasSelectedAssets && (
            <div className="p-4 bg-steel-850 rounded-lg border border-steel-750">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Value Difference</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-semibold ${expansionValueDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {expansionValueDifference >= 0 ? '+' : ''}
                    {expansionValueDifference.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500">({expansionValueDifference >= 0 ? 'Gain' : 'Loss'})</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {expansionValueDifference >= 0
                  ? 'You will receive VT tokens worth more than your contributed assets at current market price'
                  : 'You will receive VT tokens worth less than your contributed assets at current market price'}
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
