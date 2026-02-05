import { X } from 'lucide-react';

import { LazyImage } from '@/components/shared/LazyImage';
import { formatNum } from '@/utils/core.utils';

export const SelectedAssetItem = ({ asset, onRemove }) => (
  <div className="flex items-center gap-3">
    <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800 overflow-hidden">
      <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
        <LazyImage
          src={asset.src}
          alt={asset.name}
          className="rounded-full shrink-0"
          width={32}
          height={32}
          fallbackSrc="/assets/icons/ada.svg"
        />
        <span className="font-medium truncate">
          {asset.type === 'FT' && asset.amount ? `${formatNum(asset.amount)} ${asset.name}` : asset.name}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-dark-100 hover:underline text-sm whitespace-nowrap">
          {asset.metadata?.policyId.substring(0, 6)}...
          {asset.metadata?.policyId.substring(asset.metadata?.policyId.length - 6)}
        </span>
        <button
          className="text-dark-100 hover:text-white p-1 rounded-full hover:bg-steel-700 transition-colors"
          type="button"
          onClick={e => {
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
