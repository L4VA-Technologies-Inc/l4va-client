import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LazyImage } from '@/components/shared/LazyImage';
import { formatTokenQuantity, formatPolicyId } from '@/utils/core.utils';

export const FTItem = ({ ft, amount, isDisabled, onAmountChange }) => {
  // Get decimals from metadata, default to 6 if not specified
  const decimals = ft.metadata?.decimals ?? 6;

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${isDisabled ? 'opacity-50' : ''}`}>
      <div className="flex flex-1 items-center justify-between px-2 sm:px-4 py-2 rounded-md gap-2 sm:gap-3 bg-steel-800 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
          <LazyImage
            src={ft.src}
            alt={ft.name}
            className="rounded-full shrink-0"
            width={32}
            height={32}
            fallbackSrc="/assets/icons/ada.svg"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium text-sm sm:text-base truncate">{ft.name}</span>
            <span className="text-dark-100 text-xs sm:text-sm whitespace-nowrap">
              Available: {formatTokenQuantity(ft.quantity, decimals, decimals)}
            </span>
          </div>
        </div>
        <div className="w-20 sm:w-24 shrink-0">
          <LavaSteelInput
            id={`ft-input-${ft.id}`}
            placeholder="0.00"
            value={amount}
            disabled={isDisabled}
            onChange={value => !isDisabled && onAmountChange(ft, value)}
          />
        </div>
        <a
          href={
            import.meta.env.VITE_CARDANO_NETWORK === 'preprod'
              ? `https://preprod.cardanoscan.io/tokenPolicy/${ft.metadata?.policyId}`
              : `https://pool.pm/policy/${ft.metadata?.policyId}`
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-dark-100 hover:underline text-sm shrink-0 whitespace-nowrap"
        >
          {formatPolicyId(ft.metadata?.policyId)}
        </a>
      </div>
    </div>
  );
};
