import { useEffect, useMemo, useState } from 'react';
import { Plus, X, ExternalLink, Check } from 'lucide-react';

import { LazyImage } from '@/components/shared/LazyImage';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { useSwappableAssets } from '@/services/api/queries';
import { getIPFSUrl, formatAdaPrice } from '@/utils/core.utils';

/**
 * Check if a quantity is valid using precomputed combinations from backend
 */
const isValidCombination = (quantity, validCombinations) => {
  if (!validCombinations || validCombinations.length === 0) return false;
  // Use tolerance for floating point comparison
  return validCombinations.some(c => Math.abs(c - quantity) < 0.001);
};

const SwapAction = ({ vaultId, onDataChange, error }) => {
  const [swapActions, setSwapActions] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const { data: swappableData, isLoading } = useSwappableAssets(vaultId);

  useEffect(() => {
    onDataChange({
      swapActions: swapActions,
      isValid: swapActions.length > 0 && swapActions.every(action => validateSwapAction(action)),
    });
  }, [swapActions, onDataChange]);

  const validateSwapAction = action => {
    if (!action.assetId || !action.quantity) return false;
    const qty = parseFloat(action.quantity);
    if (isNaN(qty) || qty <= 0) return false;
    if (action.slippage < 0.5 || action.slippage > 5) return false;

    // Validate that quantity is a valid combination using precomputed values
    if (!isValidCombination(qty, action.validCombinations)) return false;

    // Validate custom price if not using market price
    if (!action.useMarketPrice) {
      const customPrice = parseFloat(action.customPriceAda);
      if (!action.customPriceAda || isNaN(customPrice) || customPrice <= 0) return false;
    }

    return true;
  };

  const availableAssets = useMemo(() => {
    if (!swappableData?.data) return [];
    return swappableData.data.filter(asset => !selectedAssets.has(asset.id));
  }, [swappableData, selectedAssets]);

  const handleSelectAsset = asset => {
    const availableAmounts = asset.availableAmounts || [asset.quantity];
    const validCombinations = asset.validCombinations || [asset.quantity];
    const newAction = {
      id: Date.now() + Math.random(),
      assetId: asset.id,
      assetName: asset.name,
      assetImage: asset.image,
      assetUnit: asset.unit, // Store unit for DexHunter link
      availableQuantity: asset.quantity,
      availableAmounts: availableAmounts, // Individual asset quantities
      validCombinations: validCombinations, // Precomputed valid combinations from backend
      currentPriceAda: Number(asset.currentPriceAda) || 0,
      // Default to full amount
      quantity: asset.quantity.toString(),
      slippage: 0.5,
      useMarketPrice: true, // Default to market price
      customPriceAda: '',
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
    // Only allow positive numbers
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;

    setSwapActions(swapActions.map(action => (action.id === id ? { ...action, quantity: finalValue } : action)));
  };

  const handleQuickQuantitySelect = (id, quantity) => {
    setSwapActions(
      swapActions.map(action => (action.id === id ? { ...action, quantity: quantity.toString() } : action))
    );
  };

  const handleSlippageChange = (id, value) => {
    const slippage = parseFloat(value) || 0.5;
    setSwapActions(swapActions.map(action => (action.id === id ? { ...action, slippage } : action)));
  };

  const handlePriceModeChange = (id, useMarketPrice) => {
    setSwapActions(
      swapActions.map(action => (action.id === id ? { ...action, useMarketPrice, customPriceAda: '' } : action))
    );
  };

  const handleCustomPriceChange = (id, value) => {
    // Only allow positive numbers
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;

    setSwapActions(swapActions.map(action => (action.id === id ? { ...action, customPriceAda: finalValue } : action)));
  };

  const calculateEstimatedOutput = action => {
    if (!action.quantity) return null;
    const qty = parseFloat(action.quantity);
    if (isNaN(qty) || qty <= 0) return null;

    // Use custom price if set, otherwise use current market price
    const priceToUse = action.useMarketPrice
      ? action.currentPriceAda
      : parseFloat(action.customPriceAda) || action.currentPriceAda;

    if (!priceToUse) return null;

    const output = qty * priceToUse * (1 - action.slippage / 100);
    return output.toFixed(2);
  };

  if (isLoading) {
    return <div className="text-white/60 text-center py-8">Loading swappable tokens...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-steel-850 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-500 text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <h5 className="text-orange-500 font-medium text-sm mb-1">Swap Requirements</h5>
            <p className="text-white/60 text-xs leading-relaxed">
              Tokens must have liquidity pools on DexHunter with sufficient depth. Swap amounts must be{' '}
              <span className="text-orange-400 font-medium">valid combinations</span> of the available asset chunks. Use
              the quick select buttons or enter a valid sum of the available amounts.
            </p>
          </div>
        </div>
      </div>

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
                  <div className="text-white/40 text-xs">{asset.quantity} tokens</div>
                  {asset.currentPriceAda && (
                    <div className="text-green-400/80 text-xs font-medium mt-0.5">
                      Total: ₳{formatAdaPrice(Number(asset.quantity) * Number(asset.currentPriceAda))}
                    </div>
                  )}
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
              const isValidSlippage = action.slippage >= 0.5 && action.slippage <= 5;
              const currentQty = parseFloat(action.quantity) || 0;
              const isValidQty = isValidCombination(currentQty, action.validCombinations);
              // Show quick select buttons for individual amounts and max
              const quickAmounts = [...new Set([...action.availableAmounts, action.availableQuantity])].sort(
                (a, b) => a - b
              );

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
                      <div className="text-white/50 text-sm">Total available: {action.availableQuantity} tokens</div>
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
                    {/* Quantity Selection */}
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Quantity to Swap</label>
                      <LavaSteelInput
                        type="text"
                        value={action.quantity}
                        onChange={value => handleQuantityChange(action.id, value)}
                        placeholder="Enter amount"
                        className="w-full"
                      />

                      {/* Quick select buttons */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {quickAmounts.map((amount, idx) => {
                          const isSelected = Math.abs(currentQty - amount) < 0.001;
                          const isMax = amount === action.availableQuantity;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleQuickQuantitySelect(action.id, amount)}
                              className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-steel-700 text-white/70 hover:bg-steel-600'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {amount}
                              {isMax && <span className="text-[10px] opacity-70">(max)</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Validation message */}
                      {action.quantity && !isValidQty ? (
                        <div className="text-xs text-red-400 mt-2">
                          Invalid amount. Select from: {action.validCombinations.slice(0, 8).join(', ')}
                          {action.validCombinations.length > 8 && '...'}
                        </div>
                      ) : (
                        <div className="text-xs text-white/40 mt-2">
                          Available chunks: [{action.availableAmounts?.join(', ')}]
                        </div>
                      )}
                    </div>

                    {/* Slippage Input */}
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Slippage Tolerance (%)</label>
                      <LavaSteelInput
                        type="number"
                        value={action.slippage}
                        onChange={value => handleSlippageChange(action.id, value)}
                        placeholder="0.5"
                        step="0.1"
                        min="0.5"
                        max="5"
                        className="w-full"
                      />
                      {!isValidSlippage ? (
                        <div className="text-xs text-red-400 mt-1">Must be between 0.5% and 5%</div>
                      ) : (
                        <div className="text-xs text-white/40 mt-1">Range: 0.5% - 5%</div>
                      )}
                    </div>
                  </div>

                  {/* Price Mode Selection */}
                  <div className="mt-4 pt-4 border-t border-steel-750 space-y-3">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Price Mode</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={action.useMarketPrice}
                            onChange={() => handlePriceModeChange(action.id, true)}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 focus:ring-offset-steel-900"
                          />
                          <span className="text-sm text-white">Market Price (at execution)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!action.useMarketPrice}
                            onChange={() => handlePriceModeChange(action.id, false)}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 focus:ring-offset-steel-900"
                          />
                          <span className="text-sm text-white">Custom Price</span>
                        </label>
                      </div>
                    </div>

                    {!action.useMarketPrice && (
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Custom Price (₳ per token)</label>
                        <LavaSteelInput
                          type="text"
                          value={action.customPriceAda}
                          onChange={value => handleCustomPriceChange(action.id, value)}
                          placeholder={action.currentPriceAda ? formatAdaPrice(Number(action.currentPriceAda)) : '0.00'}
                          className="w-full"
                        />
                        <div className="text-xs text-white/40 mt-1">
                          Current market: ₳
                          {action.currentPriceAda ? formatAdaPrice(Number(action.currentPriceAda)) : 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Price & Estimated Output */}
                  <div className="mt-4 pt-4 border-t border-steel-750 space-y-2">
                    {action.currentPriceAda && action.useMarketPrice && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/60">Current Price:</span>
                          <span className="text-white font-medium">
                            ₳{formatAdaPrice(Number(action.currentPriceAda))} per token
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/40">Price Source:</span>
                          <span className="text-white/60">DexHunter</span>
                        </div>
                      </>
                    )}
                    {!action.useMarketPrice && action.customPriceAda && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Your Limit Price:</span>
                        <span className="text-orange-400 font-medium">
                          ₳{formatAdaPrice(parseFloat(action.customPriceAda))} per token
                        </span>
                      </div>
                    )}
                    {estimatedOutput && (
                      <>
                        <div className="flex justify-between items-center text-sm pt-2">
                          <span className="text-white/60">Estimated Output:</span>
                          <span className="text-green-400 font-medium text-base">~₳{estimatedOutput}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/40">Minimum Received:</span>
                          <span className="text-orange-400 font-medium">
                            ₳{formatAdaPrice(parseFloat(estimatedOutput) * 0.99)}
                          </span>
                        </div>
                        <div className="text-xs text-white/40 text-right">
                          After {action.slippage}% slippage tolerance
                        </div>
                      </>
                    )}

                    {/* DexHunter Link */}
                    {action.assetUnit && (
                      <div className="pt-2 mt-2 border-t border-steel-750">
                        <a
                          href={`https://app.dexhunter.io/swap?tokenIdSell=&tokenIdBuy=${action.assetUnit}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View on DexHunter</span>
                        </a>
                      </div>
                    )}
                  </div>
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
