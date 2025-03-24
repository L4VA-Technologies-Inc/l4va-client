import { useState } from 'react';

export const VaultAssetsList = ({ assets = [] }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);

  return (
    <div className="space-y-2">
      {assets.map((asset, index) => (
        <div
          key={index}
          className={`bg-dark-700 rounded-xl transition-all ${expandedAsset === index ? 'p-4' : 'p-3'
            }`}
        >
          <div
            className="grid grid-cols-5 gap-4 items-center cursor-pointer"
            onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
          >
            <div className="flex items-center gap-3">
              <img
                src={asset.icon}
                alt={asset.name}
                className="w-10 h-10 rounded-lg"
              />
            </div>
            <div className="font-medium">{asset.name}</div>
            <div>{asset.value} ADA</div>
            <div>{asset.vaultPercentage}%</div>
            <div className="flex items-center justify-end gap-2">
              <span>{asset.contribute} ADA</span>
              <button className="w-6 h-6 flex items-center justify-center">
                {expandedAsset === index ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {expandedAsset === index && (
            <div className="mt-4 pt-4 border-t border-dark-600">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-dark-100">{asset.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 