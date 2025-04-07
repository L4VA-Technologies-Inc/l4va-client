import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { mockVaultAssets } from '@/mocks/vaultAssets';

export const VaultAssetsList = ({ assets = mockVaultAssets }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] mb-4 text-dark-100 text-sm px-4">
        <div>Image</div>
        <div>Name</div>
        <div>Value</div>
        <div>% Vault</div>
        <div className="text-right">Contribute</div>
      </div>
      <div className="space-y-2">
        {assets.map((asset, index) => (
          <div
            key={index}
            className={`rounded-lg transition-all duration-300 ${
              expandedAsset === index ? 'bg-steel-750' : 'bg-[#202233] hover:bg-steel-750'
            }`}
            onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
          >
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] items-center p-4 cursor-pointer">
              <div>
                <img
                  alt={asset.name}
                  className="w-12 h-12 rounded-lg"
                  src={asset.icon}
                />
              </div>
              <div className="font-medium">{asset.name}</div>
              <div>{asset.value} ADA</div>
              <div>{asset.vaultPercentage}%</div>
              <div className="flex items-center justify-end gap-6">
                <span>{asset.contribute} ADA</span>
                <button
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  type="button"
                >
                  {expandedAsset === index ? (
                    <ChevronUp className="transition-transform duration-200" size={20} />
                  ) : (
                    <ChevronDown className="transition-transform duration-200" size={20} />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedAsset === index ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="py-2 px-4">
                <p className="text-sm text-gray-400">
                  {asset.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};