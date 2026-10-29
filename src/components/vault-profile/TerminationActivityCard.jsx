import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronUp,
  Circle,
  Clock,
  Coins,
  ExternalLink,
  Flame,
  Pause,
  PauseCircle,
  Play,
  RotateCcw,
  Vote,
  XCircle,
} from 'lucide-react';

import { formatDateTime } from '@/utils/core.utils';
import { getTransactionUrl } from '@/utils/explorer.utils';

const STATUS_BADGES = {
  voting: { label: 'Voting', color: 'bg-orange-500/20 text-orange-500' },
  rejected: { label: 'Rejected', color: 'bg-steel-750 text-dark-100' },
  in_progress: { label: 'Terminating', color: 'bg-orange-500/20 text-orange-500' },
  completed: { label: 'Terminated', color: 'bg-emerald-500/20 text-emerald-500' },
  failed: { label: 'Stalled', color: 'bg-rose-500/20 text-rose-500' },
};

export const TERMINATION_TITLES = {
  voting: 'Termination Proposed',
  rejected: 'Termination Rejected',
  in_progress: 'Vault Terminating',
  completed: 'Vault Terminated',
  failed: 'Termination Stalled',
};

export const TERMINATION_STEPS = {
  proposal_created: { label: 'Termination proposal created', icon: Vote },
  voting_ends: { label: 'Voting ends', icon: Clock },
  voting_ended: { label: 'Voting ended', icon: CheckCircle },
  voting_rejected: { label: 'Proposal rejected, vault continues', icon: XCircle },
  // EVM
  preparing: { label: 'Trading paused, preflight checks', icon: Pause },
  rates_committed: { label: 'Redemption rates committed', icon: Coins },
  redemption_sent: { label: 'Redemption sent to holder', icon: RotateCcw },
  asset_deferred: { label: 'Asset deferred', icon: PauseCircle },
  asset_resumed: { label: 'Asset resumed', icon: Play },
  deadline: { label: 'Claim deadline', icon: Clock },
  finalized: { label: 'Termination finalized', icon: CheckCircle },
  remainder_swept: { label: 'Unclaimed remainder swept', icon: Flame },
  // Cardano
  nfts_burned: { label: 'Vault NFTs burned', icon: Flame },
  lp_removal_sent: { label: 'LP sent for removal', icon: RotateCcw },
  lp_returned: { label: 'LP returned', icon: RotateCcw },
  vt_burned: { label: 'Returned VT burned', icon: Flame },
  ada_to_treasury: { label: 'ADA moved to treasury', icon: Coins },
  claims_created: { label: 'Claims opened for holders', icon: CheckCircle },
  claims_processing: { label: 'Holders claiming', icon: RotateCcw },
  vault_burned: { label: 'Vault burned', icon: Flame },
};

const STEP_TONES = {
  done: 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/30',
  current: 'bg-orange-500/15 text-orange-500 ring-orange-500/30',
  failed: 'bg-rose-500/15 text-rose-500 ring-rose-500/30',
  upcoming: 'bg-steel-850 text-dark-100 ring-steel-750',
};

const OUTCOMES = {
  completed: 'All redeemable assets were distributed. The vault is closed.',
  rejected: 'Holders voted against termination. The vault keeps operating.',
};

const TimelineStep = ({ step, isLast, chainType }) => {
  const isOutcome = step.key === 'outcome';
  const meta = isOutcome
    ? { label: step.note, icon: step.status === 'done' ? CheckCircle : XCircle }
    : TERMINATION_STEPS[step.key] || { label: step.key, icon: Circle };
  const StepIcon = step.status === 'upcoming' ? Circle : meta.icon;
  return (
    <div className="relative flex gap-3">
      {!isLast && <span className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-steel-750" />}
      <div
        className={clsx(
          'relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-1',
          STEP_TONES[step.status]
        )}
      >
        <StepIcon className="w-4 h-4" />
      </div>
      <div className={clsx('flex-1 min-w-0', isLast ? 'pb-0' : 'pb-5')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          <span className={clsx('text-sm font-medium', step.status === 'upcoming' ? 'text-dark-100' : 'text-white')}>
            {meta.label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {step.at && <span className="text-xs text-dark-100">{formatDateTime(step.at)}</span>}
            {step.txHash && (
              <button
                type="button"
                onClick={() => window.open(getTransactionUrl(step.txHash, chainType), '_blank')}
                title="View transaction"
                aria-label="View transaction"
                className="p-1.5 rounded-md bg-steel-950/60 border border-steel-750 hover:border-orange-500/50 text-dark-100 hover:text-orange-500 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {step.note && !isOutcome && (
          <p className={clsx('text-xs mt-0.5', step.status === 'failed' ? 'text-rose-400' : 'text-dark-100')}>
            {step.note}
          </p>
        )}
      </div>
    </div>
  );
};

const ProposalBox = ({ activity }) => {
  const { proposal, redemption } = activity;
  const isEvm = activity.chain === 'evm';
  const pct = redemption?.total ? Math.round((redemption.claimed / redemption.total) * 100) : null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-steel-850 border border-steel-750">
      <div className="flex flex-wrap items-center gap-2">
        <Vote className="w-4 h-4 text-orange-500" />
        <span className="text-sm text-white font-medium">Proposal &ldquo;{proposal.title}&rdquo;</span>
        <span className="text-xs uppercase text-dark-100">· {proposal.status}</span>
      </div>
      {activity.status === 'voting' && proposal.endDate && (
        <p className="text-xs text-dark-100 mt-1.5">Voting ends {formatDateTime(proposal.endDate)}</p>
      )}
      {redemption && (
        <div className="mt-3">
          {pct !== null && (
            <div className="h-2 rounded-full overflow-hidden bg-steel-750">
              <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2 mt-1.5 text-xs text-dark-100">
            <span>
              {isEvm
                ? `${redemption.claimed} operator ${redemption.claimed === 1 ? 'redemption' : 'redemptions'} sent · holders can also redeem themselves`
                : `${redemption.claimed} / ${redemption.total} holders claimed`}
            </span>
            {redemption.deadline && <span>Claim deadline {formatDateTime(redemption.deadline)}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export const TerminationActivityCard = ({ activity, vault }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const badge = STATUS_BADGES[activity.status] || STATUS_BADGES.in_progress;
  const txCount = activity.steps.filter(step => step.txHash).length;
  const outcome = OUTCOMES[activity.status];
  const HeaderIcon = activity.status === 'completed' ? Flame : activity.status === 'voting' ? Vote : AlertTriangle;
  const iconColor =
    activity.status === 'completed'
      ? 'text-emerald-500'
      : activity.status === 'failed'
        ? 'text-rose-500'
        : 'text-orange-500';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-steel-750 bg-steel-950 transition-all duration-200 hover:border-steel-700">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-steel-850">
            <HeaderIcon className={clsx('w-5 h-5', iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{TERMINATION_TITLES[activity.status]}</h3>
                  <span className={clsx('text-xs font-medium uppercase px-2 py-0.5 rounded', badge.color)}>
                    {badge.label}
                  </span>
                  {txCount > 0 && (
                    <span className="text-xs text-dark-100">
                      {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateTime(activity.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.navigate({ to: '/proposals/$id', params: { id: activity.proposal.id } })}
                  className="flex-shrink-0 inline-flex items-center gap-1 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  <Vote className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                  <span className="text-xs text-white font-medium group-hover:text-orange-500 transition-colors hidden sm:block">
                    View Proposal
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  title={expanded ? 'Show less' : 'Show details'}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  <ChevronUp
                    className={clsx(
                      'w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-all',
                      expanded ? '' : 'rotate-180'
                    )}
                  />
                </button>
              </div>
            </div>

            <ProposalBox activity={activity} />

            {activity.error && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <p className="text-sm text-rose-400">{activity.error}</p>
              </div>
            )}

            {expanded && (
              <div className="mt-3 pt-3 border-t border-steel-750">
                <p className="text-xs font-medium uppercase tracking-wider text-dark-100 mb-3">Timeline</p>
                {activity.steps.map((step, i) => (
                  <TimelineStep
                    key={`${step.key}-${i}`}
                    step={step}
                    chainType={vault?.chainType}
                    isLast={i === activity.steps.length - 1 && !outcome}
                  />
                ))}
                {outcome && (
                  <TimelineStep
                    step={{ key: 'outcome', status: activity.status === 'rejected' ? 'failed' : 'done', note: outcome }}
                    isLast
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
