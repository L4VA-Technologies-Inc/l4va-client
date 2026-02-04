import { X } from 'lucide-react';

import { LazyImage } from '@/components/shared/LazyImage';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { formatAdaPrice } from '@/utils/core.utils';

export const SelectedAssetItemWithPrice = ({ asset, onRemove, onPriceChange, oldPrice }) => {
  const newPrice = parseFloat(asset.newPrice);
  const currentPrice = parseFloat(oldPrice);
  const hasPrice = asset.newPrice && asset.newPrice !== '';
  const priceDiff = hasPrice ? Math.abs(newPrice - currentPrice) : 0;
  const isValidPrice = !hasPrice || priceDiff >= 5;

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800">
        <div className="flex items-center gap-3 flex-1">
          <LazyImage
            src={asset.src}
            alt={asset.name}
            className="rounded-full"
            width={32}
            height={32}
            fallbackSrc="/assets/icons/ada.svg"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium truncate">{asset.name}</span>
            {oldPrice !== undefined && (
              <span className="text-xs text-dark-100">Current price: ₳{formatAdaPrice(oldPrice)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <LavaSteelInput
              placeholder="New price"
              value={asset.newPrice || ''}
              onChange={value => {
                const numValue = parseFloat(value);
                if (value === '' || numValue >= 0) {
                  onPriceChange(asset.tokenId, value);
                }
              }}
              onIncrement={() => {
                const newValue = (parseFloat(asset.newPrice) || 0) + 0.1;
                onPriceChange(asset.tokenId, newValue.toFixed(1));
              }}
              onDecrement={() => {
                const newValue = Math.max(0, (parseFloat(asset.newPrice) || 0) - 0.1);
                onPriceChange(asset.tokenId, newValue.toFixed(1));
              }}
              type="number"
              min={0}
              step={0.1}
              className={`text-sm ${!isValidPrice ? '!border-red-500/60' : ''}`}
            />
            {!isValidPrice && (
              <p className="text-xs text-red-500 mt-1">
                Price must differ by at least ₳5 (current: ₳{formatAdaPrice(priceDiff)})
              </p>
            )}
          </div>
          <button
            className="text-dark-100 hover:text-white p-1 rounded-full hover:bg-steel-700 transition-colors"
            type="button"
            onClick={e => {
              e.stopPropagation();
              onRemove(asset.tokenId);
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
