import { CheckCircle, Info, Wallet } from 'lucide-react';

const VOTE_LABELS = { yes: 'Yes', no: 'No', abstain: 'Abstain' };

const TONES = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  neutral: 'bg-steel-850 border-steel-750 text-gray-300',
};

/**
 * A disabled vote button is indistinguishable from a broken one, so every state
 * in which voting is unavailable says which state it is and what to do about it.
 */
export const VoteStateBanner = ({ state, selectedVote, tokenTicker, snapshotDate, onConnect }) => {
  if (state === 'open') return null;

  if (state === 'voted') {
    return (
      <div className={`flex items-start gap-3 rounded-lg border p-4 ${TONES.success}`}>
        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">You voted {VOTE_LABELS[selectedVote] ?? selectedVote}</p>
          <p className="text-sm text-gray-400">
            Your vote is recorded and counts toward the result below. Votes cannot be changed once cast.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'signed-out') {
    return (
      <div className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center ${TONES.info}`}>
        <Wallet className="w-5 h-5 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-sm text-gray-300">
          Connect the wallet that holds your {tokenTicker || 'vault'} tokens to vote on this proposal.
        </p>
        <button
          type="button"
          onClick={onConnect}
          className="shrink-0 rounded-md border border-blue-500/40 px-3 py-1.5 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/10"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  // No voting power: the snapshot, not the current balance, decides eligibility.
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${TONES.neutral}`}>
      <Info className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium text-white">You can&apos;t vote on this proposal</p>
        <p className="text-sm text-gray-400">
          Voting power came from a snapshot taken{' '}
          {snapshotDate ? `on ${snapshotDate}` : 'when the proposal was created'}, and this wallet held no{' '}
          {tokenTicker || 'vault'} tokens at that moment. Acquiring tokens now will count toward future proposals.
        </p>
      </div>
    </div>
  );
};
