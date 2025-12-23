import { CheckCircle, XCircle, Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import PrimaryButton from '../shared/PrimaryButton';

import { ProposalField } from './ProposalInfo/ProposalField';
import { ProposalListField } from './ProposalInfo/ProposalListField';
import { MarketplaceActionsList } from './ProposalInfo/MarketplaceActionsList';
import { VoteButton } from './ProposalInfo/VoteButton';
import { VoteResultBar } from './ProposalInfo/VoteResultBar';

import { formatDate } from '@/utils/core.utils';
import { ProposalTypeLabels } from '@/utils/types';
import { useGovernanceProposal, useVoteOnProposal } from '@/services/api/queries.js';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

export const ProposalInfo = ({ proposal }) => {
  const { user } = useAuth();
  const { openModal } = useModalControls();
  const router = useRouter();

  const { data: response, refetch } = useGovernanceProposal(proposal.id);

  const proposalInfo = response?.data?.proposal;
  const [canVote, setCanVote] = useState(response?.data?.canVote);
  const votes = response?.data?.votes || [];
  const totalVotes = response?.data?.votes?.length;
  const proposer = response?.data?.proposer;
  const [selectedVote, setSelectedVote] = useState(response?.data?.selectedVote);

  const handleOwnerProposalClick = id => {
    router.navigate({
      to: '/profile/$id',
      params: { id },
    });
  };

  const informationItems = [
    {
      label: 'Proposer',
      value: proposer?.address
        ? `${proposer.address.substring(0, 6)}...${proposer.address.substring(proposer.address.length - 6)}`
        : 'N/A',
      onClick: () => proposer && handleOwnerProposalClick(proposer?.id),
    },
    { label: 'IPFS', value: proposalInfo?.ipfsHash || 'N/A' },
    { label: 'Voting system', value: proposalInfo?.votingSystem ?? 'Single choice' },
    { label: 'Start at', value: proposalInfo?.startDate ? formatDate(proposalInfo.startDate) : 'N/A' },
    { label: 'End at', value: proposalInfo?.endDate ? formatDate(proposalInfo.endDate) : 'N/A' },
  ];

  const getProposalData = () => {
    const marketplaceActions = proposalInfo?.metadata?.marketplaceActions || [];
    const executionOptions = {
      label: 'Execution Options',
      value: ProposalTypeLabels[proposalInfo?.proposalType] || 'N/A',
    };

    switch (proposalInfo?.proposalType) {
      case 'staking':
        return [
          executionOptions,
          { label: 'Fungible Tokens', value: proposalInfo?.fungibleTokens || 'N/A', type: 'list' },
          { label: 'Non Fungible Tokens', value: proposalInfo?.nonFungibleTokens || 'N/A', type: 'list' },
        ];

      case 'distribution':
        return [
          executionOptions,
          { label: 'Distribution Assets', value: proposalInfo?.distributionAssets || 'N/A', type: 'list' },
        ];

      case 'termination':
        return [
          executionOptions,
          { label: 'Termination Reason', value: proposalInfo?.terminationReason || 'N/A', type: 'list' },
          { label: 'Termination Date', value: proposalInfo?.terminationDate || 'N/A', type: 'list' },
        ];

      case 'burning':
        return [executionOptions, { label: 'Burn Assets', value: proposalInfo?.burnAssets || 'N/A', type: 'list' }];

      case 'buy_sell':
        return marketplaceActions.length > 0
          ? [executionOptions, { label: 'Actions', value: marketplaceActions, type: 'buy_sell_list' }]
          : [];

      case 'marketplace_action':
        return marketplaceActions.length > 0
          ? [executionOptions, { label: 'Actions', value: marketplaceActions, type: 'marketplace_actions_list' }]
          : [];

      default:
        return [];
    }
  };

  const voteOnProposal = useVoteOnProposal(proposalInfo?.vaultId);

  const handleVote = async (proposalId, voteType) => {
    if (!user) {
      openModal('LoginModal');
      return;
    }
    try {
      await voteOnProposal.mutateAsync({
        proposalId,
        voteData: {
          vote: voteType.toLowerCase(),
          voterAddress: user.address,
        },
      });
      setCanVote(false);
      setSelectedVote(voteType);
      toast.success('Your vote has been recorded successfully');
      await refetch();
    } catch (error) {
      console.error('Error voting on proposal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit vote';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (response?.data?.canVote !== undefined) {
      setCanVote(response.data.canVote);
    }
    if (response?.data?.selectedVote !== undefined) {
      setSelectedVote(response.data.selectedVote);
    }
  }, [response?.data?.canVote, response?.data?.selectedVote]);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2 md:row-span-3 bg-steel-950 border border-steel-750 rounded-lg p-6 space-y-8">
          <div className="space-y-2">
            <div className="text-dark-100 text-md mb-3">Ended {formatDate(proposalInfo?.endDate)}</div>
          </div>

          <div className="flex w-full justify-between gap-8 bg-steel-850 rounded-lg p-6 sm:flex-row flex-col">
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <h3 className="text-gray-400">Proposal title</h3>
                <span className="text-white break-words">{proposalInfo?.title}</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-gray-400">Proposal description</h3>
                <span className="text-white break-words">{proposalInfo?.description}</span>
              </div>
            </div>
            <div className="w-full">
              <div className="space-y-3">
                {proposalInfo &&
                  (() => {
                    const proposalData = getProposalData();
                    if (proposalData.length === 0) {
                      return informationItems.map((item, index) => (
                        <ProposalField key={index} label={item.label} value={item.value} onClick={item.onClick} />
                      ));
                    }

                    return proposalData.map((item, index) => {
                      if (item.type === 'list') {
                        return <ProposalListField key={index} label={item.label} value={item.value} />;
                      }

                      if (item.type === 'marketplace_actions_list') {
                        return <MarketplaceActionsList key={index} actions={item.value} type="marketplace" />;
                      }

                      if (item.type === 'buy_sell_list') {
                        return <MarketplaceActionsList key={index} actions={item.value} type="buy_sell" />;
                      }

                      return <ProposalField key={index} label={item.label} value={item.value} />;
                    });
                  })()}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {proposal.status === 'active' ? (
              <>
                <VoteButton
                  voteType="yes"
                  icon={CheckCircle}
                  label="Yes, pass this Proposal"
                  canVote={canVote}
                  isSelected={selectedVote === 'yes'}
                  onClick={() => setSelectedVote('yes')}
                />
                <VoteButton
                  voteType="no"
                  icon={XCircle}
                  label="No, do not pass this Proposal"
                  canVote={canVote}
                  isSelected={selectedVote === 'no'}
                  onClick={() => setSelectedVote('no')}
                />
                {proposalInfo?.abstain && (
                  <VoteButton
                    voteType="abstain"
                    icon={Ellipsis}
                    label="Do nothing"
                    canVote={canVote}
                    isSelected={selectedVote === 'abstain'}
                    onClick={() => setSelectedVote('abstain')}
                  />
                )}

                <div className="flex justify-center">
                  <PrimaryButton
                    className="w-60 rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
                    onClick={() => (canVote && selectedVote ? handleVote(proposalInfo.id, selectedVote) : null)}
                    disabled={!canVote || !selectedVote}
                  >
                    <span className="text-white-500 text-2md flex items-center">Vote</span>
                  </PrimaryButton>
                </div>
              </>
            ) : proposal.status === 'upcoming' ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-gray-300">Voting for this proposal has not yet started.</div>
                <div className="text-sm text-gray-500">
                  Voting buttons will appear here once the voting period begins.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-gray-300">
                  This proposal voting period has concluded. You can view the final results below.
                </div>
                <div className="text-sm text-gray-500">Thank you for your participation in the governance process.</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-steel-950 border border-steel-750 rounded-lg p-6">
          <div className="flex justify-between">
            <h3 className="text-1xl font-bold">Votes</h3>
            <h3 className="text-orange-500 text-1xl font-bold">{totalVotes}</h3>
          </div>
          <div className="space-y-2">
            {votes.length ? (
              votes.map((vote, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <div className="text-gray-400">{`${vote.voterAddress?.substring(0, 6)}...${vote.voterAddress?.substring(vote.voterAddress.length - 6)}`}</div>
                  <div className="text-white">{vote.vote}</div>
                </div>
              ))
            ) : (
              <div className="text-center">No votes</div>
            )}
          </div>
        </div>
        <div className="bg-steel-950 border border-steel-750 rounded-lg p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-1xl font-bold">Information</h3>
            {informationItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="text-gray-400">{item.label}</div>
                <div
                  className={`text-white ${item.onClick ? 'cursor-pointer hover:text-orange-500' : ''}`}
                  onClick={item.onClick}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-1xl font-bold">Results</h3>
            <VoteResultBar votes={proposal.votes} hasAbstain={proposalInfo?.abstain} />
          </div>
        </div>
      </div>
    </div>
  );
};
