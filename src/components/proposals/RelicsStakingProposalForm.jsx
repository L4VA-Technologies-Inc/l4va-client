import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Minus, CheckCircle2, Package } from 'lucide-react';

import { useEligibleRelicsAssets, useStakedRelicsAssets } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import SecondaryButton from '@/components/shared/SecondaryButton';

export const RelicsStakingProposalForm = ({ vault, action, platform, onPayloadChange }) => {
  const isStaking = action === 'stake';
  const isHarvesting = action === 'harvest';

  // Fetch data based on action type
  const { data: eligibleAssets, isLoading: loadingEligible } = useEligibleRelicsAssets(vault.id, platform, {
    enabled: isStaking,
  });
  const { data: stakedAssets, isLoading: loadingStaked } = useStakedRelicsAssets(vault.id, platform, {
    enabled: !isStaking,
  });

  const isLoading = isStaking ? loadingEligible : loadingStaked;
  const assets = useMemo(
    () => (isStaking ? eligibleAssets?.assets || [] : stakedAssets?.assets || []),
    [isStaking, eligibleAssets?.assets, stakedAssets?.assets]
  );

  // Form state
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered assets based on search
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    const query = searchQuery.toLowerCase();
    return assets.filter(
      asset =>
        asset.name?.toLowerCase().includes(query) ||
        asset.policy_id?.toLowerCase().includes(query) ||
        asset.unit?.toLowerCase().includes(query)
    );
  }, [assets, searchQuery]);

  // Selection handlers
  const toggleAssetSelection = assetId => {
    setSelectedAssetIds(prev => (prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]));
  };

  const selectAll = () => {
    setSelectedAssetIds(filteredAssets.map(asset => asset.id));
  };

  const deselectAll = () => {
    setSelectedAssetIds([]);
  };

  // Build payload when selections change
  useEffect(() => {
    const payload = {
      stakingActions: [
        {
          action,
          platform,
          stakeCollectionId: 54, // Relics collection ID on Anvil
          ...(isStaking
            ? { assetIds: selectedAssetIds }
            : isHarvesting
              ? {
                  stakeIds: selectedAssetIds
                    .map(id => {
                      const asset = assets.find(a => a.id === id);
                      return asset?.stake_id;
                    })
                    .filter(Boolean),
                  claimOnly: true,
                }
              : {
                  stakeIds: selectedAssetIds
                    .map(id => {
                      const asset = assets.find(a => a.id === id);
                      return asset?.stake_id;
                    })
                    .filter(Boolean),
                  claimRewards: true,
                }),
        },
      ],
      isValid: selectedAssetIds.length > 0,
    };

    onPayloadChange?.(payload);
  }, [selectedAssetIds, action, platform, isStaking, isHarvesting, assets, onPayloadChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!assets.length) {
    const getMessage = () => {
      if (isStaking) {
        return 'No eligible Relics NFTs available for staking';
      }
      if (isHarvesting) {
        return 'No staked Relics NFTs available. Stake assets first to earn rewards';
      }
      return 'No staked Relics NFTs available for unstaking';
    };

    return (
      <div className="bg-steel-850 border border-steel-750 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-steel-800 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-steel-500" />
        </div>
        <p className="text-steel-400">{getMessage()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steel-500" />
        <input
          type="text"
          placeholder="Search by name, policy ID, or unit..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-steel-850 border border-steel-750 rounded-xl text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-steel-750"
        />
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-steel-400">
          {selectedAssetIds.length} of {filteredAssets.length} selected
        </p>
        {filteredAssets.length > 0 && (
          <SecondaryButton
            onClick={selectedAssetIds.length === filteredAssets.length ? deselectAll : selectAll}
            className="text-sm"
          >
            {selectedAssetIds.length === filteredAssets.length ? (
              <>
                <Minus className="w-4 h-4" />
                Deselect All
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Select All
              </>
            )}
          </SecondaryButton>
        )}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
        {filteredAssets.map(asset => {
          const isSelected = selectedAssetIds.includes(asset.id);
          return (
            <button
              key={asset.id}
              onClick={() => toggleAssetSelection(asset.id)}
              className={`relative p-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-orange-500/20 border-orange-500/50'
                  : 'bg-steel-850 border-steel-750 hover:border-steel-600'
              }`}
            >
              {/* Selection Indicator */}
              <div className="absolute top-2 right-2">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-orange-500 border-orange-500' : 'bg-steel-800 border-steel-600'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              </div>

              {/* Asset Image */}
              {asset.metadata?.image && (
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
                  <img src={asset.metadata.image} alt={asset.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Asset Info */}
              <p className="text-white font-medium text-sm truncate mb-1">{asset.name}</p>
              <p className="text-steel-400 text-xs font-mono truncate">
                {asset.policy_id?.slice(0, 8)}...{asset.policy_id?.slice(-6)}
              </p>

              {/* Stake ID for unstaking */}
              {!isStaking && asset.stake_id && (
                <p className="text-orange-400 text-xs mt-1">Stake ID: {asset.stake_id}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
