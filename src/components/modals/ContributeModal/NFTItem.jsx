import CheckmarkIcon from '@/icons/checkmark.svg?react';

export const NFTItem = ({ nft, isSelected, onToggle }) => (
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
        <div className="relative w-8 h-8 overflow-hidden rounded-full">
          <img alt={nft.name} className="w-full h-full object-cover" src={nft.image} loading="lazy" />
        </div>
        <span className="font-medium">{nft.name}</span>
      </div>
      <span className="text-dark-100 hover:underline text-sm">{nft.policyId.substring(0, 6)}...{nft.policyId.substring(nft.policyId.length - 6)}</span>
    </div>
  </div>
);
