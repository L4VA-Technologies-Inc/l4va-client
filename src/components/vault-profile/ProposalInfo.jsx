import { CheckCircle, XCircle, Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';

import PrimaryButton from '../shared/PrimaryButton';

import { formatDate } from '@/utils/core.utils';
import { useGovernanceProposal, useVoteOnProposal } from '@/services/api/queries.js';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

export const ProposalInfo = ({ proposal }) => {
  const { user } = useAuth();
  const { openModal } = useModalControls();
  const { data: response } = useGovernanceProposal(proposal.id);

  const proposalInfo = response?.data?.proposal;
  const [canVote, setCanVote] = useState(response?.data?.canVote);
  const votes = response?.data?.votes || [];
  const totalVotes = response?.data?.votes?.length;
  const [selectedVote, setSelectedVote] = useState(response?.data?.selectedVote);

  const informationItems = [
    { label: 'Proposer', value: proposalInfo?.proposer },
    { label: 'IPFS', value: proposalInfo?.ipfsHash },
    { label: 'Voting system', value: 'Single choice' },
    { label: 'Start at', value: formatDate(proposalInfo?.startDate) },
    { label: 'End at', value: formatDate(proposalInfo?.endDate) },
  ];

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
      window.location.reload();
    } catch (error) {
      console.error('Error voting on proposal:', error);
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
        <div className="col-span-1 md:col-span-2 md:row-span-3 bg-gray-800 rounded-lg p-6 space-y-8">
          <div className="space-y-2">
            <div>
              <h3 className="text-1xl font-bold">Vault Open Sale</h3>
            </div>
            <div className="text-dark-100 text-md mb-3">Ended {formatDate(proposalInfo?.endDate)}</div>
            <div className="break-words">{proposalInfo?.description}</div>
          </div>
          <div className="space-y-4">
            <div
              className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
              onClick={() => (canVote ? setSelectedVote('yes') : null)}
              style={{
                background: canVote
                  ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.00) 0%, rgba(34, 197, 94, 0.20) 100%), #2D3049'
                  : '#2D3049',
                color: canVote ? 'white' : '#4b7488',
                border: selectedVote === 'yes' ? '1px solid green' : '1px solid #2D3049',
              }}
            >
              <CheckCircle className="text-green-500 w-4 h-4 mr-1" />
              <span className="text-white-500 text-2md flex items-center">Yes, pass this Proposal</span>
            </div>
            <div
              onClick={() => (canVote ? setSelectedVote('no') : null)}
              className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
              style={{
                background: canVote
                  ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.00) 0%, rgba(239, 68, 68, 0.20) 100%), #2D3049'
                  : '#2D3049',
                color: canVote ? 'white' : '#4b7488',
                border: selectedVote === 'no' ? '1px solid green' : '1px solid #2D3049',
              }}
            >
              <XCircle className="text-red-500 w-4 h-4 mr-1" />
              <span className="text-white-500 text-2md flex items-center">No, do not pass this Proposal</span>
            </div>
            {proposalInfo?.abstain ? (
              <div
                onClick={() => (canVote ? setSelectedVote('abstain') : null)}
                className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
                style={{
                  background: canVote
                    ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.00) 0%, rgba(239, 68, 68, 0.20) 100%), #2D3049'
                    : '#2D3049',
                  color: canVote ? 'white' : '#4b7488',
                  border: selectedVote === 'abstain' ? '1px solid green' : '1px solid #2D3049',
                }}
              >
                <Ellipsis className="text-gray-500 w-4 h-4 mr-1" />
                <span className="text-white-500 text-2md flex items-center">Do nothing</span>
              </div>
            ) : null}

            <div className="flex justify-center">
              <PrimaryButton
                className="w-60 rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
                onClick={() => (canVote && selectedVote ? handleVote(proposalInfo.id, selectedVote) : null)}
                disabled={!canVote || !selectedVote}
              >
                <span className="text-white-500 text-2md flex items-center">Vote</span>
              </PrimaryButton>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
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
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-1xl font-bold">Information</h3>
            {informationItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="text-gray-400">{item.label}</div>
                <div className="text-white">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-1xl font-bold">Results</h3>
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
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${proposal.votes.yes}%` }} />
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
              {proposalInfo?.abstain ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm flex items-center">
                      <Ellipsis className="w-4 h-4 mr-1" />
                      Do nothing
                    </span>
                    <span className="text-gray-600 text-sm">{proposal.votes.abstain || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${proposal.votes.abstain}%` }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
