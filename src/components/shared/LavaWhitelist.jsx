import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const LavaWhitelist = ({
  required = true,
  label = 'Asset whitelist',
  itemPlaceholder = 'Enter Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
}) => {
  const addNewAsset = () => {
    if (whitelist.length >= maxItems) return;
    const newAssets = [...whitelist, {
      policyId: '',
      id: Date.now(),
    }];
    setWhitelist(newAssets);
  };

  const updateAsset = (id, val) => {
    const updatedAssets = whitelist.map(asset =>
      asset.id === id ? { ...asset, policyId: val } : asset,
    );
    setWhitelist(updatedAssets);
  };

  const removeAsset = (id) => {
    const filteredAssets = whitelist.filter(asset => asset.id !== id);
    setWhitelist(filteredAssets);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase text-[20px] font-bold">
          {required ? '*' : ''}{label}
        </div>
        <button
          className={`border-2 border-white/20 rounded-lg p-2 ${whitelist.length >= maxItems ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={whitelist.length >= maxItems}
          type="button"
          onClick={addNewAsset}
        >
          <img
            alt="add-icon"
            src="/assets/icons/plus.svg"
          />
        </button>
      </div>
      <div className="space-y-4">
        {whitelist.map((asset) => (
          <div key={asset.id} className="relative">
            <Input
              className="rounded-[10px] py-4 pl-5 pr-12 text-[20px] bg-input-bg border-dark-600 h-[60px]"
              placeholder={itemPlaceholder}
              style={{ fontSize: '20px' }}
              value={asset.policyId}
              onChange={(e) => updateAsset(asset.id, e.target.value)}
            />
            <Button
              className="h-8 w-8 rounded-full absolute right-4 top-1/2 transform -translate-y-1/2"
              size="icon"
              variant="ghost"
              onClick={() => removeAsset(asset.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {whitelist.length === 0 && (
        <div className="text-dark-100 text-base my-4">
          No items. Click the + button to add one.
        </div>
      )}
      {whitelist.length >= maxItems && (
        <div className="text-main-red text-base my-4">
          Maximum number of items ({maxItems}) reached.
        </div>
      )}
    </div>
  );
};
