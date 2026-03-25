import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Ellipsis,
  XCircle,
  CircleCheck,
  CircleArrowUp,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { ProposalInfo } from './ProposalInfo';
import { ProposalEndDate } from './ProposalEndDate';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { HoverHelp } from '@/components/shared/HoverHelp';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useDeleteProposal, useGovernanceProposals } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

const PROPOSAL_TABS = ['All', 'Upcoming', 'Active', 'Rejected', 'Finished'];

export const VaultGovernance = ({ vault }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [deletingProposalId, setDeletingProposalId] = useState(null);
  const { user } = useAuth();
  const { openModal } = useModalControls();

  const queryClient = useQueryClient();
  const deleteProposalMutation = useDeleteProposal();

  const tabOptions = PROPOSAL_TABS.map(tab => ({
    value: tab,
    label: tab,
  }));

  const { data, isLoading } = useGovernanceProposals(vault.id);

  const currentUserId = user?.id;
  const isDeleteInProgress = deleteProposalMutation.isPending || deletingProposalId !== null;

  const handleDeleteProposal = proposal => {
    if (isDeleteInProgress) return;
    if (!proposal?.id || !vault?.id) return;
    if (!currentUserId) return;

    const canDelete = proposal.status === 'upcoming' && proposal?.creatorId === currentUserId;
    if (!canDelete) return;

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

  useEffect(() => {
    if (data?.data && !isLoading) {
      setProposals(data.data);
    }
  }, [data, isLoading]);

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

  const showProposalList = ['locked', 'burned', 'terminating', 'expansion'].includes(vault.vaultStatus);

  return (
    <div className="text-white min-h-screen p-6 rounded-2xl overflow-hidden">
      <div className="flex flex-col items-center mb-6">
        {vault.vaultImage ? (
          <img alt={vault.name} className="w-[100px] h-[100px] rounded-full mb-4 object-cover" src={vault.vaultImage} />
        ) : (
          <div className="w-[100px] h-[100px] rounded-full mb-4 bg-steel-850 flex items-center justify-center">
            <L4vaIcon className="h-8 w-8 text-white" />
          </div>
        )}
        <h1 className="text-3xl font-bold">{vault.name}</h1>
      </div>

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
                  onTabChange={setActiveTab}
                />
              </div>
            </div>
            {filteredProposals.length ? (
              <div className="space-y-6">
                {filteredProposals.map(proposal => {
                  const isDeletingProposal = deletingProposalId === proposal.id;

                  return (
                    <div
                      key={proposal.id}
                      className={`relative bg-steel-950 border border-steel-750 rounded-lg p-6 ${
                        isDeletingProposal ? 'overflow-hidden' : ''
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <h3 className="text-lg font-medium">{proposal.title}</h3>
                        <div className="flex items-center">
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

                      <div className="text-dark-100 text-sm mb-3">
                        <ProposalEndDate
                          startDate={proposal.startDate}
                          endDate={proposal.endDate}
                          proposalStatus={proposal.status}
                          isEnded={proposal.status === 'executed' || proposal.status === 'rejected'}
                        />
                      </div>

                      <p className="text-dark-100 mb-6 text-sm break-words">{proposal.description}</p>

                      {proposal.status !== 'active' ? (
                        renderInactiveStatus(proposal.status, proposal.executionError)
                      ) : proposal.votes ? (
                        <div className="space-y-3 mb-6">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-green-500 text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Yes, pass this Proposal
                              </span>
                              <span className="text-green-500 text-sm">{proposal.votes.yes}%</span>
                            </div>
                            <div className="w-full bg-green-900 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${proposal.votes.yes}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-red-600 text-sm flex items-center">
                                <XCircle className="w-4 h-4 mr-1" />
                                No, do not pass this Proposal
                              </span>
                              <span className="text-red-600 text-sm">{proposal.votes.no}%</span>
                            </div>
                            <div className="w-full bg-red-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${proposal.votes.no}%` }} />
                            </div>
                          </div>
                          {proposal?.abstain ? (
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-600 text-sm flex items-center">
                                  <Ellipsis className="w-4 h-4 mr-1" />
                                  Do nothing
                                </span>
                                <span className="text-gray-600 text-sm">{proposal.votes.abstain || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gray-600 h-2 rounded-full"
                                  style={{ width: `${proposal.votes.abstain || 0}%` }}
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-3 mb-6">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-green-500 text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Yes, pass this Proposal
                              </span>
                              <span className="text-dark-100 text-sm">-</span>
                            </div>
                            <div className="w-full bg-green-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-red-600 text-sm flex items-center">
                                <XCircle className="w-4 h-4 mr-1" />
                                No, do not pass this Proposal
                              </span>
                              <span className="text-dark-100 text-sm">-</span>
                            </div>
                            <div className="w-full bg-red-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <div className="flex items-center justify-end gap-3">
                          {proposal.status === 'upcoming' && currentUserId && proposal?.creatorId === currentUserId && (
                            <HoverHelp hint="Delete this proposal" variant="icon">
                              <button
                                className="p-2 rounded-md text-red-400 hover:text-red-500 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={() => handleDeleteProposal(proposal)}
                                disabled={isDeletingProposal || isDeleteInProgress}
                                aria-label="Delete proposal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </HoverHelp>
                          )}
                          <HoverHelp hint="Open proposal details" variant="icon">
                            <button
                              className="p-2 rounded-md text-dark-100 hover:text-white hover:bg-white/5 transition-colors"
                              type="button"
                              onClick={() => handleOpenProposalInfo(proposal)}
                              aria-label="More info"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </HoverHelp>
                        </div>
                      </div>
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
          </>
        )
      ) : (
        <LockedStatus />
      )}
    </div>
  );
};
