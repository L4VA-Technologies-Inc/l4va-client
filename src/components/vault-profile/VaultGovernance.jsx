import { useState } from 'react';
import {
  Check,
  CheckCircle,
  Ellipsis,
  XCircle,
  CircleCheck,
  CircleArrowUp,
  CircleAlert,
  ArrowLeft,
  Trash2,
  PauseCircle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useReadContract } from 'wagmi';

import { ProposalInfo } from './ProposalInfo';
import { ProposalEndDate } from './ProposalEndDate';
import { VoteButton } from './ProposalInfo/VoteButton';
import { ProposalCardAction } from './ProposalInfo/ProposalCardAction';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { Pagination } from '@/components/shared/Pagination';
import { useDeleteProposal, useGovernanceProposals } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { useRefetchWhenProposalStatusMayChange } from '@/hooks/useRefetchWhenProposalStatusMayChange';
import { ChainType } from '@/utils/types';

const PROPOSAL_TABS = ['All', 'Upcoming', 'Active', 'Rejected', 'Finished'];
const PROPOSALS_PER_PAGE = 2;

const VOTE_LABELS = { yes: 'Yes', no: 'No', abstain: 'Abstain' };

/**
 * Names the destination of the card's action instead of leaving a bare arrow.
 * First-time voters will not press an unlabeled control, so the label, size,
 * and tooltip all say where this goes.
 */
const getProposalAction = proposal => {
  if (proposal.status === 'active') {
    return proposal.selectedVote
      ? {
          label: 'View vote',
          isPrimary: false,
          hint: 'See how you voted and the current tally',
        }
      : {
          label: 'Vote',
          isPrimary: true,
          hint: 'Open this proposal to cast your vote',
        };
  }
  if (proposal.status === 'upcoming') {
    return { label: 'View details', isPrimary: false, hint: 'See this proposal before voting opens' };
  }
  return { label: 'View results', isPrimary: false, hint: 'See how this proposal ended' };
};

const VoteTally = ({ votes, abstain }) => (
  <div className="space-y-3 mb-6">
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-green-500 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          Yes, pass this Proposal
        </span>
        <span className="text-green-500 text-sm">{votes?.yes ?? 0}%</span>
      </div>
      <div className="w-full bg-green-900 rounded-full h-2 overflow-hidden">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${votes?.yes ?? 0}%` }} />
      </div>
    </div>
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-red-600 text-sm flex items-center">
          <XCircle className="w-4 h-4 mr-1" />
          No, do not pass this Proposal
        </span>
        <span className="text-red-600 text-sm">{votes?.no ?? 0}%</span>
      </div>
      <div className="w-full bg-red-900 rounded-full h-2 overflow-hidden">
        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${votes?.no ?? 0}%` }} />
      </div>
    </div>
    {abstain ? (
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600 text-sm flex items-center">
            <Ellipsis className="w-4 h-4 mr-1" />
            Do nothing
          </span>
          <span className="text-gray-600 text-sm">{votes?.abstain || 0}%</span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
          <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${votes?.abstain || 0}%` }} />
        </div>
      </div>
    ) : null}
  </div>
);

export const VaultGovernance = ({ vault }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [deletingProposalId, setDeletingProposalId] = useState(null);
  const { user } = useAuth();
  const { openModal } = useModalControls();

  const queryClient = useQueryClient();
  const deleteProposalMutation = useDeleteProposal();

  const isEvmVault = vault?.chainType === ChainType.ROBINHOOD;

  // Read on-chain pause state for EVM vaults only.
  const { data: isPaused } = useReadContract({
    address: vault?.contractAddress,
    abi: [{ type: 'function', stateMutability: 'view', name: 'paused', inputs: [], outputs: [{ type: 'bool' }] }],
    functionName: 'paused',
    query: { enabled: isEvmVault && !!vault?.contractAddress },
  });

  const tabOptions = PROPOSAL_TABS.map(tab => ({
    value: tab,
    label: tab,
  }));

  const { data, refetch } = useGovernanceProposals(vault.id, { page, limit: PROPOSALS_PER_PAGE });
  const responseData = data?.data || data;
  const proposals = Array.isArray(responseData) ? responseData : responseData?.items || [];
  useRefetchWhenProposalStatusMayChange(proposals, refetch);
  const totalPages = Array.isArray(responseData) ? 1 : responseData?.totalPages || 0;
  const currentPage = Array.isArray(responseData) ? page : responseData?.page || page;

  const currentUserId = user?.id;
  const isDeleteInProgress = deleteProposalMutation.isPending || deletingProposalId !== null;

  const handleDeleteProposal = proposal => {
    if (isDeleteInProgress) return;
    if (!proposal?.id || !vault?.id) return;
    if (!currentUserId) return;

    const canDelete = proposal.status === 'upcoming' && proposal?.creatorId === currentUserId;
    if (!canDelete) return;

    // Check if proposal starts in less than 1 hour
    if (proposal.startDate) {
      const now = new Date();
      const startTime = new Date(proposal.startDate);
      const timeUntilStart = startTime.getTime() - now.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      if (timeUntilStart < oneHourInMs) {
        toast.error('Proposal cannot be deleted within 1 hour of its start time');
        return;
      }
    }

    const performDelete = async () => {
      try {
        setDeletingProposalId(proposal.id);
        await deleteProposalMutation.mutateAsync(proposal.id);

        toast.success('Proposal deleted successfully');

        await queryClient.invalidateQueries({ queryKey: ['governance-proposals', vault.id] });

        setSelectedProposal(prev => (prev === proposal.id ? null : prev));
      } catch (error) {
        console.error('Error deleting proposal:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete proposal';
        toast.error(errorMessage);
      } finally {
        setDeletingProposalId(null);
      }
    };

    openModal('DeleteProposalConfirmModal', {
      proposalTitle: proposal.title || 'this proposal',
      onConfirm: performDelete,
    });
  };

  const handleTabSelect = selectedTab => {
    setActiveTab(selectedTab);
    setPage(1);
  };

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return proposal.status === 'active';
    if (activeTab === 'Passed') return proposal.status === 'passed';
    if (activeTab === 'Upcoming') return proposal.status === 'upcoming';
    if (activeTab === 'Active') return proposal.status === 'active';
    if (activeTab === 'Rejected') return proposal.status === 'rejected';
    if (activeTab === 'Finished') return proposal.status === 'executed' || proposal.status === 'passed';
    return false;
  });

  const handleOpenProposalInfo = proposal => {
    if (!user) {
      openModal('LoginModal');
      return;
    }
    setSelectedProposal(proposal.id);
  };

  const handleBackToProposals = () => {
    setSelectedProposal(null);
  };

  const LockedStatus = () => (
    <div className="flex flex-col items-center justify-center text-center mb-6">
      <div className="flex flex-col items-center justify-center text-center max-w-[350px]">
        <img
          alt="Locked status required"
          className="w-[200px] h-[200px] mb-4 object-contain"
          src="/assets/locked-vault.webp"
        />
        <h1 className="text-2xl font-bold">
          Governance will be available
          <br />
          when the vault is locked.
        </h1>
      </div>
    </div>
  );

  const renderInactiveStatus = (status, executionError) => {
    const proposalStatus = status === 'executed' || status === 'passed' ? 'finished' : status;
    const statusIconColors = {
      finished: {
        text: 'text-yellow-500',
        background: 'bg-yellow-500/20',
      },
      rejected: {
        text: 'text-red-500',
        background: 'bg-red-500/20',
      },
      upcoming: {
        text: 'text-steel-400',
        background: 'bg-steel-600',
      },
    };

    return (
      <div className="p-4 mb-6">
        <div className="flex items-center justify-center text-center">
          <div className={`flex flex-col items-center ${statusIconColors[proposalStatus].text}`}>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${statusIconColors[proposalStatus].background}`}
            >
              {proposalStatus === 'finished' && <CircleCheck className="w-6 h-6" />}
              {proposalStatus === 'rejected' && <XCircle className="w-6 h-6" />}
              {proposalStatus === 'upcoming' && <CircleArrowUp className="w-6 h-6" />}
            </div>
            <h4 className="text-lg font-semibold mb-2">Proposal {proposalStatus}</h4>
            {proposalStatus === 'upcoming' && <p className="text-sm">This proposal will be available soon.</p>}
            {proposalStatus !== 'upcoming' && executionError && (
              <p className="text-sm text-red-400 max-w-md">{executionError}</p>
            )}
            {proposalStatus !== 'upcoming' && !executionError && (
              <p className="text-sm">This proposal has been {proposalStatus}.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const showProposalList = ['locked', 'burned', 'terminating', 'expansion', 'acquire_expansion'].includes(
    vault.vaultStatus
  );

  return (
    <div className="text-white min-h-screen p-6 rounded-2xl overflow-hidden">
      {isPaused && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg px-4 py-3 mb-6">
          <PauseCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            This vault is currently paused. Contributions and new proposals are temporarily suspended.
          </span>
        </div>
      )}

      {showProposalList ? (
        selectedProposal ? (
          <div>
            <button
              onClick={handleBackToProposals}
              className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Proposals
            </button>
            <ProposalInfo proposalId={selectedProposal} />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="md:hidden mb-4">
                <LavaSelect
                  label="Select Tab"
                  options={tabOptions}
                  value={activeTab}
                  onChange={handleTabSelect}
                  placeholder="Select a tab"
                />
              </div>

              <div className="hidden md:block">
                <LavaTabs
                  activeTab={activeTab}
                  activeTabClassName="text-primary"
                  className="w-full bg-steel-850 overflow-x-auto text-sm md:text-base"
                  inactiveTabClassName="text-dark-100"
                  tabClassName="flex-1 text-center"
                  tabs={PROPOSAL_TABS}
                  onTabChange={handleTabSelect}
                />
              </div>
            </div>
            {filteredProposals.length ? (
              <div className="space-y-6">
                {filteredProposals.map(proposal => {
                  const isDeletingProposal = deletingProposalId === proposal.id;

                  // Check if proposal starts in less than 1 hour
                  const isWithinOneHourOfStart = () => {
                    if (!proposal.startDate) return false;
                    const now = new Date();
                    const startTime = new Date(proposal.startDate);
                    const timeUntilStart = startTime.getTime() - now.getTime();
                    const oneHourInMs = 60 * 60 * 1000;
                    return timeUntilStart < oneHourInMs;
                  };

                  const deleteButtonDisabled = isDeletingProposal || isDeleteInProgress || isWithinOneHourOfStart();
                  const deleteHint = isWithinOneHourOfStart()
                    ? 'Cannot delete within 1 hour of start time'
                    : 'Delete this proposal';

                  const action = getProposalAction(proposal);
                  const needsVote = proposal.status === 'active' && !proposal.selectedVote;

                  return (
                    <div
                      key={proposal.id}
                      className={`relative overflow-hidden rounded-2xl border border-steel-750 bg-steel-950 ${
                        isDeletingProposal ? 'overflow-hidden' : ''
                      }`}
                    >
                      <div className="p-6 pb-5">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                          <h3 className="text-lg font-medium break-words min-w-0">{proposal.title}</h3>
                          <div className="flex items-center shrink-0">
                            {proposal.approved && (
                              <span className="inline-flex items-center mr-2 text-green-500 text-sm">
                                <Check className="w-4 h-4 mr-1" />
                                Approved
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                proposal.status === 'executed' || proposal.status === 'passed'
                                  ? 'bg-yellow-700 text-yellow-400'
                                  : proposal.status === 'active'
                                    ? 'bg-green-900 text-green-500'
                                    : proposal.status === 'rejected'
                                      ? 'bg-red-900 text-red-600'
                                      : 'bg-steel-600 text-steel-400'
                              }`}
                            >
                              {proposal.status !== 'executed' && proposal.status !== 'passed'
                                ? proposal.status?.toLocaleUpperCase()
                                : 'FINISHED'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-3">
                          <ProposalEndDate
                            className="text-dark-100"
                            startDate={proposal.startDate}
                            endDate={proposal.endDate}
                            proposalStatus={proposal.status}
                          />
                          {proposal.status === 'active' &&
                            currentUserId &&
                            (proposal.selectedVote ? (
                              <span className="inline-flex items-center gap-1 text-green-500">
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                You voted {VOTE_LABELS[proposal.selectedVote] ?? proposal.selectedVote}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-yellow-400">
                                <CircleAlert className="w-3.5 h-3.5" aria-hidden="true" />
                                You haven&apos;t voted yet
                              </span>
                            ))}
                        </div>

                        <p className="text-dark-100 mb-6 text-sm break-words">{proposal.description}</p>

                        {needsVote ? (
                          <div className="mb-2 space-y-3">
                            <p className="text-sm font-medium text-white">Cast your vote</p>
                            <div aria-label="Vote options" className="space-y-3" role="radiogroup">
                              <VoteButton
                                voteType="yes"
                                icon={CheckCircle}
                                label="Yes, pass this Proposal"
                                canVote
                                isSelected={false}
                                onClick={() => handleOpenProposalInfo(proposal)}
                              />
                              <VoteButton
                                voteType="no"
                                icon={XCircle}
                                label="No, do not pass this Proposal"
                                canVote
                                isSelected={false}
                                onClick={() => handleOpenProposalInfo(proposal)}
                              />
                              {proposal.abstain ? (
                                <VoteButton
                                  voteType="abstain"
                                  icon={Ellipsis}
                                  label="Do nothing"
                                  canVote
                                  isSelected={false}
                                  onClick={() => handleOpenProposalInfo(proposal)}
                                />
                              ) : null}
                            </div>
                          </div>
                        ) : proposal.status !== 'active' ? (
                          renderInactiveStatus(proposal.status, proposal.executionError)
                        ) : (
                          <VoteTally votes={proposal.votes} abstain={proposal.abstain} />
                        )}

                        {proposal.status === 'upcoming' && currentUserId && proposal?.creatorId === currentUserId && (
                          <div className="mt-4 flex justify-end">
                            <HoverHelp hint={deleteHint} variant="icon">
                              <button
                                className="p-2 rounded-md text-red-400 hover:text-red-500 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={() => handleDeleteProposal(proposal)}
                                disabled={deleteButtonDisabled}
                                aria-label="Delete proposal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </HoverHelp>
                          </div>
                        )}
                      </div>
                      <ProposalCardAction
                        label={action.label}
                        hint={action.hint}
                        isPrimary={action.isPrimary}
                        onClick={() => handleOpenProposalInfo(proposal)}
                      />
                      {isDeletingProposal && (
                        <div className="absolute inset-0 z-20 rounded-lg bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full border-[3px] border-white/25 border-t-primary animate-spin" />
                            <span className="text-sm md:text-base font-medium text-white">Deleting proposal...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <NoDataPlaceholder
                message="No proposal found"
                iconBgColor="bg-orange-500/15"
                iconInnerBgColor="bg-orange-500/30"
              />
            )}
            {filteredProposals.length > 0 && totalPages > 1 && (
              <Pagination
                className="mt-6"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )
      ) : (
        <LockedStatus />
      )}
    </div>
  );
};
