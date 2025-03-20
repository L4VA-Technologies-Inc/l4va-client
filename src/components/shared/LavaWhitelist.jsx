import { X, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { CoreApiProvider } from '@/services/api/core';

export const LavaWhitelist = ({
  required = true,
  label = 'Asset whitelist',
  itemPlaceholder = 'Enter Policy ID',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  allowCsv = true,
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

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const { data } = await CoreApiProvider.handleCsv(file);
      const newAssets = data.policyIds.map(policyId => ({
        policyId,
        id: Date.now() + Math.random(),
      }));

      const totalItems = whitelist.length + newAssets.length;
      if (totalItems > maxItems) {
        toast.error(`Cannot add more than ${maxItems} items`);
        return;
      }

      setWhitelist([...whitelist, ...newAssets]);
      toast.success('CSV file processed successfully');
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error('Failed to process CSV file');
    }

    // Clear the input
    event.target.value = '';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase text-[20px] font-bold">
          {required ? '*' : ''}{label}
        </div>
        <div className="flex gap-2">
          {allowCsv && (
            <>
              <input
                accept=".csv"
                className="hidden"
                id="csv-upload"
                type="file"
                onChange={handleCsvUpload}
              />
              <label
                className={`border-2 border-white/20 rounded-lg w-[36px] h-[36px] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors ${whitelist.length >= maxItems ? 'opacity-50 cursor-not-allowed' : ''}`}
                htmlFor="csv-upload"
              >
                <Upload className="w-4 h-4" />
              </label>
            </>
          )}
          <button
            className={`border-2 border-white/20 rounded-lg w-[36px] h-[36px] flex items-center justify-center hover:bg-white/5 transition-colors ${whitelist.length >= maxItems ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={whitelist.length >= maxItems}
            type="button"
            onClick={addNewAsset}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
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
          No items. Click the + button to add one {allowCsv ? 'or upload a CSV file' : ''}.
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
