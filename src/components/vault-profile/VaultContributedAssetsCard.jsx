import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

import { substringAddress, formatAdaPrice } from '@/utils/core.utils.js';

const AssetCard = ({ asset, isExpanded, onClick, currencySymbol, isAda }) => {
  const handleCopy = (e, text, message) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const imageUrl = asset.imageUrl ? asset.imageUrl : '/assets/icons/ada.svg';
  const assetName = asset.name || (asset.assetId === 'lovelace' ? 'ADA' : substringAddress(asset.assetId));

  const calculateValue = () => {
    const quantity = asset.quantity || 0;
    const price = isAda ? parseFloat(asset.floorPrice || 0) : parseFloat(asset.floorPriceUsd || 0);
    return formatAdaPrice(quantity * price);
  };

  return (
    <div
      className={`rounded-2xl border border-steel-750 transition-all duration-300 ${
        isExpanded ? 'bg-steel-750' : 'bg-steel-850'
      }`}
    >
      <div
        className={`flex rounded-2xl items-center justify-between p-4 cursor-pointer ${
          isExpanded ? '' : 'hover:bg-steel-750'
        } transition-colors duration-300`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <img alt={assetName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" src={imageUrl} />
          <p className="font-medium text-white truncate">{assetName}</p>
        </div>

        <button
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
          type="button"
        >
          {isExpanded ? (
            <ChevronUp className="transition-transform duration-200" size={24} />
          ) : (
            <ChevronDown className="transition-transform duration-200" size={24} />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-steel-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p className="font-medium text-gray-300">Type:</p>
              <p className="capitalize">{asset.type}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Status:</p>
              <p className="capitalize">{asset.status}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Origin:</p>
              <p className="capitalize">{asset.originType}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Quantity:</p>
              <p>{asset.quantity}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Value:</p>
              <p>
                {currencySymbol}
                {calculateValue()}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Added At:</p>
              <p>{new Date(asset.addedAt).toLocaleDateString()}</p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-300">Policy ID:</p>
              <div className="flex items-center gap-2">
                <p className="break-all">{substringAddress(asset.policyId)}</p>
                <button
                  onClick={e => handleCopy(e, asset.policyId, 'Policy ID copied')}
                  className="p-1 hover:bg-steel-850 rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-300">Asset ID:</p>
              <div className="flex items-center gap-2">
                <p className="break-all">{substringAddress(asset.assetId)}</p>
                <button
                  onClick={e => handleCopy(e, asset.assetId, 'Asset ID copied')}
                  className="p-1 hover:bg-steel-850 rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-300">Updated At:</p>
              <p>{new Date(asset.updatedAt).toLocaleDateString()}</p>
            </div>

            {asset?.description && (
              <div className="col-span-2">
                <p className="font-medium text-gray-300">Description:</p>
                <p className="text-gray-300">{asset.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const VaultContributedAssetsCard = ({ assets, currencySymbol, isAda }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);

  return (
    <div className="md:hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id || index}
          asset={asset}
          isExpanded={expandedAsset === index}
          onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
          currencySymbol={currencySymbol}
          isAda={isAda}
        />
      ))}
    </div>
  );
};
