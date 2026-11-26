import { Loader2, Undo2 } from 'lucide-react';

const formatDeadline = date =>
  new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * Withdraw button for a row of the caller's own contribution in a vault asset table
 * (see useEvmSelfCancel). Stops the click from toggling the row.
 */
export const WithdrawContributionButton = ({ contribution, onWithdraw, pendingId }) => {
  const isPending = pendingId === contribution.contributionId;
  return (
    <button
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-steel-600 px-2.5 py-1 text-xs text-white transition-[background-color,border-color,transform] duration-150 ease-out hover:border-orange-500 hover:bg-orange-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      aria-label="Withdraw"
      disabled={Boolean(pendingId)}
      title={`Take it back to your wallet. Possible until ${formatDeadline(contribution.windowEndsAt)}.`}
      type="button"
      onClick={e => {
        e.stopPropagation();
        onWithdraw(contribution);
      }}
      onKeyDown={e => e.stopPropagation()}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
      {/* Icon only on phones, so the asset table fits without a sideways scroll. */}
      <span className="hidden md:inline">{isPending ? 'Withdrawing…' : 'Withdraw'}</span>
    </button>
  );
};
