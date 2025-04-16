import { X, Plus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoreApiProvider } from '@/services/api/core';

export const LavaWhitelist = ({
  required = true,
  label = 'Asset whitelist',
  itemPlaceholder = 'Enter Policy ID',
  itemFieldName = 'policyId',
  whitelist = [],
  setWhitelist,
  maxItems = 10,
  allowCsv = false,
  csvData,
  setCsvData,
}) => {
  const [csvName, setCsvName] = useState(csvData?.fileName || '');
  const addNewAsset = () => {
    if (whitelist.length >= maxItems) return;
    const newAssets = [...whitelist, {
      [itemFieldName]: '',
      id: Date.now(),
    }];
    setWhitelist(newAssets);
  };

  const updateAsset = (id, val) => {
    const updatedAssets = whitelist.map(asset =>
      asset.id === id ? { ...asset, [itemFieldName]: val } : asset,
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
      if (setCsvData) {
        setCsvData(data);
        setCsvName(data.fileName);
      }
      toast.success('CSV file processed successfully');
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error('Failed to process CSV file');
    }
    event.target.value = '';
  };

  const handleRemoveCsv = () => {
    setCsvData(null);
    setCsvName(null);
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
                className="border-2 border-white/20 rounded-lg w-[36px] h-[36px] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
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
      {csvName && (
        <div className="flex items-center justify-between mb-4 p-3 bg-input-bg border-dark-600 rounded-[10px]">
          <span className="text-[20px]">{csvName}</span>
          <Button
            className="h-8 w-8 rounded-full"
            size="icon"
            variant="ghost"
            onClick={handleRemoveCsv}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {whitelist.map((asset) => (
          <div key={asset.id} className="relative">
            <Input
              className="rounded-[10px] py-4 pl-5 pr-12 text-[20px] bg-input-bg border-dark-600 h-[60px]"
              placeholder={itemPlaceholder}
              style={{ fontSize: '20px' }}
              value={asset[itemFieldName]}
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
      {whitelist.length === 0 && !csvData && (
        <div className="text-dark-100 text-base my-4">
          No items. Click the + button to add one {allowCsv ? 'or upload a CSV file' : ''}.
        </div>
      )}
      {whitelist.length >= maxItems && (
        <div className="text-red-600 text-base my-4">
          Maximum number of items ({maxItems}) reached.
        </div>
      )}
    </div>
  );
};
