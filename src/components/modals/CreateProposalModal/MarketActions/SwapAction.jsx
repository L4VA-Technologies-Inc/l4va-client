import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { LazyImage } from '@/components/shared/LazyImage';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { useSwappableAssets } from '@/services/api/queries';
import { getIPFSUrl } from '@/utils/core.utils';

const SwapAction = ({ vaultId, onDataChange, error }) => {
  const [swapActions, setSwapActions] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const { data: swappableData, isLoading } = useSwappableAssets(vaultId);

  useEffect(() => {
    onDataChange({
      marketplaceActions: swapActions,
      isValid: swapActions.length > 0 && swapActions.every(action => validateSwapAction(action)),
    });
  }, [swapActions, onDataChange]);

  const validateSwapAction = action => {
    if (!action.assetId || !action.quantity) return false;
    const qty = parseFloat(action.quantity);
    if (isNaN(qty) || qty <= 0) return false;
    if (action.slippage < 0.5 || action.slippage > 5) return false;
    return true;
  };

  const availableAssets = useMemo(() => {
    if (!swappableData?.data) return [];
    return swappableData.data.filter(asset => !selectedAssets.has(asset.id));
  }, [swappableData, selectedAssets]);

  const handleSelectAsset = asset => {
    const newAction = {
      id: Date.now() + Math.random(),
      assetId: asset.id,
      assetName: asset.name,
      assetImage: asset.image,
      availableQuantity: asset.quantity,
      currentPriceAda: asset.currentPriceAda,
      quantity: '',
      slippage: 0.5,
      market: 'DexHunter',
      exec: 'SELL',
    };

    setSwapActions([...swapActions, newAction]);
    setSelectedAssets(new Set([...selectedAssets, asset.id]));
  };

  const handleRemoveAction = (id, assetId) => {
    setSwapActions(swapActions.filter(action => action.id !== id));
    const newSelected = new Set(selectedAssets);
    newSelected.delete(assetId);
    setSelectedAssets(newSelected);
  };

  const handleQuantityChange = (id, value) => {
    setSwapActions(
      swapActions.map(action => {
        if (action.id === id) {
          // Only allow positive numbers
          const cleanValue = value.replace(/[^0-9.]/g, '');
          const parts = cleanValue.split('.');
          const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;

          return { ...action, quantity: finalValue };
        }
        return action;
      })
    );
  };

  const handleSlippageChange = (id, value) => {
    const slippage = parseFloat(value);
    if (isNaN(slippage)) return;

    setSwapActions(
      swapActions.map(action =>
        action.id === id ? { ...action, slippage: Math.max(0.5, Math.min(5, slippage)) } : action
      )
    );
  };

  const calculateEstimatedOutput = action => {
    if (!action.quantity || !action.currentPriceAda) return null;
    const qty = parseFloat(action.quantity);
    if (isNaN(qty) || qty <= 0) return null;
    const output = qty * action.currentPriceAda * (1 - action.slippage / 100);
    return output.toFixed(2);
  };

  if (isLoading) {
    return <div className="text-white/60 text-center py-8">Loading swappable tokens...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Available Tokens Grid */}
      {availableAssets.length > 0 && (
        <div>
          <h4 className="text-white/80 font-medium mb-3">Available Tokens</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableAssets.map(asset => (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleSelectAsset(asset)}
                className="flex items-center gap-3 p-3 bg-steel-850 hover:bg-steel-800 border border-steel-750 rounded-lg transition-colors text-left"
              >
                <LazyImage
                  src={getIPFSUrl(asset.image)}
                  alt={asset.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  fallbackSrc="/assets/icons/ada.svg"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{asset.name}</div>
                  <div className="text-white/40 text-xs">
                    {asset.quantity} tokens
                    {asset.currentPriceAda && ` • ₳${asset.currentPriceAda.toFixed(4)}`}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-white/40 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Swaps */}
      {swapActions.length > 0 && (
        <div>
          <h4 className="text-white/80 font-medium mb-3">Swaps to Execute ({swapActions.length})</h4>
          <div className="space-y-3">
            {swapActions.map(action => {
              const estimatedOutput = calculateEstimatedOutput(action);
              const isValidQty =
                action.quantity &&
                parseFloat(action.quantity) > 0 &&
                parseFloat(action.quantity) <= action.availableQuantity;

              return (
                <div key={action.id} className="bg-steel-850 border border-steel-750 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <LazyImage
                      src={getIPFSUrl(action.assetImage)}
                      alt={action.assetName}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                      fallbackSrc="/assets/icons/ada.svg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">{action.assetName}</div>
                      <div className="text-white/40 text-sm">Available: {action.availableQuantity} tokens</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(action.id, action.assetId)}
                      className="p-1 hover:bg-steel-800 rounded transition-colors"
                    >
                      <X className="h-5 w-5 text-white/40 hover:text-white/60" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Quantity Input */}
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Quantity to Swap</label>
                      <LavaSteelInput
                        type="text"
                        value={action.quantity}
                        onChange={e => handleQuantityChange(action.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(action.id, action.availableQuantity.toString())}
                        className="text-xs text-orange-500 hover:text-orange-400 mt-1"
                      >
                        Use Max ({action.availableQuantity})
                      </button>
                    </div>

                    {/* Slippage Input */}
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Slippage Tolerance (0.5%-5%)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.1"
                          value={action.slippage}
                          onChange={e => handleSlippageChange(action.id, e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-white text-sm font-medium w-12 text-right">
                          {action.slippage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Output */}
                  {isValidQty && estimatedOutput && (
                    <div className="mt-4 pt-4 border-t border-steel-750">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Estimated Output:</span>
                        <span className="text-white font-medium">~{estimatedOutput} ₳</span>
                      </div>
                      {action.currentPriceAda && (
                        <div className="text-xs text-white/40 mt-1 text-right">
                          Current Price: ₳{action.currentPriceAda.toFixed(4)} per token
                        </div>
                      )}
                    </div>
                  )}

                  {action.quantity && !isValidQty && (
                    <div className="mt-3 text-xs text-red-400">
                      Invalid quantity. Must be between 1 and {action.availableQuantity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {swapActions.length === 0 && availableAssets.length === 0 && (
        <div className="text-center py-8 text-white/40">No fungible tokens available for swapping</div>
      )}

      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
};

export default SwapAction;
