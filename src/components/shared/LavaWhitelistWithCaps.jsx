import { X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LavaInput } from '@/components/shared/LavaInput';

export const LavaWhitelistWithCaps = ({
  required = false,
  label = 'Asset whitelist',
  itemPlaceholder = 'Enter Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
}) => {
  const addNewAsset = () => {
    if (whitelist.length >= maxItems) return;
    const newAssets = [
      ...whitelist,
      {
        policyId: '',
        countCapMin: '',
        countCapMax: '',
        uniqueId: Date.now(),
      },
    ];
    setWhitelist(newAssets);
  };

  const updateAsset = (uniqueId, field, val) => {
    const updatedAssets = whitelist.map(asset => (asset.uniqueId === uniqueId ? { ...asset, [field]: val } : asset));
    setWhitelist(updatedAssets);
  };

  const removeAsset = uniqueId => {
    const filteredAssets = whitelist.filter(asset => asset.uniqueId !== uniqueId);
    setWhitelist(filteredAssets);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase font-bold mb-2">
          {required ? '*' : ''}
          {label}
        </div>
        <button
          className={`border-2 border-white/20 rounded-lg p-2 ${whitelist.length >= maxItems ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={whitelist.length >= maxItems}
          type="button"
          onClick={addNewAsset}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {whitelist.map(asset => (
          <div key={asset.id || asset.uniqueId} className="space-y-2">
            <div className="relative">
              <LavaInput
                placeholder={itemPlaceholder}
                style={{ fontSize: '20px' }}
                value={asset.policyId}
                onChange={e => updateAsset(asset.uniqueId, 'policyId', e.target.value)}
              />
              <Button
                className="h-8 w-8 rounded-full absolute right-4 top-1/2 transform -translate-y-1/2"
                size="icon"
                variant="ghost"
                onClick={() => removeAsset(asset.uniqueId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <LavaInput
                  type="number"
                  min="0"
                  placeholder="Min asset cap"
                  style={{ fontSize: '20px' }}
                  value={asset.countCapMin}
                  onChange={e =>
                    updateAsset(
                      asset.uniqueId,
                      'countCapMin',
                      e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>
              <div className="flex-1">
                <LavaInput
                  type="number"
                  min="0"
                  placeholder="Max asset cap"
                  style={{ fontSize: '20px' }}
                  value={asset.countCapMax}
                  onChange={e =>
                    updateAsset(
                      asset.uniqueId,
                      'countCapMax',
                      e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {whitelist.length === 0 && (
        <div className="text-dark-100 text-base my-4">No items. Click the + button to add one.</div>
      )}
      {whitelist.length >= maxItems && (
        <div className="text-red-600 text-base my-4">Maximum number of items ({maxItems}) reached.</div>
      )}
    </div>
  );
};
