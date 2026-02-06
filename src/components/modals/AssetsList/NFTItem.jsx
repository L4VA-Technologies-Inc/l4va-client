import CheckmarkIcon from '@/icons/checkmark.svg?react';
import { LazyImage } from '@/components/shared/LazyImage';

export const NFTItem = ({ nft, isSelected, isDisabled, onToggle }) => {
  return (
    <div
      className={`flex items-center gap-3 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onClick={() => !isDisabled && onToggle(nft)}
    >
      <div
        className={`
        relative w-6 h-6 flex items-center justify-center rounded-full
        border border-steel-750 bg-steel-800
        ${isSelected ? 'bg-primary-500 border-primary-500' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
      >
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full">
            <CheckmarkIcon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800 overflow-hidden">
        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
          <LazyImage
            src={nft.src}
            alt={nft.displayName || nft.name}
            className="rounded-full shrink-0"
            width={32}
            height={32}
            fallbackSrc="/assets/icons/ada.svg"
          />
          <span className="font-medium truncate">{nft.displayName || nft.name}</span>
        </div>
        <a
          href={`https://pool.pm/policy/${nft.metadata?.policyId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-dark-100 hover:underline text-sm shrink-0 whitespace-nowrap"
        >
          {nft.metadata?.policyId.substring(0, 6)}...
          {nft.metadata?.policyId.substring(nft.metadata?.policyId.length - 6)}
        </a>
      </div>
    </div>
  );
};
