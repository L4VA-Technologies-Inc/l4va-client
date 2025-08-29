import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, Check } from 'lucide-react';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { formatDate } from '@/utils/core.utils';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useGovernanceProposals } from '@/services/api/queries';

export const VaultGovernance = ({ vault }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [proposals, setProposals] = useState([]);
  const PROPOSAL_TABS = ['All', 'Active', 'Closed', 'Upcoming'];

  const tabOptions = PROPOSAL_TABS.map(tab => ({
    value: tab,
    label: tab,
  }));

  const { data, isLoading } = useGovernanceProposals(vault.id);

  const handleTabSelect = selectedTab => {
    setActiveTab(selectedTab);
  };

  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return proposal.status === 'Open';
    if (activeTab === 'Closed') return proposal.status === 'Closed';
    if (activeTab === 'Upcoming') return proposal.status === 'Upcoming';
    return false;
  });

  useEffect(() => {
    if (data?.data && !isLoading) {
      setProposals(data.data);
    }
  }, [data, isLoading]);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="flex flex-col items-center mb-6">
        {vault.imageUrl ? (
          <img alt={vault.name} className="w-[100px] h-[100px] rounded-full mb-4 object-cover" src={vault.imageUrl} />
        ) : (
          <div className="w-[100px] h-[100px] rounded-full mb-4 bg-steel-850 flex items-center justify-center">
            <L4vaIcon className="h-8 w-8 text-white" />
          </div>
        )}
        <h1 className="text-3xl font-bold">{vault.name}</h1>
      </div>
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
            className="w-full bg-gray-800"
            inactiveTabClassName="text-dark-100"
            tabClassName="flex-1 text-center"
            tabs={PROPOSAL_TABS}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
      <div className="space-y-6">
        {filteredProposals.map((proposal, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
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
                  className={`px-3 py-1 rounded-full text-xs ${
                    proposal.status === 'Closed'
                      ? 'bg-red-900 text-red-600'
                      : proposal.status === 'Open'
                        ? 'bg-green-900 text-green-500'
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

            <p className="text-dark-100 mb-6 text-sm">{proposal.description}</p>

            {proposal.votes && (
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
              </div>
            )}

            {!proposal.votes && (
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
