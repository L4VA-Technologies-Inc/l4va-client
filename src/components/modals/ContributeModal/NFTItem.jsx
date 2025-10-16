import CheckmarkIcon from '@/icons/checkmark.svg?react';
import { LazyImage } from '@/components/shared/LazyImage';

export const NFTItem = ({ nft, isSelected, onToggle }) => {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onToggle(nft)}>
      <div
        className={`
        relative w-6 h-6 flex items-center justify-center rounded-full
        border border-steel-750 bg-steel-800
        ${isSelected ? 'bg-primary-500 border-primary-500' : ''}
      `}
      >
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full">
            <CheckmarkIcon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800">
        <div className="flex items-center gap-3">
          <LazyImage
            src={nft.src}
            alt={nft.name}
            className="rounded-full"
            width={32}
            height={32}
            fallbackSrc="/assets/icons/ada.png"
          />
          <span className="font-medium truncate">{nft.name}</span>
        </div>
        <span className="text-dark-100 hover:underline text-sm">
          {nft.metadata?.policyId.substring(0, 6)}...
          {nft.metadata?.policyId.substring(nft.metadata?.policyId.length - 6)}
        </span>
      </div>
    </div>
  );
};
