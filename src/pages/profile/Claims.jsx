'use client';

import { useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

import { LavaTabs } from '@/components/shared/LavaTabs';
import PrimaryButton from '@/components/shared/PrimaryButton';

// Updated mock data with clearer status values
const mockClaims = [
  {
    id: 1,
    vault: 'Vault 1',
    image: '/assets/vaults/space-man-1.webp',
    link: 'https://vault.link',
    date: '5/12/25',
    reward: '1658 ADA',
    status: 'claimed', // Already claimed
  },
  {
    id: 2,
    vault: 'Vault 2',
    image: '/assets/vaults/space-man-2.webp',
    link: 'https://vault.link',
    date: '3/22/25',
    reward: '40000 SNEK',
    status: 'pending', // Available to claim
  },
  {
    id: 3,
    vault: 'Vault 3',
    image: '/assets/vaults/space-man.webp',
    link: 'https://vault.link',
    date: '12/9/24',
    reward: '12000 L4VA',
    status: 'pending', // Available to claim
  },
  {
    id: 4,
    vault: 'Vault 4',
    image: '/assets/vaults/space-man-1.webp',
    link: 'https://vault.link',
    date: '6/2/25',
    reward: '435 ADA',
    status: 'claimed', // Already claimed
  },
  {
    id: 5,
    vault: 'Vault 5',
    image: '/assets/vaults/space-man-2.webp',
    link: 'https://vault.link',
    date: '2/16/25',
    reward: '282 L4VA',
    status: 'pending', // Available to claim
  },
  {
    id: 6,
    vault: 'Vault 6',
    image: '/assets/vaults/space-man.webp',
    link: 'https://vault.link',
    date: '4/4/25',
    reward: '435 ADA',
    status: 'claimed', // Already claimed
  },
];

const tabOptions = ['Distribution', 'Distribution to Terminate', '$L4VA'];
const filterOptions = [
  { value: 'all', label: 'All Claims' },
  { value: 'pending', label: 'Available to Claim' },
  { value: 'claimed', label: 'Already Claimed' },
];

export const Claims = () => {
  const [activeTab, setActiveTab] = useState(tabOptions[0]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedClaims, setSelectedClaims] = useState([]);

  // Filter claims based on selected filter
  const filteredClaims = mockClaims.filter(claim => {
    if (activeFilter === 'all') return true;
    return claim.status === activeFilter;
  });

  // Get only pending (claimable) items from filtered results
  const pendingClaims = filteredClaims.filter(claim => claim.status === 'pending');
  const pendingClaimIds = pendingClaims.map(claim => claim.id);

  // Check if all pending claims are selected
  const allPendingSelected = pendingClaimIds.length > 0 && pendingClaimIds.every(id => selectedClaims.includes(id));

  const toggleClaimSelection = claimId => {
    setSelectedClaims(prev => (prev.includes(claimId) ? prev.filter(id => id !== claimId) : [...prev, claimId]));
  };

  const handleSelectAllPending = () => {
    if (allPendingSelected) {
      // Deselect all pending claims
      setSelectedClaims(prev => prev.filter(id => !pendingClaimIds.includes(id)));
    } else {
      // Select all pending claims
      setSelectedClaims(prev => [...new Set([...prev, ...pendingClaimIds])]);
    }
  };

  const handleClaimSelected = () => {
    console.log('Claiming selected items:', selectedClaims);
  };

  const ClaimStatusIndicator = ({ claim }) => {
    if (claim.status === 'claimed') {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium">Claimed</span>
        </div>
      );
    }
    return (
      <PrimaryButton size="sm" onClick={() => console.log('Claim individual item:', claim.id)}>
        Claim Now
      </PrimaryButton>
    );
  };

  const SelectionCheckbox = ({ claim }) => {
    const isSelected = selectedClaims.includes(claim.id);
    const isPending = claim.status === 'pending';

    if (!isPending) {
      return (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      );
    }

    return (
      <div
        className={clsx(
          'w-6 h-6 rounded-full border-2 cursor-pointer transition-all',
          isSelected ? 'bg-orange-500 border-orange-500' : 'border-steel-600 hover:border-orange-400'
        )}
        onClick={() => toggleClaimSelection(claim.id)}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={0}
      >
        {isSelected && <Check className="w-4 h-4 text-white m-0.5" />}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="font-russo text-4xl uppercase text-white">My Claims</h2>

      {/* Tabs */}
      <div>
        <LavaTabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PrimaryButton
            size="md"
            className="min-w-[140px]"
            onClick={handleSelectAllPending}
            disabled={pendingClaimIds.length === 0}
          >
            {allPendingSelected ? 'Deselect All' : 'Select All Pending'}
          </PrimaryButton>

          {selectedClaims.length > 0 && (
            <PrimaryButton
              size="md"
              className="min-w-[140px] bg-green-500 hover:bg-green-600 text-white"
              onClick={handleClaimSelected}
            >
              Claim {selectedClaims.length} Selected
            </PrimaryButton>
          )}
        </div>
        <div className="flex gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeFilter === option.value
                  ? 'bg-steel-750 text-white'
                  : 'text-steel-300 hover:text-orange-400 hover:bg-steel-800'
              )}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-steel-750">
        <table className="w-full">
          <thead>
            <tr className="text-dark-100 text-sm border-b border-steel-750">
              <th className="px-4 py-3 text-left w-12">
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full border-2 cursor-pointer transition-all',
                    allPendingSelected && pendingClaimIds.length > 0
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-steel-600 hover:border-orange-400',
                    pendingClaimIds.length === 0 && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={pendingClaimIds.length > 0 ? handleSelectAllPending : undefined}
                  role="checkbox"
                  aria-checked={allPendingSelected}
                  tabIndex={0}
                >
                  {allPendingSelected && pendingClaimIds.length > 0 && <Check className="w-4 h-4 text-white m-0.5" />}
                </div>
              </th>
              <th className="px-4 py-3 text-left">Vault</th>
              <th className="px-4 py-3 text-left">Preview</th>
              <th className="px-4 py-3 text-left">Link</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Reward</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map(claim => (
              <tr
                key={claim.id}
                className={clsx(
                  'transition-all duration-300 cursor-pointer',
                  selectedClaims.includes(claim.id)
                    ? 'bg-steel-750'
                    : claim.status === 'claimed'
                      ? 'bg-steel-850 opacity-75'
                      : 'bg-steel-850 hover:bg-steel-750'
                )}
              >
                <td className="px-4 py-3">
                  <SelectionCheckbox claim={claim} />
                </td>
                <td className="px-4 py-3 font-medium text-white">{claim.vault}</td>
                <td className="px-4 py-3">
                  <img
                    alt={`${claim.vault} preview`}
                    className="w-12 h-12 rounded-lg object-cover"
                    src={claim.image || '/placeholder.svg'}
                  />
                </td>
                <td className="px-4 py-3">
                  <a href={claim.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    View Vault
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 py-3 text-steel-300">{claim.date}</td>
                <td className="px-4 py-3 font-medium text-white">{claim.reward}</td>
                <td className="px-4 py-3">
                  <ClaimStatusIndicator claim={claim} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredClaims.length === 0 && (
        <div className="text-center py-12 text-steel-400">
          <p>No claims found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};
