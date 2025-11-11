import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { transactionOptionSchema } from '@/components/vaults/constants/proposal.constants.js';

const execOptions = [
  { value: 'SELL', label: 'SELL' },
  { value: 'BUY', label: 'BUY' },
];

const methodOptions = [
  { value: 'N/A', label: 'N/A' },
  { value: 'GTC', label: 'GTC' },
];

const sellTypeOptions = [
  { value: 'List', label: 'List' },
  { value: 'Market', label: 'Market' },
];

const validateOptions = options => {
  if (options.length === 0) return false;

  try {
    options.forEach(option => {
      transactionOptionSchema.validateSync(option);
    });
    return true;
  } catch {
    return false;
  }
};

const validateOption = option => {
  if (option) {
    try {
      transactionOptionSchema.validateSync(option);
      return true;
    } catch {
      return false;
    }
  }
};

export const BuyingSelling = ({ vaultId, onDataChange, error }) => {
  const [options, setOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [abstain, setAbstain] = useState(false);

  const { data: assetsData, isLoading } = useVaultAssetsForProposalByType(vaultId, 'buy-sell');

  const remainingAssets = useMemo(() => {
    if (!assetsData?.data) return [];
    const usedAssetNames = options.map(option => option.assetName).filter(Boolean);
    return assetsData.data.filter(asset => !usedAssetNames.includes(asset.name));
  }, [assetsData, options]);

  useEffect(() => {
    if (assetsData && !isLoading) {
      const formattedAssets = assetsData.data.map(asset => ({
        value: asset.name,
        label: asset.name,
        id: asset.id,
      }));

      setAssetOptions(formattedAssets);
    }
  }, [assetsData, isLoading]);

  useEffect(() => {
    onDataChange({
      buyingSellingOptions: options,
      abstain,
      isValid: validateOptions(options),
    });
  }, [options, onDataChange, abstain]);

  const handleOptionChange = (id, field, value) => {
    if (field === 'assetName') {
      const selectedAsset = assetOptions.find(option => option.value === value);
      setOptions(
        options.map(option =>
          option.id === id
            ? {
                ...option,
                [field]: value,
                assetId: selectedAsset?.id || null,
              }
            : option
        )
      );
    } else {
      setOptions(options.map(option => (option.id === id ? { ...option, [field]: value } : option)));
    }
  };

  const setFTMax = id => {
    const option = options.find(o => o.id === id);
    if (option && assetsData) {
      const asset = assetsData.data.find(a => a.name === option.assetName);
      if (asset) {
        setOptions(prev => prev.map(o => (o.id === id ? { ...o, quantity: String(asset.quantity) } : o)));
      }
    }
  };

  const getAvailableAmount = id => {
    const option = options.find(o => o.id === id);
    if (option && assetsData) {
      const asset = assetsData.data.find(a => a.name === option.assetName);
      return asset ? (+asset.quantity).toFixed(0) : 0;
    }

    return 0;
  };

  const handleAmountChange = (id, field, value) => {
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');

    if (value.includes('.')) {
      const [int, dec] = value.split('.');
      value = int + '.' + dec.slice(0, 2);
    }

    setOptions(options.map(option => (option.id === id ? { ...option, [field]: value } : option)));
  };

  const handleAddOption = () => {
    if (options.length >= 10 || remainingAssets.length === 0) return;

    setOptions([
      ...options,
      {
        id: Date.now(),
        assetName: '',
        exec: '',
        quantity: '',
        sellType: '',
        duration: '',
        isMax: false,
        method: 'N/A', // Default value
        market: 'WayUp', // Default value
        price: '',
      },
    ]);
  };

  const handleRemoveOption = id => setOptions(options.filter(option => option.id !== id));

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-medium">Transaction Options</h3>
        <button
          className="flex items-center justify-center gap-2 bg-steel-850 hover:bg-steel-850/70 text-white/60 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          type="button"
          disabled={options.length >= 10 || remainingAssets.length === 0}
          onClick={handleAddOption}
        >
          Add Option
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {options.length === 0 ? (
        <>
          {error && <p className="text-center text-red-600 font-bold py-8">Add options!</p>}
          {!error && <p className="text-center text-white/60 py-8">Start by clicking Add option</p>}
        </>
      ) : (
        <div className="space-y-8">
          {options.map((option, index) => {
            const isOverLimit = parseFloat(option.quantity) > getAvailableAmount(option.id);
            return (
              <div key={option.id}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <p className="font-medium">
                    Option {index + 1}{' '}
                    {error && !validateOption(option) && <span className="text-red-600 ml-2">Fill in all inputs!</span>}
                  </p>
                  <button
                    className="bg-red-600/10 hover:bg-red-600/20 text-red-600 text-sm px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
                <div className="relative bg-steel-800 p-4 rounded-[10px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Asset Name:</p>
                      <LavaSteelSelect
                        options={assetOptions.filter(
                          opt => opt.value === option.assetName || remainingAssets.some(a => a.name === opt.value)
                        )}
                        placeholder={isLoading ? 'Loading assets...' : 'Select asset'}
                        value={option.assetName}
                        onChange={value => handleOptionChange(option.id, 'assetName', value)}
                        isDisabled={isLoading}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Exec:</p>
                      <LavaSteelSelect
                        options={execOptions}
                        placeholder="Select type"
                        value={option.exec}
                        onChange={value => handleOptionChange(option.id, 'exec', value)}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between gap-2 mb-2">
                        <p className="text-sm text-gray-400 ">Quantity</p>
                        <label className="flex items-center gap-2 text-sm text-gray-400 whitespace-nowrap">
                          max: {getAvailableAmount(option.id)}{' '}
                          <input
                            type="checkbox"
                            checked={option.isMax}
                            onChange={() => setFTMax(option.id)}
                            className="rounded border-steel-600 bg-steel-700 text-orange-500 focus:ring-orange-500"
                          />
                        </label>
                      </div>
                      <div className="relative">
                        <LavaSteelInput
                          type="number"
                          min="0"
                          placeholder="0.00"
                          value={option.quantity}
                          onChange={value => {
                            const numValue = parseFloat(value);
                            if (value === '' || (numValue >= 0 && numValue <= getAvailableAmount(option.id))) {
                              handleOptionChange(option.id, 'quantity', value);
                            }
                          }}
                          className={`${isOverLimit ? '!border-red-500/60' : ''} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = (parseFloat(option.quantity) || 0) + 1;
                              if (newValue <= getAvailableAmount(option.id)) {
                                handleOptionChange(option.id, 'quantity', newValue.toString());
                              }
                            }}
                            className="p-0.5 hover:bg-steel-600 rounded transition-colors"
                          >
                            <ChevronUp className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = Math.max(0, (parseFloat(option.quantity) || 0) - 1);
                              handleOptionChange(option.id, 'quantity', newValue.toString());
                            }}
                            className="p-0.5 hover:bg-steel-600 rounded transition-colors"
                          >
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Sell Type</p>
                      <LavaSteelSelect
                        options={sellTypeOptions}
                        placeholder="Select type"
                        value={option.sellType}
                        onChange={value => handleOptionChange(option.id, 'sellType', value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Method</p>
                      <LavaSteelSelect
                        options={methodOptions}
                        placeholder="Select method"
                        value={option.method}
                        onChange={value => handleOptionChange(option.id, 'method', value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 -mb-2">Duration</p>
                      <LavaIntervalPicker
                        placeholder="Select"
                        value={option.duration}
                        variant="steel"
                        onChange={value => handleOptionChange(option.id, 'duration', value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Market</p>
                      <LavaSteelSelect
                        placeholder="Select market"
                        value={option.market}
                        onChange={value => handleOptionChange(option.id, 'market', value)}
                        options={[{ value: 'WayUp', label: 'WayUp' }]}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Price</p>
                      <div className="relative">
                        <LavaSteelInput
                          type="number"
                          min="0"
                          placeholder="0.00"
                          value={option.price}
                          onChange={value => handleAmountChange(option.id, 'price', value)}
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = (parseFloat(option.price) || 0) + 0.1;
                              handleAmountChange(option.id, 'price', newValue.toFixed(1));
                            }}
                            className="p-0.5 hover:bg-steel-600 rounded transition-colors"
                          >
                            <ChevronUp className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = Math.max(0, (parseFloat(option.price) || 0) - 0.1);
                              handleAmountChange(option.id, 'price', newValue.toFixed(1));
                            }}
                            className="p-0.5 hover:bg-steel-600 rounded transition-colors"
                          >
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {abstain && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <p className="font-medium">Option {options.length + 1}</p>
              </div>
              <div className="relative bg-steel-800 p-4 rounded-[10px]">
                <p className="font-medium">Do nothing</p>
              </div>
            </div>
          )}
        </div>
      )}
      <LavaCheckbox
        checked={abstain}
        label="Abstain"
        labelClassName="text-[20px]"
        onChange={e => setAbstain(e.target.checked)}
      />
    </>
  );
};
