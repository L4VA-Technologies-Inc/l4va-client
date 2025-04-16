import { X } from 'lucide-react';

export const SelectedAssetItem = ({ asset, onRemove }) => (
  <div className="flex items-center justify-between p-3 bg-steel-850 rounded-lg hover:bg-steel-800 transition-colors">
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-steel-800">
        <img alt={asset.name} className="w-full h-full object-cover" src={asset.image || '/assets/icons/ada.png'} />
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{asset.name}</span>
        <span className="text-dark-100 text-xs">
          {asset.policyId.substring(0, 8)}...
          {asset.type === 'FT' && asset.amount && (
            <span className="ml-2">Amount: {asset.amount}</span>
          )}
        </span>
      </div>
    </div>
    <button
      className="text-dark-100 hover:text-white p-1 rounded-full hover:bg-steel-800 transition-colors"
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove(asset.id);
      }}
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);
