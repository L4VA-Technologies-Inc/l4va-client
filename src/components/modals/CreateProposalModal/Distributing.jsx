import { useCallback, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import { Button } from '@/components/button';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox.jsx';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';

export default function Distributing({ onDataChange, vaultId }) {
  const [distributionAssets, setDistributionAssets] = useState([]);
  const [distributeAll, setDistributeAll] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const { data, isLoading } = useVaultAssetsForProposalByType(vaultId, 'distribute');

  const removeAsset = id => {
    setDistributionAssets(prev => prev.filter(a => a.id !== id));
  };

  const updateAsset = (id, field, value) => {
    setDistributionAssets(prev => prev.map(asset => (asset.id === id ? { ...asset, [field]: value } : asset)));
  };

  const setMaxAmount = id => {
    const asset = distributionAssets.find(a => a.id === id);
    if (asset && asset.asset) {
      const availableAsset = availableAssets.find(a => a.value === asset.asset);
      if (availableAsset) {
        updateAsset(id, 'amount', availableAsset.available.toString());
        updateAsset(id, 'isMax', true);
      }
    }
  };

  const getAvailableAmount = assetValue => {
    const asset = availableAssets.find(a => a.value === assetValue);
    return asset ? asset.available : 0;
  };

  const getProgressPercentage = (amount, assetValue) => {
    const available = getAvailableAmount(assetValue);
    if (!available || !amount) return 0;
    return Math.min((parseFloat(amount) / available) * 100, 100);
  };

  const addAsset = () => {
    const newId = Math.max(...distributionAssets.map(a => a.id), 0) + 1;
    setDistributionAssets(prev => [...prev, { id: newId, asset: '', amount: '', isMax: false }]);
  };

  const distributeAllAssets = useCallback(() => {
    if (availableAssets) {
      const newAssets = availableAssets.map((a, index) => ({
        id: index + 1,
        asset: a.value,
        amount: a.available.toString(),
        isMax: true,
      }));

      setDistributionAssets(newAssets);
    }
  }, [availableAssets]);

  useEffect(() => {
    if (distributeAll) {
      distributeAllAssets();
    }
  }, [distributeAll, distributeAllAssets]);

  useEffect(() => {
    if (data?.data && !isLoading) {
      const formattedAssets = data.data.map(asset => {
        let label = asset.asset_id;
        // Special case for lovelace - show as ADA
        if (asset.asset_id === 'lovelace') {
          label = 'ADA';
        } else if (asset.type === 'nft' && asset.metadata?.onchainMetadata?.name) {
          // Use NFT name if available
          label = asset.metadata.onchainMetadata.name;
        }

        return {
          value: asset.id,
          label: label,
          available: parseFloat(asset.quantity),
          type: asset.type,
          policy_id: asset.policy_id,
          asset_id: asset.asset_id,
        };
      });

      setAvailableAssets(formattedAssets);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (onDataChange) {
      const formattedAssets = distributionAssets
        .filter(asset => asset.asset && asset.amount)
        .map(asset => {
          const selectedAsset = availableAssets.find(a => a.value === asset.asset);
          return {
            id: asset.asset,
            amount: parseFloat(asset.amount),
            policyId: selectedAsset?.policy_id,
            assetId: selectedAsset?.asset_id,
            type: selectedAsset?.type,
          };
        });

      onDataChange({
        distributionAssets: formattedAssets,
      });
    }
  }, [distributionAssets, onDataChange, availableAssets]);

  useEffect(() => {
    if (!distributeAll) {
      const selectedAssets = distributionAssets.map(a => a.asset).filter(Boolean);
      const allAssetsSelected =
        availableAssets.length > 0 &&
        selectedAssets.length === availableAssets.length &&
        availableAssets.every(a => selectedAssets.includes(a.value));

      if (allAssetsSelected) {
        setDistributeAll(true);
      }
    }
  }, [distributionAssets, availableAssets, distributeAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Distribution Assets</h3>
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            onClick={addAsset}
            disabled={distributionAssets.length >= availableAssets.length}
            className="flex items-center gap-2 px-4 py-2 bg-steel-0 hover:bg-steel-0 text-sm rounded-lg"
          >
            <div className="flex items-center px-1 py-1 bg-steel-750 hover:bg-steel-700 text-white rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-dark-100 text-sm mt-1">Add Asset</p>
          </Button>
          <LavaCheckbox
            type="button"
            className="px-4 py-2 bg-steel-600 hover:bg-steel-500 text-white text-sm rounded-lg"
            checked={distributeAll}
            onChange={e => setDistributeAll(e.target.checked)}
            description="Distribute All Assets"
          ></LavaCheckbox>
        </div>
      </div>

      <div className="space-y-4">
        {distributionAssets.map(asset => {
          const availableAmount = getAvailableAmount(asset.asset);
          const progressPercentage = getProgressPercentage(asset.amount, asset.asset);
          const isOverLimit = parseFloat(asset.amount) > availableAmount;

          return (
            <div key={asset.id} className="bg-steel-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-sm text-white/60 w-12">Asset</div>
                  <div className="w-48">
                    <LavaSteelSelect
                      options={availableAssets.filter(
                        a =>
                          !distributionAssets.some(
                            selectedAsset => selectedAsset.asset === a.value && selectedAsset.id !== asset.id
                          )
                      )}
                      value={asset.asset}
                      onChange={value => {
                        updateAsset(asset.id, 'asset', value);
                        if (asset.isMax) {
                          setMaxAmount(asset.id);
                        }
                      }}
                      placeholder="Select asset"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div className="text-sm text-white/60 w-16">Quantity</div>
                  <div className="flex items-center gap-2 flex-1">
                    <LavaSteelInput
                      type="number"
                      placeholder="0.00"
                      value={asset.amount}
                      onChange={value => {
                        updateAsset(asset.id, 'amount', value);
                        updateAsset(asset.id, 'isMax', false);
                      }}
                      className={isOverLimit ? 'border-red-500/60' : ''}
                    />
                    <label className="flex items-center gap-2 text-sm text-white/60 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={asset.isMax}
                        onChange={e => {
                          if (e.target.checked) {
                            setMaxAmount(asset.id);
                          } else {
                            updateAsset(asset.id, 'isMax', false);
                          }
                        }}
                        className="rounded border-steel-600 bg-steel-700 text-orange-500 focus:ring-orange-500"
                      />
                      Max
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  {distributionAssets.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeAsset(asset.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-steel-700 rounded"
                      size="sm"
                      variant="ghost"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {asset.asset && isOverLimit && (
                <div className="text-xs text-red-400">
                  Amount exceeds available balance ({availableAmount.toLocaleString()})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {distributionAssets.length === 0 && (
        <div className="text-center py-8 text-white/60">No assets added. Click "Add Asset" to start distributing.</div>
      )}
    </div>
  );
}
