import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LazyImage } from '@/components/shared/LazyImage';
import { HoverHelp } from '@/components/shared/HoverHelp';
import {
  formatTokenQuantity,
  formatTokenQuantityExact,
  formatPolicyId,
  getMaxDecimalTokenAmount,
} from '@/utils/core.utils';
import { IS_PREPROD } from '@/utils/networkValidation';

const getPolicyExplorerUrl = policyId =>
  IS_PREPROD ? `https://preprod.cardanoscan.io/tokenPolicy/${policyId}` : `https://pool.pm/policy/${policyId}`;

const PolicyIdRow = ({ policyId }) => {
  if (!policyId) return null;

  const handleCopy = e => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(policyId)
      .then(() => toast.success('Policy ID copied'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className="flex items-center gap-2 min-w-0 border-t border-steel-750/50 pt-2 ml-10 sm:ml-11">
      <span className="text-[10px] uppercase tracking-wider text-dark-100/70 shrink-0">Policy</span>
      <span className="font-mono text-xs text-dark-100 truncate flex-1 min-w-0" title={policyId}>
        {formatPolicyId(policyId, 8, 6)}
      </span>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-dark-100 hover:text-white hover:bg-steel-750 transition-colors"
          aria-label="Copy policy ID"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <a
          href={getPolicyExplorerUrl(policyId)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="p-1 rounded text-dark-100 hover:text-white hover:bg-steel-750 transition-colors"
          aria-label="View policy on explorer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export const FTItem = ({ ft, amount, isDisabled, onAmountChange }) => {
  const decimals = ft.metadata?.decimals ?? 6;
  const displayName = ft?.ticker || ft?.displayName || ft?.name;
  const availableDisplay = formatTokenQuantity(ft.quantity, decimals, decimals);
  const availableExact = formatTokenQuantityExact(ft.quantity, decimals);

  const handleMax = e => {
    e.stopPropagation();
    if (isDisabled) return;
    onAmountChange(ft, getMaxDecimalTokenAmount(ft.quantity, decimals));
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
            <div className="flex items-center gap-1 text-xs text-dark-100">
              <span className="shrink-0">Available:</span>
              <HoverHelp hint={availableExact} variant="icon" className="inline-flex min-w-0">
                <span className="tabular-nums truncate border-b border-dotted border-dark-100/50 cursor-help">
                  {availableDisplay}
                </span>
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
        <PolicyIdRow policyId={ft.metadata?.policyId} />
      </div>
    </div>
  );
};
