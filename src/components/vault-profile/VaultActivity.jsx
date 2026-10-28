import { useState } from 'react';
import {
  Rocket,
  Coins,
  Settings,
  User,
  Calendar,
  ChevronUp,
  ExternalLink,
  HandCoins,
  Vote,
  Play,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeftRight,
} from 'lucide-react';
import clsx from 'clsx';
import { formatUnits } from 'viem';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { useVaultActivity } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/shared/Pagination';
import { formatDateTime } from '@/utils/core.utils';
import { getTransactionUrl } from '@/utils/explorer.utils';
import { LavaTabs } from '@/components/shared/LavaTabs';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { VaultsApiProvider } from '@/services/api/vaults';
import { getSuccessMessage } from '@/constants/proposalMessages';
import { useCurrency } from '@/hooks/useCurrency';

const ACTIVITY_TYPES = {
  'create-vault': {
    label: 'Vault Created',
    icon: Rocket,
    iconColor: 'text-orange-500',
  },
  contribute: {
    label: 'Contribution',
    icon: HandCoins,
    iconColor: 'text-orange-500',
  },
  acquire: {
    label: 'Acquire',
    icon: Coins,
    iconColor: 'text-orange-500',
  },
  'evm-swap': {
    label: 'Swap',
    icon: ArrowLeftRight,
    iconColor: 'text-orange-500',
  },
  phase_transition: {
    label: 'Phase Transition',
    icon: Settings,
    iconColor: 'text-orange-500',
  },
  proposal: {
    label: 'Proposal',
    icon: Vote,
    iconColor: 'text-orange-500',
  },
  index_rebalance: {
    label: 'Rebalance',
    icon: ArrowLeftRight,
    iconColor: 'text-orange-500',
  },
};

const REBALANCE_STATUS = {
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-500' },
  executing: { label: 'Executing', color: 'bg-orange-500/20 text-orange-500' },
  pending: { label: 'Pending', color: 'bg-orange-500/20 text-orange-500' },
  failed: { label: 'Failed', color: 'bg-rose-500/20 text-rose-500' },
};

const formatTokenAmount = (raw, decimals) => {
  if (raw === null || raw === undefined || raw === '') return '-';
  try {
    return formatAmount(formatUnits(BigInt(raw), decimals ?? 18), 6);
  } catch {
    return '-';
  }
};

/** "0.00099 ETH → 2,089.73 L4VA" for a vault swap; falls back to symbols only. */
const getSwapSummary = activity => {
  const m = activity.metadata || {};
  const symIn = m.assetInSymbol || 'token';
  const symOut = m.assetOutSymbol || 'token';
  const amountIn = formatTokenAmount(m.amountIn, m.assetInDecimals);
  const amountOut = formatTokenAmount(m.grossOut, m.assetOutDecimals);
  if (amountOut === '-') return `${amountIn} ${symIn} → ${symOut}`;
  return `${amountIn} ${symIn} → ${amountOut} ${symOut}`;
};

const getRebalanceTitle = activity => (activity.trigger === 'initial_buy' ? 'Basket Purchased' : 'Basket Rebalanced');

const getRebalanceDescription = activity => {
  const legs = activity.legs || [];
  const buys = legs.filter(leg => leg.side === 'buy').length;
  const sells = legs.length - buys;
  const parts = [];
  if (sells) parts.push(`${sells} ${sells === 1 ? 'sell' : 'sells'}`);
  if (buys) parts.push(`${buys} ${buys === 1 ? 'buy' : 'buys'}`);
  const source = activity.trigger === 'initial_buy' ? 'Initial basket buy' : 'Governance re-weight';
  return parts.length ? `${source}: ${parts.join(', ')}` : source;
};

const formatLeg = leg =>
  `${leg.side} ${formatTokenAmount(leg.amountIn, leg.assetIn?.decimals)} ${leg.assetIn?.symbol} → ${formatTokenAmount(
    leg.amountOut,
    leg.assetOut?.decimals
  )} ${leg.assetOut?.symbol}`;

const formatDate = dateString => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAmount = (amount, maximumFractionDigits = 2) => {
  if (!amount) return '0';
  const numValue = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numValue)) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(numValue);
};

const getActivityTitle = (activity, currencyLabel) => {
  if (activity.activityType === 'transaction') {
    switch (activity.type) {
      case 'create-vault': {
        return 'Vault Created';
      }

      case 'acquire': {
        // The amount is in the asset paid with, not the display currency the viewer picked.
        const adaAsset = activity.assets?.find(asset => asset.type === 'ada' || asset.policy_id === 'lovelace');
        if (adaAsset?.quantity) {
          return `${formatAmount(adaAsset.quantity)} ADA Acquired`;
        }
        // EVM: the asset row is already in ETH; `activity.amount` is raw wei.
        const ethAsset = activity.assets?.find(asset => asset.type === 'eth');
        if (ethAsset?.quantity) {
          return `${formatAmount(ethAsset.quantity, 6)} ETH Acquired`;
        }
        if (activity.amount) {
          return `${formatAmount(activity.amount)} ${currencyLabel} Acquired`;
        }
        return 'Acquire';
      }

      case 'evm-swap': {
        return `Swapped ${getSwapSummary(activity)}`;
      }

      case 'contribute': {
        const nftCount = activity.assets?.length || 0;
        if (nftCount > 0) {
          return `${nftCount} ${nftCount === 1 ? 'Asset' : 'Assets'} Contributed`;
        }
        return 'Contribution';
      }

      default: {
        return 'Transaction';
      }
    }
  } else if (activity.activityType === 'phase_transition') {
    const phaseLabels = {
      contribution: 'Contribution Phase Started',
      acquire: 'Acquire Phase Started',
      locked: 'Vault Locked',
    };
    return phaseLabels[activity.phase] || 'Phase Transition';
  } else if (activity.activityType === 'index_rebalance') {
    return getRebalanceTitle(activity);
  } else {
    return `Proposal "${activity.title || 'Untitled'}"`;
  }
};

const PROPOSAL_STAGES = {
  created: {
    label: 'Created',
    timelineLabel: 'Proposal created',
    icon: Vote,
    color: 'bg-orange-500/20 text-orange-500',
  },
  started: {
    label: 'Started',
    timelineLabel: 'Voting started',
    icon: Play,
    color: 'bg-emerald-500/20 text-emerald-500',
  },
  ended: { label: 'Finished', timelineLabel: 'Voting ended', icon: CheckCircle, color: 'bg-blue-500/20 text-blue-500' },
};

/** Lifecycle stages and executed actions of a proposal, oldest first. */
const getProposalTimeline = activity =>
  [
    ...(activity.lifecycle || []).map(event => ({ kind: 'stage', at: event.at, stage: event.stage })),
    ...(activity.actions || []).map(action => ({ kind: 'action', at: action.created_at, action })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

const getProposalActionTitle = action =>
  action.activityType === 'index_rebalance' ? getRebalanceTitle(action) : `Swapped ${getSwapSummary(action)}`;

const getProposalActionTxHashes = action =>
  action.activityType === 'index_rebalance'
    ? (action.legs || []).map(leg => leg.txHash).filter(Boolean)
    : [action.tx_hash].filter(Boolean);

const TIMELINE_TONES = {
  orange: 'bg-orange-500/15 text-orange-500 ring-orange-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/30',
  blue: 'bg-blue-500/15 text-blue-500 ring-blue-500/30',
  rose: 'bg-rose-500/15 text-rose-500 ring-rose-500/30',
};

const STAGE_TONES = { created: 'orange', started: 'emerald', ended: 'blue' };

/** One node on the proposal timeline: a ringed icon on the rail, content to its right. */
const TimelineNode = ({ icon: NodeIcon, tone, isLast, children }) => (
  <div className="relative flex gap-3">
    {!isLast && <span className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-steel-750" />}
    <div
      className={clsx(
        'relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-1',
        TIMELINE_TONES[tone]
      )}
    >
      <NodeIcon className="w-4 h-4" />
    </div>
    <div className={clsx('flex-1 min-w-0', isLast ? 'pb-0' : 'pb-5')}>{children}</div>
  </div>
);

const ProposalTimeline = ({ activity, vault }) => {
  const entries = getProposalTimeline(activity);
  const outcome = activity.executionError
    ? { icon: XCircle, tone: 'rose', title: 'Execution', text: activity.executionError }
    : activity.stage === 'ended' && activity.status === 'executed'
      ? {
          icon: CheckCircle,
          tone: 'emerald',
          title: 'Execution',
          text: getSuccessMessage(activity.proposalType, activity.vault),
        }
      : null;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-wider text-dark-100 mb-3">Timeline</p>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1 && !outcome;

        if (entry.kind === 'stage') {
          const stage = PROPOSAL_STAGES[entry.stage];
          return (
            <TimelineNode
              key={`stage-${entry.stage}`}
              icon={stage?.icon || Vote}
              tone={STAGE_TONES[entry.stage] || 'orange'}
              isLast={isLast}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 pt-1.5">
                <span className="text-sm font-medium text-white">{stage?.timelineLabel || entry.stage}</span>
                <span className="text-xs text-dark-100">{formatDate(entry.at)}</span>
              </div>
            </TimelineNode>
          );
        }

        const { action } = entry;
        const txHashes = getProposalActionTxHashes(action);
        const rebalanceStatus = action.activityType === 'index_rebalance' && REBALANCE_STATUS[action.status];
        return (
          <TimelineNode key={`action-${action.id}`} icon={ArrowLeftRight} tone="orange" isLast={isLast}>
            <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-steel-850 to-steel-850 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-orange-500">Action executed</span>
                <span className="text-xs text-dark-100">{formatDate(entry.at)}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-white">{getProposalActionTitle(action)}</span>
                {rebalanceStatus && (
                  <span className={clsx('text-xs font-medium uppercase px-2 py-0.5 rounded', rebalanceStatus.color)}>
                    {rebalanceStatus.label}
                  </span>
                )}
              </div>
              {txHashes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {txHashes.map((hash, i) => (
                    <button
                      key={hash}
                      onClick={() => window.open(getTransactionUrl(hash, vault?.chainType), '_blank')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-steel-950/60 border border-steel-750 hover:border-orange-500/50 text-xs text-dark-100 hover:text-orange-500 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {txHashes.length > 1 ? `Tx ${i + 1}` : 'View transaction'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TimelineNode>
        );
      })}

      {outcome && (
        <TimelineNode icon={outcome.icon} tone={outcome.tone} isLast>
          <div className="relative overflow-hidden rounded-xl border border-steel-750 bg-steel-850 py-3 pl-4 pr-3">
            <span
              className={clsx(
                'absolute inset-y-0 left-0 w-1',
                outcome.tone === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'
              )}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">{outcome.title}</span>
              <span
                className={clsx(
                  'inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  outcome.tone === 'rose' ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                )}
              >
                <span
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    outcome.tone === 'rose' ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
                  )}
                />
                {outcome.tone === 'rose' ? 'Failed' : 'Executed'}
              </span>
            </div>
            {outcome.text &&
              (outcome.tone === 'rose' ? (
                <p className="mt-2 rounded-md bg-steel-950/60 border border-steel-750 px-2 py-1.5 font-mono text-xs text-rose-300 break-words">
                  {outcome.text}
                </p>
              ) : (
                <p className="mt-1 text-xs text-dark-100">{outcome.text}</p>
              ))}
          </div>
        </TimelineNode>
      )}
    </div>
  );
};

const pctOf = (part, whole) => {
  try {
    const w = BigInt(whole || 0);
    return w > 0n ? Number((BigInt(part || 0) * 10000n) / w) / 100 : 0;
  } catch {
    return 0;
  }
};

const LockStat = ({ label, value, hint }) => (
  <div className="rounded-xl border border-steel-750 bg-steel-850 p-3">
    <p className="text-[10px] font-medium uppercase tracking-wider text-dark-100">{label}</p>
    <p className="mt-1 text-base font-semibold text-white truncate">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-dark-100">{hint}</p>}
  </div>
);

/** What the lock settled: valuation, the VT split and where the raised native went. */
const LockSummary = ({ summary, vault }) => {
  const vt = summary.vtTicker || 'VT';
  const native = summary.nativeSymbol;
  const fmtVt = raw => formatTokenAmount(raw, summary.vtDecimals);
  const fmtNative = raw => formatTokenAmount(raw, summary.nativeDecimals);

  const split = [
    {
      key: 'contributors',
      label: 'Contributors',
      amount: summary.contributorsVt,
      bar: 'bg-orange-500',
      dot: 'bg-orange-500',
    },
    { key: 'acquirers', label: 'Acquirers', amount: summary.acquirersVt, bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
    { key: 'lp', label: 'Liquidity pool', amount: summary.lpVt, bar: 'bg-blue-500', dot: 'bg-blue-500' },
  ].map(part => ({ ...part, pct: pctOf(part.amount, summary.vtSupply) }));

  const hasLp = BigInt(summary.lpVt || 0) > 0n || BigInt(summary.lpNative || 0) > 0n;
  const hasNativeFlow = BigInt(summary.contributorsNative || 0) > 0n || BigInt(summary.lpNative || 0) > 0n;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-dark-100 leading-relaxed">
        The vault closed its acquire window and locked in its valuation. {fmtVt(summary.vtSupply)} {vt} were split
        between {summary.contributorsCount} {summary.contributorsCount === 1 ? 'contributor' : 'contributors'} and{' '}
        {summary.acquirersCount} {summary.acquirersCount === 1 ? 'acquirer' : 'acquirers'}
        {hasLp ? ', and part was set aside to seed a liquidity pool' : ''}.
        {hasNativeFlow && ` Raised ${native} went to contributors${hasLp ? ' and the pool' : ''}.`}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <LockStat label="Assets value" value={`${fmtNative(summary.assetsValue)} ${native}`} />
        <LockStat label="Raised" value={`${fmtNative(summary.totalRaised)} ${native}`} />
        <LockStat label="FDV" value={summary.fdv ? `${fmtNative(summary.fdv)} ${native}` : '-'} />
        <LockStat
          label="Participants"
          value={summary.contributorsCount + summary.acquirersCount}
          hint={`${summary.contributorsCount} contrib · ${summary.acquirersCount} acq`}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-100">{vt} distribution</p>
          <p className="text-xs text-dark-100">
            {fmtVt(summary.vtSupply)} {vt} total
          </p>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-steel-850 ring-1 ring-steel-750">
          {split
            .filter(part => part.pct > 0)
            .map(part => (
              <div key={part.key} className={clsx('h-full', part.bar)} style={{ width: `${part.pct}%` }} />
            ))}
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {split.map(part => (
            <div
              key={part.key}
              className="flex items-center gap-2 rounded-lg bg-steel-850 border border-steel-750 px-3 py-2"
            >
              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', part.dot)} />
              <div className="min-w-0">
                <p className="text-xs text-dark-100">
                  {part.label} · <span className="text-white font-medium">{part.pct}%</span>
                </p>
                <p className="text-sm text-white truncate">
                  {fmtVt(part.amount)} {vt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasNativeFlow && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dark-100 mb-2">Where the {native} went</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <LockStat label="To contributors" value={`${fmtNative(summary.contributorsNative)} ${native}`} />
            <LockStat label="Paired into LP" value={hasLp ? `${fmtNative(summary.lpNative)} ${native}` : 'No LP'} />
          </div>
        </div>
      )}

      {summary.txHash && (
        <button
          onClick={() => window.open(getTransactionUrl(summary.txHash, vault?.chainType), '_blank')}
          className="self-start inline-flex items-center gap-1 px-2 py-1 rounded-md bg-steel-850 border border-steel-750 hover:border-orange-500/50 text-xs text-dark-100 hover:text-orange-500 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View lock transaction
        </button>
      )}
    </div>
  );
};

const ActivityCard = ({ activity, vault }) => {
  const router = useRouter();
  const { currencyLabel } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);

  const activityType = activity.activityType === 'transaction' ? activity.type : activity.activityType;
  const config = ACTIVITY_TYPES[activityType] || ACTIVITY_TYPES.contribute;
  const Icon =
    activity.activityType === 'proposal' ? PROPOSAL_STAGES[activity.stage]?.icon || config.icon : config.icon;
  const title = getActivityTitle(activity, currencyLabel);

  const isTransaction = activity.activityType === 'transaction';
  const isProposal = activity.activityType === 'proposal';
  const isRebalance = activity.activityType === 'index_rebalance';
  const lockSummary =
    activity.activityType === 'phase_transition' && activity.phase === 'locked' ? activity.summary : null;
  const hasDetails =
    lockSummary ||
    activity.user ||
    (isTransaction && activity.type === 'contribute' && activity.assets?.length > 0) ||
    isProposal ||
    isRebalance;

  const handleOwnerClick = ownerId => {
    if (ownerId) {
      router.navigate({
        to: '/profile/$id',
        params: { id: ownerId },
      });
    }
  };

  const getDescription = () => {
    if (isTransaction) {
      switch (activity.type) {
        case 'create-vault': {
          return 'Vault was initialized';
        }
        case 'contribute': {
          return 'Assets contributed to vault';
        }
        case 'acquire': {
          return `${currencyLabel} spent on acquire`;
        }
        case 'evm-swap': {
          return 'Vault swap executed by a governance proposal';
        }
        default:
          return config.label;
      }
    } else if (activity.activityType === 'phase_transition') {
      const phaseDescriptions = {
        contribution: 'Vault entered contribution phase where users can contribute assets',
        acquire: 'Vault entered acquire phase where assets can be acquired',
        locked: 'Vault has been locked and is now in the final phase',
      };
      return phaseDescriptions[activity.phase] || 'Vault moved to next phase';
    } else if (isProposal) {
      return activity.description || config.label;
    }
    return config.label;
  };

  const openCardanoScan = () => {
    if (activity.tx_hash) {
      window.open(getTransactionUrl(activity.tx_hash, vault?.chainType), '_blank');
    }
  };

  const handleProposalClick = () => {
    if (activity.proposalId) {
      router.navigate({
        to: '/proposals/$id',
        params: { id: activity.proposalId },
      });
    }
  };

  const contributedAssets =
    isTransaction && activity.type === 'contribute'
      ? activity.assets?.filter(asset => asset.type === 'nft' || asset.type === 'ft') || []
      : [];
  const visibleAssets = showAllAssets ? contributedAssets : contributedAssets.slice(0, 4);
  const remainingAssets = contributedAssets.length - 4;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-steel-750 bg-steel-950 transition-all duration-200 hover:border-steel-700">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-steel-850">
            <Icon className={clsx('w-5 h-5', config.iconColor)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex sm:flex-row flex-col sm:items-center items-start gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  {isProposal && PROPOSAL_STAGES[activity.stage] && (
                    <span
                      className={clsx(
                        'text-xs font-medium uppercase px-2 py-0.5 rounded',
                        PROPOSAL_STAGES[activity.stage].color
                      )}
                    >
                      {PROPOSAL_STAGES[activity.stage].label}
                    </span>
                  )}
                  {isProposal && activity.actions?.length > 0 && (
                    <span className="text-xs text-dark-100">
                      {activity.actions.length} {activity.actions.length === 1 ? 'action' : 'actions'} executed
                    </span>
                  )}
                  {isRebalance && REBALANCE_STATUS[activity.status] && (
                    <span
                      className={clsx(
                        'text-xs font-medium uppercase px-2 py-0.5 rounded',
                        REBALANCE_STATUS[activity.status].color
                      )}
                    >
                      {REBALANCE_STATUS[activity.status].label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(activity.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isTransaction && activity.tx_hash && (
                  <button
                    onClick={openCardanoScan}
                    className="flex-shrink-0 inline-flex items-center gap-1 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                  >
                    <ExternalLink className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs text-white font-medium group-hover:text-orange-500 transition-colors hidden sm:block">
                      Show in Explorer
                    </span>
                  </button>
                )}
                {(isProposal || isRebalance) && activity.proposalId && (
                  <button
                    onClick={handleProposalClick}
                    className="flex-shrink-0 inline-flex items-center gap-1 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                  >
                    <Vote className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs text-white font-medium group-hover:text-orange-500 transition-colors hidden sm:block">
                      View Proposal
                    </span>
                  </button>
                )}
                {hasDetails && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex-shrink-0 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                    title={expanded ? 'Show less' : 'Show details'}
                  >
                    <ChevronUp
                      className={clsx(
                        'w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-all',
                        expanded ? '' : 'rotate-180'
                      )}
                    />
                  </button>
                )}
              </div>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-steel-750">
                {lockSummary ? (
                  <LockSummary summary={lockSummary} vault={vault} />
                ) : isRebalance ? (
                  <>
                    <p className="text-sm text-dark-100 mb-3">{getRebalanceDescription(activity)}</p>
                    <div className="flex flex-col gap-2">
                      {(activity.legs || []).map(leg => (
                        <div
                          key={leg.index}
                          className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-steel-850 border border-steel-750"
                        >
                          <span
                            className={clsx(
                              'text-xs font-medium uppercase px-2 py-0.5 rounded',
                              leg.side === 'buy' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                            )}
                          >
                            {leg.side}
                          </span>
                          <span className="text-sm text-white">
                            {formatTokenAmount(leg.amountIn, leg.assetIn?.decimals)} {leg.assetIn?.symbol}
                          </span>
                          <ArrowLeftRight className="w-3.5 h-3.5 text-dark-100" />
                          <span className="text-sm text-white">
                            {leg.status === 'confirmed' ? '' : '~'}
                            {formatTokenAmount(leg.amountOut, leg.assetOut?.decimals)} {leg.assetOut?.symbol}
                          </span>
                          {leg.status !== 'confirmed' && (
                            <span className="text-xs uppercase text-dark-100">{leg.status}</span>
                          )}
                          {leg.txHash && (
                            <button
                              onClick={() => window.open(getTransactionUrl(leg.txHash, vault?.chainType), '_blank')}
                              className="ml-auto inline-flex items-center gap-1 text-xs text-dark-100 hover:text-orange-500 transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Tx
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {activity.status === 'failed' && activity.lastError && (
                      <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
                        <p className="text-xs text-rose-400">{activity.lastError}</p>
                      </div>
                    )}
                  </>
                ) : isProposal ? (
                  <>
                    {activity.description && activity.description !== activity.title && (
                      <p className="text-sm text-dark-100 leading-relaxed">{activity.description}</p>
                    )}

                    <ProposalTimeline activity={activity} vault={vault} />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-dark-100 mb-3">{getDescription()}</p>

                    {activity.type === 'contribute' && contributedAssets.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {visibleAssets.map((asset, index) => (
                            <div key={asset.id || index} className="relative group">
                              {asset.type === 'ft' ? (
                                <div
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-850 border border-steel-750 pointer-events-none"
                                  title={`${asset.quantity} ${asset.name}`}
                                >
                                  <img
                                    src={
                                      vault?.chainType === 'robinhood'
                                        ? '/assets/icons/eth.svg'
                                        : '/assets/icons/ada.svg'
                                    }
                                    alt={asset.name || 'FT'}
                                    className="w-5 h-5"
                                  />
                                  <span className="text-sm font-medium text-white">
                                    {parseFloat(asset.quantity).toLocaleString()} {asset.name}
                                  </span>
                                </div>
                              ) : (
                                <div title={asset.name || 'NFT'}>
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-steel-850 border border-steel-750">
                                    {asset.image ? (
                                      <img
                                        src={asset.image}
                                        alt={asset.name || 'NFT'}
                                        className="w-full h-full object-cover"
                                        onError={e => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Coins className="w-6 h-6 text-dark-100" />
                                      </div>
                                    )}
                                  </div>
                                  {asset.name && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-steel-850 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none border border-steel-750">
                                      {asset.name}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {!showAllAssets && remainingAssets > 0 && (
                            <button
                              onClick={() => setShowAllAssets(true)}
                              className="w-12 h-12 rounded-lg flex items-center justify-center bg-steel-850 border border-steel-750 hover:border-orange-500/50 hover:bg-steel-750 transition-all cursor-pointer group"
                              title={`Show ${remainingAssets} more assets`}
                            >
                              <span className="text-sm font-medium text-dark-100 group-hover:text-orange-500 transition-colors">
                                +{remainingAssets}
                              </span>
                            </button>
                          )}
                        </div>
                        {showAllAssets && contributedAssets.length > 4 && (
                          <button
                            onClick={() => setShowAllAssets(false)}
                            className="mt-2 inline-flex items-center gap-1 text-sm text-dark-100 hover:text-orange-500 transition-colors"
                          >
                            <ChevronUp className="w-4 h-4" />
                            Show less
                          </button>
                        )}
                      </div>
                    )}

                    {activity.user && (
                      <button
                        onClick={() => handleOwnerClick(activity.user.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        <User className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm text-white font-medium group-hover:text-orange-500 transition-colors">
                          {activity.user.name || `User ${activity.user.id?.slice(0, 8)}`}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="py-12 flex items-center justify-center">
    <Spinner />
  </div>
);

const ErrorState = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-steel-850 mb-4">
      <Settings className="w-8 h-8 text-dark-100" />
    </div>
    <p className="text-white text-lg font-medium">Failed to load activity</p>
    <p className="text-dark-100 text-sm mt-2">Please try again later</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-steel-850 mb-4">
      <Coins className="w-8 h-8 text-dark-100" />
    </div>
    <p className="text-white text-lg font-medium">No activity yet</p>
    <p className="text-dark-100 text-sm mt-2">Transaction history will appear here</p>
  </div>
);

const ACTIVITY_FILTERS = ['All', 'Contribute', 'Acquire', 'Governance'];
const INDEX_ACTIVITY_FILTERS = [...ACTIVITY_FILTERS, 'Rebalance'];

const FILTER_MAP = {
  All: 'all',
  Contribute: 'contribute',
  Acquire: 'acquire',
  Governance: 'governance',
  Rebalance: 'rebalance',
};

export const VaultActivity = ({ vault }) => {
  const { currencyLabel } = useCurrency();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = vault?.vaultArchetype === 'index_weighted' ? INDEX_ACTIVITY_FILTERS : ACTIVITY_FILTERS;

  const { data, isLoading, error } = useVaultActivity(vault?.id, {
    page,
    limit,
    sortOrder: 'DESC',
    filter: FILTER_MAP[activeFilter],
  });

  const responseData = data?.data || data;
  const items = responseData?.items || [];
  const pagination = {
    currentPage: responseData?.page || page,
    totalPages: responseData?.totalPages || 1,
    totalItems: responseData?.total || 0,
  };

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = filter => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleDownloadCSV = async () => {
    try {
      toast.loading('Preparing CSV...', { id: 'download' });

      const allData = await VaultsApiProvider.getVaultActivity(vault?.id, {
        page: 1,
        sortOrder: 'DESC',
        filter: FILTER_MAP[activeFilter],
        isExport: true,
      });

      const allActivities = allData?.data?.items || allData?.items || [];

      if (!allActivities.length) {
        toast.error('No activities to export', { id: 'download' });
        return;
      }

      const headers = [
        'Date',
        'Type',
        'Activity',
        'Description',
        'User Address',
        'Asset Names',
        'Policy IDs',
        'TX Hash',
      ];

      const rows = allActivities.map(activity => {
        const isTransaction = activity.activityType === 'transaction';
        const isPhaseTransition = activity.activityType === 'phase_transition';
        const isProposal = activity.activityType === 'proposal';
        const isRebalance = activity.activityType === 'index_rebalance';

        let activityType = '';
        if (isTransaction) {
          activityType = activity.type;
        } else if (isPhaseTransition) {
          activityType = 'phase_transition';
        } else if (isRebalance) {
          activityType = 'index_rebalance';
        } else if (isProposal) {
          activityType = `proposal ${activity.stage}`;
        }

        let description = '';
        if (isTransaction) {
          switch (activity.type) {
            case 'create-vault':
              description = 'Vault was initialized';
              break;
            case 'contribute':
              description = 'Assets contributed to vault';
              break;
            case 'acquire':
              description = `${currencyLabel} spent on acquire`;
              break;
            case 'evm-swap':
              description = `Vault swap: ${getSwapSummary(activity)}`;
              break;
          }
        } else if (isPhaseTransition) {
          const phaseDescriptions = {
            contribution: 'Vault entered contribution phase where users can contribute assets',
            acquire: 'Vault entered acquire phase where assets can be acquired',
            locked: 'Vault has been locked and is now in the final phase',
          };
          description = phaseDescriptions[activity.phase] || 'Vault moved to next phase';
        } else if (isRebalance) {
          description = `${getRebalanceDescription(activity)} (${activity.status})`;
        } else {
          description = activity.description || '';
        }

        const userAddress = activity.user?.address || '';

        let assetNames = '';
        let policyIds = '';
        if (isTransaction && activity.type === 'contribute' && activity.assets?.length > 0) {
          const contributedAssets = activity.assets.filter(asset => asset.type === 'nft' || asset.type === 'ft');
          assetNames = contributedAssets
            .map(asset => {
              if (asset.type === 'ft') {
                return `${parseFloat(asset.quantity).toLocaleString()} ${asset.name || asset.asset_id || 'Unknown'}`;
              }
              return asset.name || asset.asset_id || 'Unknown';
            })
            .join('; ');
          policyIds = contributedAssets.map(asset => asset.policy_id || 'Unknown').join('; ');
        }
        if (isRebalance) {
          assetNames = (activity.legs || []).map(formatLeg).join('; ');
        }
        if (isProposal) {
          assetNames = (activity.actions || []).map(getProposalActionTitle).join('; ');
        }

        return [
          formatDateTime(activity.created_at),
          activityType,
          getActivityTitle(activity, currencyLabel),
          description,
          userAddress,
          assetNames,
          policyIds,
          isRebalance
            ? (activity.legs || [])
                .map(leg => leg.txHash)
                .filter(Boolean)
                .join('; ')
            : isProposal
              ? (activity.actions || []).flatMap(getProposalActionTxHashes).join('; ')
              : activity.tx_hash || '',
        ];
      });

      const csvString = [headers, ...rows]
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${vault.name}_activity_${FILTER_MAP[activeFilter]}.csv`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV downloaded successfully', { id: 'download' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV', { id: 'download' });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase text-white">Vault Activity</h2>
              {!isLoading && !error && items.length > 0 && (
                <span className="text-sm text-dark-100 bg-steel-750 px-3 py-1 rounded-full">
                  {pagination.totalItems} {pagination.totalItems === 1 ? 'activity' : 'activities'}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              <LavaTabs
                tabs={filters}
                activeTab={activeFilter}
                onTabChange={handleFilterChange}
                className="w-full sm:w-auto"
              />
              <SecondaryButton className="w-full sm:w-auto" onClick={handleDownloadCSV}>
                <Download className="w-4 h-4" />
                Export CSV
              </SecondaryButton>
            </div>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {items.map((activity, index) => (
                  <ActivityCard key={activity.id || index} activity={activity} vault={vault} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
