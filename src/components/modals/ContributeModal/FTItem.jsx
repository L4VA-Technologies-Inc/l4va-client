import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LazyImage } from '@/components/shared/LazyImage';
import { formatCompactNumber } from '@/utils/core.utils';

export const FTItem = ({ ft, amount, isDisabled, onAmountChange }) => (
  <div className={`flex items-center gap-3 ${isDisabled ? 'opacity-50' : ''}`}>
    <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800">
      <div className="flex items-center gap-3">
        <LazyImage
          src={ft.src}
          alt={ft.name}
          className="rounded-full"
          width={32}
          height={32}
          fallbackSrc="/assets/icons/ada.png"
        />
        <div className="flex flex-col">
          <span className="font-medium truncate">{ft.name}</span>
          <span className="text-dark-100 text-sm">Available: {formatCompactNumber(ft.quantity)}</span>
        </div>
      </div>
      <div>
        <LavaSteelInput
          id={`ft-input-${ft.id}`}
          placeholder="0.00"
          value={amount}
          disabled={isDisabled}
          onChange={value => !isDisabled && onAmountChange(ft, value)}
        />
      </div>
      <span className="text-dark-100 hover:underline text-sm">
        {ft.metadata?.policyId
          ? `${ft.metadata.policyId.substring(0, 6)}...${ft.metadata.policyId.substring(ft.metadata.policyId.length - 6)}`
          : ''}
      </span>
    </div>
  </div>
);
