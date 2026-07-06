import { useState, useMemo } from 'react';
import { Search, Plus, Minus, CheckCircle2, Package } from 'lucide-react';
import { useEligibleRelicsAssets, useStakedRelicsAssets } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';

export const RelicsStakingProposalForm = ({ vault, proposalType, onPayloadChange }) => {
  const isStaking = proposalType === 'relics_staking';

  // Fetch data based on proposal type
  const { data: eligibleAssets, isLoading: loadingEligible } = useEligibleRelicsAssets(vault.id, 'anvil-relics');
  const { data: stakedAssets, isLoading: loadingStaked } = useStakedRelicsAssets(vault.id, 'anvil-relics');

  const isLoading = isStaking ? loadingEligible : loadingStaked;
  const assets = isStaking ? eligibleAssets?.assets || [] : stakedAssets?.assets || [];

  // Form state
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [stakeAll, setStakeAll] = useState(false);
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

  const handleStakeAllChange = checked => {
    setStakeAll(checked);
    if (checked) {
      // If stake all is enabled, clear individual selections
      setSelectedAssetIds([]);
    }
  };

  // Build payload when selections change
  useMemo(() => {
    const payload = {
      relicsStakingActions: [
        {
          action: isStaking ? 'stake' : 'unstake',
          platform: 'anvil-relics',
          stakeCollectionId: 54, // Relics collection ID on Anvil
          ...(isStaking && stakeAll
            ? { stakeAll: true }
            : isStaking
            ? { assetIds: selectedAssetIds }
            : { stakeIds: selectedAssetIds.map(id => {
                const asset = assets.find(a => a.id === id);
                return asset?.stake_id;
              }).filter(Boolean) }),
          ...(isStaking ? {} : { claimRewards: true }), // Always claim rewards on unstake
        },
      ],
    };

    onPayloadChange?.(payload);
  }, [selectedAssetIds, stakeAll, isStaking, assets, onPayloadChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-steel-800 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-steel-500" />
        </div>
        <p className="text-steel-400">
          {isStaking
            ? 'No eligible Relics NFTs available for staking. Extract assets from vault to treasury first.'
            : 'No staked Relics NFTs available for unstaking.'}
        </p>
      </div>
    );
  }

  // Calculate batch info (Anvil allows up to 50 NFTs per transaction)
  const totalSelected = stakeAll ? assets.length : selectedAssetIds.length;
  const batchSize = 50;
  const numBatches = Math.ceil(totalSelected / batchSize);

  return (
    <div className="space-y-4">
      {/* Stake All Option (for staking only) */}
      {isStaking && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={stakeAll}
              onChange={e => handleStakeAllChange(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-steel-600 bg-steel-800 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">Stake All Eligible Assets</p>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-steel-400 mt-1">
                Stake all {assets.length} Relics NFTs in a single proposal. Assets will be batched into transactions of
                50 NFTs each.
              </p>
              {stakeAll && numBatches > 1 && (
                <p className="text-xs text-purple-400 mt-2">
                  ⚡ This will create {numBatches} transactions ({batchSize} NFTs each)
                </p>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steel-500" />
        <input
          type="text"
          placeholder="Search by name, policy ID, or unit..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-steel-850 border border-steel-750 rounded-xl text-white placeholder-steel-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Selection Controls */}
      {!stakeAll && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-steel-400">
            {selectedAssetIds.length} of {filteredAssets.length} selected
          </p>
          <div className="flex gap-2">
            <SecondaryButton onClick={selectAll} className="text-sm">
              <Plus className="w-4 h-4" />
              Select All
            </SecondaryButton>
            {selectedAssetIds.length > 0 && (
              <SecondaryButton onClick={deselectAll} className="text-sm">
                <Minus className="w-4 h-4" />
                Deselect All
              </SecondaryButton>
            )}
          </div>
        </div>
      )}

      {/* Batch Preview */}
      {!stakeAll && selectedAssetIds.length > 0 && (
        <div className="bg-steel-850 border border-steel-750 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Batch Preview</p>
              <p className="text-xs text-steel-400 mt-1">
                {selectedAssetIds.length} {isStaking ? 'NFTs' : 'stakes'} selected
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-400">{numBatches} Transaction(s)</p>
              <p className="text-xs text-steel-400 mt-1">
                {numBatches > 1 ? `Up to ${batchSize} per transaction` : 'Single transaction'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      {!stakeAll && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
          {filteredAssets.map(asset => {
            const isSelected = selectedAssetIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                onClick={() => toggleAssetSelection(asset.id)}
                className={`relative p-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-steel-850 border-steel-750 hover:border-steel-600'
                }`}
              >
                {/* Selection Indicator */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'bg-steel-800 border-steel-600'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Asset Image */}
                {asset.metadata?.image && (
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
                    <img
                      src={asset.metadata.image}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Asset Info */}
                <p className="text-white font-medium text-sm truncate mb-1">{asset.name}</p>
                <p className="text-steel-400 text-xs font-mono truncate">
                  {asset.policy_id?.slice(0, 8)}...{asset.policy_id?.slice(-6)}
                </p>

                {/* Stake ID for unstaking */}
                {!isStaking && asset.stake_id && (
                  <p className="text-purple-400 text-xs mt-1">Stake ID: {asset.stake_id}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Stake All Summary */}
      {stakeAll && (
        <div className="bg-steel-850 border border-steel-750 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xl font-semibold text-white mb-2">Staking All {assets.length} Relics NFTs</p>
          <p className="text-steel-400 text-sm">
            Assets will be automatically batched into {numBatches} transaction{numBatches > 1 ? 's' : ''} for
            efficient execution
          </p>
        </div>
      )}

      {/* Validation Message */}
      {!stakeAll && totalSelected === 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <p className="text-orange-400 text-sm">
            Please select at least one {isStaking ? 'asset' : 'stake'} or enable "Stake All"
          </p>
        </div>
      )}
    </div>
  );
};
