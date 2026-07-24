import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LazyImage } from '@/components/shared/LazyImage';
import { HoverHelp } from '@/components/shared/HoverHelp';
import {
  formatTokenQuantity,
  formatTokenQuantityExact,
  formatPolicyId,
  getMaxDecimalTokenAmount,
} from '@/utils/core.utils';
import { getPolicyUrl } from '@/utils/explorer.utils';

const PolicyIdRow = ({ policyId, chainType }) => {
  if (!policyId) return null;

  return (
    <div className="flex items-center gap-1.5 min-w-0 border-t border-steel-750/50 pt-2.5 mt-1 ml-10 sm:ml-11">
      <span className="text-[10px] uppercase tracking-wider text-dark-100/70 shrink-0">
        {chainType === 'robinhood' ? 'Contract' : 'Policy'}
      </span>
      <a
        href={getPolicyUrl(policyId, chainType)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="font-mono text-xs text-dark-100 hover:text-white hover:underline truncate transition-colors"
        title={policyId}
      >
        {formatPolicyId(policyId, 6, 6)}
      </a>
    </div>
  );
};

export const FTItem = ({ ft, amount, isDisabled, onAmountChange, chainType }) => {
  const decimals = ft.metadata?.decimals ?? 6;
  const displayName = ft?.ticker || ft?.displayName || ft?.name;
  // EVM payloads include decimal-adjusted `quantity` plus base-unit `rawQuantity`.
  // Formatting and max calculations operate on base units, so prefer `rawQuantity`.
  const availableRawQuantity = ft.rawQuantity ?? ft.quantity;
  const availableDisplay = formatTokenQuantity(availableRawQuantity, decimals, decimals);
  const availableExact = formatTokenQuantityExact(availableRawQuantity, decimals);

  const handleMax = e => {
    e.stopPropagation();
    if (isDisabled) return;
    onAmountChange(ft, getMaxDecimalTokenAmount(availableRawQuantity, decimals));
  };

  return (
    <div className={isDisabled ? 'opacity-50' : ''}>
      <div className="rounded-md bg-steel-800 px-3 py-2.5 space-y-0">
        <div className="flex items-center gap-3 min-w-0 mb-2">
          <LazyImage
            src={ft.src}
            alt={displayName}
            className="rounded-full shrink-0"
            width={32}
            height={32}
            fallbackSrc="/assets/icons/ada.svg"
          />
          <div className="flex flex-col flex-1 min-w-0 gap-0.5">
            <span className="font-medium text-sm sm:text-base truncate">{displayName}</span>
            <div className="flex items-center gap-1.5 text-xs text-dark-100">
              <span className="text-[10px] uppercase tracking-wider text-dark-100/70 shrink-0">Available</span>
              <HoverHelp hint={availableExact} variant="icon" className="inline-flex min-w-0">
                <span className="tabular-nums truncate cursor-help">{availableDisplay}</span>
              </HoverHelp>
            </div>
          </div>
          <div className="flex items-stretch gap-1.5 shrink-0">
            <div className="w-[5.5rem] sm:w-28 flex [&>div]:flex-1 [&>div]:min-w-0">
              <LavaSteelInput
                id={`ft-input-${ft.id}`}
                placeholder="0.00"
                value={amount}
                disabled={isDisabled}
                onChange={value => !isDisabled && onAmountChange(ft, value)}
              />
            </div>
            <button
              type="button"
              onClick={handleMax}
              disabled={isDisabled}
              className="flex items-center justify-center text-xs font-medium px-2.5 rounded-lg bg-steel-750 hover:bg-steel-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Max
            </button>
          </div>
        </div>
        <PolicyIdRow policyId={ft.metadata?.policyId} chainType={ft.chainType || chainType} />
      </div>
    </div>
  );
};
