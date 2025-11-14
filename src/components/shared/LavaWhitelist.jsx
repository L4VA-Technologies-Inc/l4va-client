import { X, Plus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoreApiProvider } from '@/services/api/core';

export const LavaWhitelist = ({
  required = true,
  label = 'Asset whitelist',
  itemPlaceholder = 'Enter Policy ID',
  itemFieldName = 'policyId',
  whitelistFieldName = 'assetsWhitelist',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  allowCsv = false,
  errors = {},
}) => {
  const csvInputId = `${whitelistFieldName}-csv-upload`;
  const addNewAsset = () => {
    if (whitelist.length >= maxItems) return;
    const newId = Date.now();
    const newAssets = [
      ...whitelist,
      {
        [itemFieldName]: '',
        id: newId,
      },
    ];
    setWhitelist(newAssets);
  };

  const updateAsset = (id, val) => {
    const updatedAssets = whitelist.map(asset => (asset.id === id ? { ...asset, [itemFieldName]: val } : asset));
    setWhitelist(updatedAssets);
  };

  const removeAsset = id => {
    const filteredAssets = whitelist.filter(asset => asset.id !== id);
    setWhitelist(filteredAssets);
  };

  const handleCsvUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const { data } = await CoreApiProvider.handleCsv(file);

      if (Array.isArray(data?.addresses) && data.addresses.length && typeof setWhitelist === 'function') {
        const normalized = data.addresses
          .map(address => (typeof address === 'string' ? address.trim() : ''))
          .filter(address => address.length > 0);

        const uniqueAddresses = Array.from(new Set(normalized));

        const existingValues = new Set(
          whitelist.map(item => (item[itemFieldName] || '').toString().trim().toLowerCase())
        );
        const newUniqueAddresses = uniqueAddresses.filter(address => !existingValues.has(address.toLowerCase()));

        if (newUniqueAddresses.length === 0) {
          toast.success('No new entries to add from CSV');
          return;
        }

        const availableSlots = Math.max(0, maxItems - whitelist.length);
        let addressesToUse = newUniqueAddresses;

        if (newUniqueAddresses.length > availableSlots) {
          addressesToUse = newUniqueAddresses.slice(0, availableSlots);
          toast.error(`Only ${addressesToUse.length} new item(s) were added to stay within the ${maxItems} limit.`);
        }

        if (addressesToUse.length === 0) {
          toast.error('Whitelist already contains the maximum number of items.');
          return;
        }

        const now = Date.now();
        const csvWhitelist = addressesToUse.map((address, index) => ({
          id: `${now}-${index}`,
          [itemFieldName]: address,
        }));

        setWhitelist([...whitelist, ...csvWhitelist]);
      }

      toast.success('CSV file processed successfully');
    } catch (error) {
      console.error('CSV upload error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to process CSV file';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
    event.target.value = '';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase font-bold">
          {required ? '*' : ''}
          {label}
        </div>
        <div className="flex gap-2">
          {allowCsv && (
            <>
              <input accept=".csv" className="hidden" id={csvInputId} type="file" onChange={handleCsvUpload} />
              <label
                className="border-2 border-white/20 rounded-lg w-[36px] h-[36px] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                htmlFor={csvInputId}
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
        {whitelist.map((asset, index) => {
          const fieldError = errors[`${whitelistFieldName}[${index}].${itemFieldName}`];
          return (
            <div key={asset.id} className="space-y-2">
              <div className="relative">
                <Input
                  className="rounded-[10px] py-4 pl-5 pr-12 bg-input-bg border-steel-850 h-[60px]"
                  placeholder={itemPlaceholder}
                  style={{ fontSize: '18px' }}
                  value={asset[itemFieldName]}
                  onChange={e => updateAsset(asset.id, e.target.value)}
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
              {fieldError && <p className="text-red-600 text-sm mt-1">{fieldError}</p>}
            </div>
          );
        })}
      </div>
      {whitelist.length === 0 && (
        <div className="text-dark-100 text-base my-4">
          No items. Click the + button to add one {allowCsv ? 'or upload a CSV file' : ''}.
        </div>
      )}
      {whitelist.length >= maxItems && (
        <div className="text-red-600 text-base my-4">Maximum number of items ({maxItems}) reached.</div>
      )}
    </div>
  );
};
