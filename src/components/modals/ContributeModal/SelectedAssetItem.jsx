import { X } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';

export const SelectedAssetItem = ({ asset, onRemove }) => (
  <div className="flex items-center gap-3">
    <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 overflow-hidden rounded-full">
          <img alt={asset.name} className="w-full h-full object-cover" src={asset.image || '/assets/icons/ada.png'} />
        </div>
        <span className="font-medium">
          {asset.type === 'FT' && asset.amount ? `${formatNum(asset.amount)} ${asset.name}` : asset.name}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-dark-100 hover:underline text-sm">
          {asset.policyId.substring(0, 8)}...
        </span>
        <button
          className="text-dark-100 hover:text-white p-1 rounded-full hover:bg-steel-700 transition-colors"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(asset.id);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
