import { CheckCircle, XCircle, Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';

import PrimaryButton from '../shared/PrimaryButton';

import { formatDate } from '@/utils/core.utils';
import { ProposalTypeLabels } from '@/utils/types';
import { useGovernanceProposal, useVoteOnProposal } from '@/services/api/queries.js';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

export const ProposalInfo = ({ proposal }) => {
  const { user } = useAuth();
  const { openModal } = useModalControls();
  const router = useRouter();

  const { data: response } = useGovernanceProposal(proposal.id);

  const proposalInfo = response?.data?.proposal;
  const [canVote, setCanVote] = useState(response?.data?.canVote);
  const votes = response?.data?.votes || [];
  const totalVotes = response?.data?.votes?.length;
  const proposer = response?.data?.proposer;
  const [selectedVote, setSelectedVote] = useState(response?.data?.selectedVote);

  const informationItems = [
    {
      label: 'Proposer',
      value: proposer?.address
        ? `${proposer.address.substring(0, 6)}...${proposer.address.substring(proposer.address.length - 6)}`
        : 'N/A',
      onClick: () => proposer && handleOwnerProposalClick(proposer?.id),
    },
    { label: 'IPFS', value: proposalInfo?.ipfsHash || 'N/A' },
    { label: 'Voting system', value: 'Single choice' || 'N/A' },
    { label: 'Start at', value: formatDate(proposalInfo?.startDate) || 'N/A' },
    { label: 'End at', value: formatDate(proposalInfo?.endDate) || 'N/A' },
  ];

  const proposalBuyingSelling =
    proposalInfo?.buyingSellingOptions?.length > 0
      ? [
          { label: 'Execution Options', value: ProposalTypeLabels[proposalInfo?.proposalType] || 'N/A' },
          { label: 'Asset Name', value: proposalInfo?.buyingSellingOptions[0]?.assetName || 'N/A' },
          { label: 'Exec', value: proposalInfo?.buyingSellingOptions[0]?.exec || 'N/A' },
          { label: 'Quantity', value: proposalInfo?.buyingSellingOptions[0]?.quantity || 'N/A' },
          { label: 'Sell Type', value: proposalInfo?.buyingSellingOptions[0]?.sellType || 'N/A' },
          { label: 'Method', value: proposalInfo?.buyingSellingOptions[0]?.method || 'N/A' },
          { label: 'Duration', value: proposalInfo?.buyingSellingOptions[0]?.duration || 'N/A' },
          { label: 'Market', value: proposalInfo?.buyingSellingOptions[0]?.market || 'N/A' },
          { label: 'Price', value: proposalInfo?.buyingSellingOptions[0]?.price || 'N/A' },
        ]
      : [];

  const proposalStaking = [
    { label: 'Execution Options', value: ProposalTypeLabels[proposalInfo?.proposalType] || 'N/A' },
    { label: 'Fungible Tokens', value: proposalInfo?.fungibleTokens || 'N/A', type: 'list' },
    { label: 'Non Fungible Tokens', value: proposalInfo?.nonFungibleTokens || 'N/A', type: 'list' },
  ];

  const proposalDistributing = [
    { label: 'Execution Options', value: ProposalTypeLabels[proposalInfo?.proposalType] || 'N/A' },
    { label: 'Distribution Assets', value: proposalInfo?.distributionAssets || 'N/A', type: 'list' },
  ];

  const proposalTerminating = [
    { label: 'Execution Options', value: ProposalTypeLabels[proposalInfo?.proposalType] || 'N/A' },
    { label: 'Termination Reason', value: proposalInfo?.terminationReason || 'N/A', type: 'list' },
    { label: 'Termination Date', value: proposalInfo?.terminationDate || 'N/A', type: 'list' },
  ];

  const proposalBuring = [
    { label: 'Execution Options', value: ProposalTypeLabels[proposalInfo?.proposalType] || 'N/A' },
    { label: 'Burn Assets', value: proposalInfo?.burnAssets || 'N/A', type: 'list' },
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

  const handleOwnerProposalClick = id => {
    router.navigate({
      to: '/profile/$id',
      params: { id },
    });
  };
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
                    switch (proposalInfo?.proposalType) {
                      case 'staking':
                        return proposalStaking.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div className="text-gray-400">{item.label}</div>
                            <div className="text-white">
                              {item.type === 'list' && Array.isArray(item.value) ? (
                                <div className="space-y-1">
                                  {item.value.map((v, i) => (
                                    <div key={i} className="text-sm">
                                      {typeof v === 'object' ? (v.name ?? JSON.stringify(v)) : v}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                item.value
                              )}
                            </div>
                          </div>
                        ));

                      case 'distribution':
                        return proposalDistributing.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div className="text-gray-400">{item.label}</div>
                            <div className="text-white">
                              {item.type === 'list' && Array.isArray(item.value) ? (
                                <div className="space-y-1">
                                  {item.value.map((v, i) => (
                                    <div key={i} className="text-sm">
                                      {typeof v === 'object' ? (v.name ?? JSON.stringify(v)) : v}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                item.value
                              )}
                            </div>
                          </div>
                        ));

                      case 'termination':
                        return proposalTerminating.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div className="text-gray-400">{item.label}</div>
                            <div className="text-white">
                              {item.type === 'list' && Array.isArray(item.value) ? (
                                <div className="space-y-1">
                                  {item.value.map((v, i) => (
                                    <div key={i} className="text-sm">
                                      {typeof v === 'object' ? (v.name ?? JSON.stringify(v)) : v}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                item.value
                              )}
                            </div>
                          </div>
                        ));

                      case 'burning':
                        return proposalBuring.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div className="text-gray-400">{item.label}</div>
                            <div className="text-white">
                              {item.type === 'list' && Array.isArray(item.value) ? (
                                <div className="space-y-1">
                                  {item.value.map((v, i) => (
                                    <div key={i} className="text-sm">
                                      {typeof v === 'object' ? (v.name ?? JSON.stringify(v)) : v}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                item.value
                              )}
                            </div>
                          </div>
                        ));

                      case 'buy_sell':
                        if (proposalBuyingSelling.length) {
                          console.log('proposalBuyingSelling', proposalBuyingSelling);
                          return proposalBuyingSelling.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <div className="text-gray-400">{item.label}</div>
                              <div className="text-white">{item.value}</div>
                            </div>
                          ));
                        }
                        return <div></div>;
                      default:
                        return informationItems.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div className="text-gray-400">{item.label}</div>
                            <div
                              className={`text-white ${item.onClick ? 'cursor-pointer hover:text-orange-500' : ''}`}
                              onClick={item.onClick}
                            >
                              {item.value}
                            </div>
                          </div>
                        ));
                    }
                  })()}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {proposal.status === 'active' ? (
              <>
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
            {proposal.votes ? (
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-green-500 text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Yes, pass this Proposal
                    </span>
                    <span className="text-green-500 text-sm">{proposal.votes.yes ?? 0}%</span>
                  </div>
                  <div className="w-full bg-green-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${proposal.votes.yes ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-red-600 text-sm flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      No, do not pass this Proposal
                    </span>
                    <span className="text-red-600 text-sm">{proposal.votes.no ?? 0}%</span>
                  </div>
                  <div className="w-full bg-red-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${proposal.votes.no ?? 0}%` }} />
                  </div>
                </div>

                {proposalInfo?.abstain && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 text-sm flex items-center">
                        <Ellipsis className="w-4 h-4 mr-1" />
                        Do nothing
                      </span>
                      <span className="text-gray-600 text-sm">{proposal.votes.abstain ?? 0}%</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${proposal.votes.abstain ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No votes data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
