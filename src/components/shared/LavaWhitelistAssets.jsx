import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const LavaWhitelistAssets = ({
  whitelistedAssets = [],
  setWhitelistedAssets,
}) => {
  const addNewAsset = () => {
    const newAssets = [...whitelistedAssets, {
      policyId: '',
      id: Date.now(),
    }];
    setWhitelistedAssets(newAssets);
  };

  const updateAsset = (id, val) => {
    const updatedAssets = whitelistedAssets.map(asset =>
      asset.id === id ? { ...asset, policyId: val } : asset,
    );
    setWhitelistedAssets(updatedAssets);
  };

  const removeAsset = (id) => {
    const filteredAssets = whitelistedAssets.filter(asset => asset.id !== id);
    setWhitelistedAssets(filteredAssets);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase text-[20px] font-bold">
          *ASSET WHITELIST
        </div>
        <button
          className="border-2 border-white/20 rounded-lg p-2"
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
        {whitelistedAssets.map((asset) => (
          <div key={asset.id} className="relative">
            <Input
              className="rounded-[10px] py-4 pl-5 pr-12 text-[20px] bg-input-bg border-dark-600 h-[60px]"
              placeholder="Enter Policy ID"
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
      {whitelistedAssets.length === 0 && (
        <div className="text-dark-100 text-base mb-2">
          No assets whitelisted. Click the + button to add one.
        </div>
      )}
    </div>
  );
};
