import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaMultiSelect, LavaSteelSelect } from '@/components/shared/LavaSelect';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { transactionOptionSchema } from '@/components/vaults/constants/proposal.constants.js';

const methodOptions = [
  { value: 'N/A', label: 'Time Limit' },
  { value: 'GTC', label: 'GTC' },
];

const sellTypeOptions = [
  { value: 'List', label: 'List' },
  { value: 'Market', label: 'Market' },
];

const buyTypeOptions = [
  { value: 'Offer', label: 'Offer' },
  { value: 'Buy', label: 'Buy' },
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

const validateOption = (option, isBuyType = false) => {
  if (option) {
    try {
      transactionOptionSchema.validateSync(option);
      return !(isBuyType && (!option.assetId || option.assetId.length < 56));
    } catch {
      return false;
    }
  }
};

const TransactionAction = ({ vaultId, onDataChange, error, execType, title = 'Transaction Options' }) => {
  const [options, setOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [abstain, setAbstain] = useState(false);

  const isBuyType = execType === 'BUY';

  const { data: assetsData, isLoading } = useVaultAssetsForProposalByType(vaultId, 'buy-sell');

  const remainingAssets = useMemo(() => {
    if (!assetsData?.data) return [];
    const usedAssetNames = options.map(option => option.assetName).filter(Boolean);
    return assetsData.data.filter(asset => !usedAssetNames.includes(asset.name));
  }, [assetsData, options]);

  const selectedAssets = useMemo(() => {
    return options.map(opt => (isBuyType ? opt.assetId : opt.assetName)).filter(Boolean);
  }, [options, isBuyType]);

  useEffect(() => {
    if (assetsData?.data && !isLoading) {
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
      isValid: validateOptions(options, isBuyType),
    });
  }, [options, onDataChange, abstain, isBuyType]);

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
                exec: execType,
              }
            : option
        )
      );
    } else if (field === 'assetId') {
      setOptions(
        options.map(option =>
          option.id === id
            ? {
                ...option,
                assetId: value,
                assetName: value || '',
                exec: execType,
              }
            : option
        )
      );
    } else if (field === 'sellType') {
      setOptions(
        options.map(option => (option.id === id ? { ...option, [field]: value, price: '', exec: execType } : option))
      );
    } else if (field === 'method') {
      setOptions(
        options.map(option => (option.id === id ? { ...option, [field]: value, duration: '', exec: execType } : option))
      );
    } else {
      setOptions(options.map(option => (option.id === id ? { ...option, [field]: value, exec: execType } : option)));
    }
  };

  const setFTMax = (id, checked) => {
    const option = options.find(o => o.id === id);
    const asset = option && assetsData?.data ? assetsData.data.find(a => a.name === option.assetName) : null;

    setOptions(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              isMax: checked,
              quantity: checked ? String(asset?.quantity ?? '') : '',
            }
          : o
      )
    );
  };

  const getAvailableAmount = id => {
    const option = options.find(o => o.id === id);
    if (option && assetsData?.data) {
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

    if (Number(value) <= 0) {
      setOptions(options.map(option => (option.id === id ? { ...option, [field]: '' } : option)));
    }

    setOptions(options.map(option => (option.id === id ? { ...option, [field]: value } : option)));
  };

  const handleAddOption = selectedAssetValues => {
    if (options.length >= 10) return;

    if (selectedAssetValues && Array.isArray(selectedAssetValues)) {
      const newOptions = selectedAssetValues.map(assetValue => {
        const existingOption = options.find(opt =>
          isBuyType ? opt.assetId === assetValue : opt.assetName === assetValue
        );

        if (existingOption) {
          return existingOption;
        }

        const selectedAsset = assetOptions.find(opt => opt.value === assetValue);
        return {
          id: Date.now() + Math.random(),
          assetName: selectedAsset?.label || '',
          assetId: selectedAsset?.id || (isBuyType ? assetValue : null),
          exec: execType,
          quantity: '',
          sellType: '',
          duration: '',
          isMax: false,
          method: 'N/A',
          market: 'WayUp',
          price: '',
        };
      });

      setOptions(newOptions);
      return;
    }

    setOptions([
      ...options,
      {
        id: Date.now(),
        assetName: '',
        assetId: isBuyType ? '' : null,
        exec: execType,
        quantity: '',
        sellType: '',
        duration: '',
        isMax: false,
        method: 'N/A',
        market: 'WayUp',
        price: '',
      },
    ]);
  };

  const handleRemoveOption = id => setOptions(options.filter(option => option.id !== id));

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:w-auto w-[100%]">
          <button
            className="flex items-center justify-center gap-2 bg-steel-850 hover:bg-steel-850/70 text-white/60 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto border border-steel-750"
            type="button"
            disabled={options.length >= 10}
            onClick={handleAddOption}
          >
            Add Action
            <Plus className="h-4 w-4" />
          </button>
          {!isBuyType && (
            <LavaMultiSelect
              options={assetOptions.map(asset => ({
                label: asset.label,
                value: asset.value,
              }))}
              value={selectedAssets}
              placeholder="Add Multiple Tokens"
              onChange={handleAddOption}
              className="min-w-[250px]"
            />
          )}
        </div>
      </div>

      {options.length === 0 ? (
        <>
          {error && <p className="text-center text-red-600 font-bold py-8">Add actions!</p>}
          {!error && <p className="text-center text-white/60 py-8">Start by clicking Add action</p>}
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
                    {error && !validateOption(option, isBuyType) && (
                      <span className="text-red-600 ml-2">
                        {isBuyType && option.assetId && option.assetId.length > 0 && option.assetId.length < 56
                          ? 'Asset ID must be at least 56 characters!'
                          : 'Fill in all inputs!'}
                      </span>
                    )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-gray-400">{isBuyType ? 'Asset ID:' : 'Asset Name:'}</p>
                        {isBuyType && (
                          <a
                            href="https://www.wayup.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-400 hover:underline"
                          >
                            Find on WayUp
                          </a>
                        )}
                      </div>
                      {isBuyType ? (
                        <div>
                          <LavaSteelInput
                            type="text"
                            placeholder="Enter asset ID"
                            value={option.assetId || ''}
                            onChange={value => handleOptionChange(option.id, 'assetId', value)}
                            className={
                              option.assetId && option.assetId.length > 0 && option.assetId.length < 56
                                ? '!border-red-500/60'
                                : ''
                            }
                          />
                          {option.assetId && option.assetId.length > 0 && option.assetId.length < 56 && (
                            <p className="text-xs text-red-500 mt-1">Asset ID must be at least 56 characters</p>
                          )}
                        </div>
                      ) : (
                        <LavaSteelSelect
                          options={assetOptions.filter(
                            opt => opt.value === option.assetName || remainingAssets.some(a => a.name === opt.value)
                          )}
                          placeholder={isLoading ? 'Loading assets...' : 'Select asset'}
                          value={option.assetName}
                          onChange={value => handleOptionChange(option.id, 'assetName', value)}
                          isDisabled={isLoading}
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between gap-2 mb-1">
                        <p className="text-sm text-gray-400 ">Quantity</p>
                        {!isBuyType && (
                          <LavaCheckbox
                            name={`max-${option.id}`}
                            checked={option.isMax}
                            label={`max: ${getAvailableAmount(option.id)}`}
                            className="whitespace-nowrap"
                            labelClassName="text-gray-400"
                            onChange={e => setFTMax(option.id, e.target.checked)}
                            disabled={!option.assetName}
                          />
                        )}
                      </div>
                      <div className="relative">
                        <LavaSteelInput
                          type="number"
                          min="0"
                          placeholder="0.00"
                          value={option.quantity}
                          onChange={value => {
                            if (isBuyType) {
                              const numValue = parseFloat(value);
                              if (value === '' || numValue >= 0) {
                                handleOptionChange(option.id, 'quantity', value);
                              }
                            } else {
                              const numValue = parseFloat(value);
                              if (value === '' || (numValue >= 0 && numValue <= getAvailableAmount(option.id))) {
                                handleOptionChange(option.id, 'quantity', value);
                              }
                            }
                          }}
                          className={`${!isBuyType && isOverLimit ? '!border-red-500/60' : ''} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = (parseFloat(option.quantity) || 0) + 1;
                              if (isBuyType || newValue <= getAvailableAmount(option.id)) {
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
                      <p className="text-sm text-gray-400 mb-2">{isBuyType ? 'Buy Type' : 'Sell Type'}</p>
                      <LavaSteelSelect
                        options={isBuyType ? buyTypeOptions : sellTypeOptions}
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
                        disabled={option.method === 'GTC'}
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
                          disabled={option.sellType === 'Market'}
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

export default TransactionAction;
