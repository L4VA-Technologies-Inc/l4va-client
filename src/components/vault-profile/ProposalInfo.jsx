import { CheckCircle, XCircle, Ellipsis } from 'lucide-react';

import { formatDate } from '@/utils/core.utils';
import { useGovernanceProposal, useVoteOnProposal } from '@/services/api/queries.js';
import { useAuth } from '@/lib/auth/auth';

export const ProposalInfo = ({ proposal }) => {
  const { user } = useAuth();
  const { data: response } = useGovernanceProposal(proposal.id);

  const proposalInfo = response?.data?.proposal;
  console.log(response);
  const votes = response?.data?.votes || [];
  const totalVotes = response?.data?.votes?.length;

  const informationItems = [
    { label: 'Proposer', value: proposalInfo?.proposer },
    { label: 'IPFS', value: proposalInfo?.ipfsHash },
    { label: 'Voting system', value: 'Single choice' },
    { label: 'Start at', value: formatDate(proposalInfo?.startDate) },
    { label: 'End at', value: formatDate(proposalInfo?.endDate) },
  ];

  const voteOnProposal = useVoteOnProposal(proposalInfo?.vaultId);

  const handleVote = async (proposalId, voteType) => {
    try {
      console.log(proposalId, voteType, user.address);
      await voteOnProposal.mutateAsync({
        proposalId,
        voteData: {
          vote: voteType.toLowerCase(),
          voterAddress: user.address,
        },
      });
    } catch (error) {
      console.error('Error voting on proposal:', error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 row-span-3 bg-gray-800 rounded-lg p-6 space-y-8">
          <div className="space-y-2">
            <div>
              <h3 className="text-1xl font-bold">Vault Open Sale</h3>
            </div>
            <div className="text-dark-100 text-md mb-3">Ended {formatDate(proposalInfo?.endDate)}</div>
            <div>{proposalInfo?.description}</div>
          </div>
          <div className="space-y-4">
            <div
              className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
              onClick={() => handleVote(proposalInfo.id, 'yes')}
              style={{
                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.00) 0%, rgba(34, 197, 94, 0.20) 100%), #2D3049',
              }}
            >
              <CheckCircle className="text-green-500 w-4 h-4 mr-1" />
              <span className="text-white-500 text-2md flex items-center">Yes, pass this Proposal</span>
            </div>
            <div
              onClick={() => handleVote(proposalInfo.id, 'no')}
              className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.00) 0%, rgba(239, 68, 68, 0.20) 100%), #2D3049',
              }}
            >
              <XCircle className="text-red-500 w-4 h-4 mr-1" />
              <span className="text-white-500 text-2md flex items-center">No, do not pass this Proposal</span>
            </div>
            {proposalInfo?.abstain ? (
              <div
                onClick={() => handleVote(proposalInfo.id, 'abstain')}
                className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(239, 68, 68, 0.00) 0%, rgba(239, 68, 68, 0.20) 100%), #2D3049',
                }}
              >
                <Ellipsis className="text-gray-500 w-4 h-4 mr-1" />
                <span className="text-white-500 text-2md flex items-center">Do nothing</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="arow-span-2 col-start-1 row-start-4 bg-gray-800 rounded-lg p-6">
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
        <div className="col-start-2 row-start-4 bg-gray-800 rounded-lg p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-1xl font-bold ">Information</h3>
            {informationItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="text-gray-400">{item.label}</div>
                <div className="text-white">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3>Results</h3>
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
              {proposalInfo.abstain ? (
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
