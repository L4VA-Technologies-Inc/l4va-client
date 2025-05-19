import { LavaSteelInput } from '@/components/shared/LavaInput';
import { formatNum } from '@/utils/core.utils';

export const FTItem = ({ ft, amount, onAmountChange }) => (
  <div className="flex items-center gap-3">
    <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 overflow-hidden rounded-full">
          <img alt={ft.name} className="w-full h-full object-cover" src={ft.image || '/assets/icons/ada.png'} />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{ft.name}</span>
          <span className="text-dark-100 text-sm">Available: {formatNum(ft.quantity)}</span>
        </div>
      </div>
      <div>
        <LavaSteelInput
          id={`ft-input-${ft.id}`}
          placeholder="0.00"
          value={amount}
          onChange={value => onAmountChange(ft, value)}
        />
      </div>
      <span className="text-dark-100 hover:underline text-sm">
        {ft.policyId ? `${ft.policyId.substring(0, 8)}...` : ''}
      </span>
    </div>
  </div>
);
