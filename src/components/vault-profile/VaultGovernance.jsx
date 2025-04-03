import { useState } from 'react';
import {
  CheckCircle, XCircle, ArrowRight, Check,
} from 'lucide-react';
import { LavaTabs } from '@/components/shared/LavaTabs';
import { formatDate } from '@/utils/core.utils';

export const VaultGovernance = () => {
  const [activeTab, setActiveTab] = useState('All');
  const PROPOSAL_TABS = ['All', 'Active', 'Closed', 'Upcoming'];

  const proposals = [
    {
      title: 'Vault Open Sale',
      description: 'Sed gravida feugiat diam. Duis pretium mollis nisl, non scelerisque velit vehicula vel. Praesent pulvinar tortor enim, vitae consectetur ex posuere id. Curabitur vehicula pellentesque viverra.',
      status: 'Closed',
      endDate: '2024-12-22T02:00:00Z',
      votes: {
        yes: 77,
        no: 23,
      },
    },
    {
      title: 'Vault Proposal',
      description: 'Sed gravida feugiat diam. Duis pretium mollis nisl, non scelerisque velit vehicula vel. Praesent pulvinar tortor enim, vitae consectetur ex posuere id. Curabitur vehicula pellentesque viverra.',
      status: 'Open',
      endDate: '2025-01-22T02:00:00Z',
      votes: {
        yes: 54,
        no: 46,
      },
    },
    {
      title: 'Distribution of Assets',
      description: 'Sed gravida feugiat diam. Duis pretium mollis nisl, non scelerisque velit vehicula vel. Praesent pulvinar tortor enim, vitae consectetur ex posuere id. Curabitur vehicula pellentesque viverra.',
      status: 'Upcoming',
      endDate: '2025-01-22T02:00:00Z',
    },
    {
      title: 'Distribution of Assets',
      description: 'Sed gravida feugiat diam. Duis pretium mollis nisl, non scelerisque velit vehicula vel. Praesent pulvinar tortor enim, vitae consectetur ex posuere id. Curabitur vehicula pellentesque viverra.',
      status: 'Closed',
      approved: true,
      endDate: '2025-01-22T02:00:00Z',
    },
  ];

  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return proposal.status === 'Open';
    if (activeTab === 'Closed') return proposal.status === 'Closed';
    if (activeTab === 'Upcoming') return proposal.status === 'Upcoming';
    return false;
  });

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Header with Logo */}
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-orange-500">
          <img
            alt="Spaceman Token Logo"
            className="w-full h-full object-cover"
            src="/api/placeholder/48/48"
          />
        </div>
        <h1 className="text-2xl font-bold">Spaceman Token</h1>
      </div>

      {/* Tabs using LavaTabs component */}
      <div className="mb-6">
        <LavaTabs
          activeTab={activeTab}
          activeTabClassName="text-primary"
          className="w-full bg-gray-800"
          inactiveTabClassName="text-dark-100"
          tabClassName="flex-1 text-center"
          tabs={PROPOSAL_TABS}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        {filteredProposals.map((proposal, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between mb-1">
              <h3 className="text-lg font-medium">{proposal.title}</h3>
              <div className="flex items-center">
                {proposal.approved && (
                  <span className="inline-flex items-center mr-2 text-main-green text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Approved
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    proposal.status === 'Closed' ? 'bg-red-900 text-main-red'
                      : proposal.status === 'Open' ? 'bg-green-900 text-main-green'
                        : 'bg-yellow-800 text-yellow-400'
                  }`}
                >
                  {proposal.status}
                </span>
              </div>
            </div>

            <div className="text-dark-100 text-sm mb-3">
              {proposal.status === 'Closed' ? 'Ended ' : 'Ends '}
              {formatDate(proposal.endDate)}
            </div>

            <p className="text-dark-100 mb-6 text-sm">
              {proposal.description}
            </p>

            {proposal.votes && (
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-main-green text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Yes, pass this Proposal
                    </span>
                    <span className="text-main-green text-sm">{proposal.votes.yes}%</span>
                  </div>
                  <div className="w-full bg-green-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-main-green h-2 rounded-full"
                      style={{ width: `${proposal.votes.yes}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-main-red text-sm flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      No, do not pass this Proposal
                    </span>
                    <span className="text-main-red text-sm">{proposal.votes.no}%</span>
                  </div>
                  <div className="w-full bg-red-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-main-red h-2 rounded-full"
                      style={{ width: `${proposal.votes.no}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!proposal.votes && (
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-main-green text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Yes, pass this Proposal
                    </span>
                    <span className="text-dark-100 text-sm">-</span>
                  </div>
                  <div className="w-full bg-green-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-main-green h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-main-red text-sm flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      No, do not pass this Proposal
                    </span>
                    <span className="text-dark-100 text-sm">-</span>
                  </div>
                  <div className="w-full bg-red-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-main-red h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button className="flex items-center text-dark-100 hover:text-white transition-colors" type="button">
                More Info
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};