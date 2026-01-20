import { X, ChevronUp, ChevronDown } from 'lucide-react';

import { LazyImage } from '@/components/shared/LazyImage';
import { LavaSteelInput } from '@/components/shared/LavaInput';

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
            {oldPrice !== undefined && <span className="text-xs text-dark-100">Current price: ₳{oldPrice}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <div className="relative">
              <LavaSteelInput
                placeholder="New price"
                value={asset.newPrice || ''}
                onChange={value => {
                  const numValue = parseFloat(value);
                  if (value === '' || numValue >= 0) {
                    onPriceChange(asset.tokenId, value);
                  }
                }}
                type="number"
                min="0"
                className={`text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${!isValidPrice ? '!border-red-500/60' : ''}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (parseFloat(asset.newPrice) || 0) + 0.1;
                    onPriceChange(asset.tokenId, newValue.toFixed(1));
                  }}
                  className="p-0.5 hover:bg-steel-600 rounded transition-colors"
                >
                  <ChevronUp className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = Math.max(0, (parseFloat(asset.newPrice) || 0) - 0.1);
                    onPriceChange(asset.tokenId, newValue.toFixed(1));
                  }}
                  className="p-0.5 hover:bg-steel-600 rounded transition-colors"
                >
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
            {!isValidPrice && (
              <p className="text-xs text-red-500 mt-1">
                Price must differ by at least ₳5 (current: ₳{priceDiff.toFixed(2)})
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
