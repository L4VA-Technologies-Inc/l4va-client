import { useState } from 'react';
import { Check, ExternalLink, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import { LavaTabs } from '@/components/shared/LavaTabs';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useClaims } from '@/services/api/queries';

// const mockClaims = [
//   {
//     id: 1,
//     vault: 'Vault 1',
//     image: '/assets/vaults/space-man-1.webp',
//     link: 'https://vault.link',
//     date: '5/12/25',
//     reward: '1658 ADA',
//     status: 'claimed', // Already claimed
//   },
//   {
//     id: 2,
//     vault: 'Vault 2',
//     image: '/assets/vaults/space-man-2.webp',
//     link: 'https://vault.link',
//     date: '3/22/25',
//     reward: '40000 SNEK',
//     status: 'pending', // Available to claim
//   },
//   {
//     id: 3,
//     vault: 'Vault 3',
//     image: '/assets/vaults/space-man.webp',
//     link: 'https://vault.link',
//     date: '12/9/24',
//     reward: '12000 L4VA',
//     status: 'pending', // Available to claim
//   },
//   {
//     id: 4,
//     vault: 'Vault 4',
//     image: '/assets/vaults/space-man-1.webp',
//     link: 'https://vault.link',
//     date: '6/2/25',
//     reward: '435 ADA',
//     status: 'claimed', // Already claimed
//   },
//   {
//     id: 5,
//     vault: 'Vault 5',
//     image: '/assets/vaults/space-man-2.webp',
//     link: 'https://vault.link',
//     date: '2/16/25',
//     reward: '282 L4VA',
//     status: 'pending', // Available to claim
//   },
//   {
//     id: 6,
//     vault: 'Vault 6',
//     image: '/assets/vaults/space-man.webp',
//     link: 'https://vault.link',
//     date: '4/4/25',
//     reward: '435 ADA',
//     status: 'claimed', // Already claimed
//   },
// ];

const tabOptions = ['Distribution', 'Distribution to Terminate', '$L4VA'];
const filterOptions = [
  { value: 'all', label: 'All Claims' },
  { value: 'available', label: 'Available to Claim' },
  { value: 'claimed', label: 'Already Claimed' },
];

const ASSET_TYPE_LABELS = {
  contributor: 'Contributor Reward',
  acquirer: 'Acquirer Reward',
  owner: 'Owner Reward',
};

export const Claims = () => {
  const [activeTab, setActiveTab] = useState(tabOptions[0]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedClaims, setSelectedClaims] = useState([]);

  const { data, isLoading, error } = useClaims();
  const claims = data?.data || [];

  const formattedClaims = claims.map(claim => ({
    id: claim.id,
    vault: claim.vault?.name || ASSET_TYPE_LABELS[claim.type] || 'Unknown Vault',
    image: claim.vault?.image || '/placeholder.svg',
    link: claim.vault?.id ? `/vaults/${claim.vault.id}` : '#',
    date: new Date(claim.created_at).toLocaleDateString(),
    reward: `${parseInt(claim.amount).toLocaleString()} VT`,
    status: claim.status || 'available',
    rawData: claim, // Keep the original data
  }));

  // Filter claims based on selected filter
  const filteredClaims = formattedClaims.filter(claim => {
    if (activeFilter === 'all') return true;
    return claim.status === activeFilter;
  });

  // Get only pending (claimable) items from filtered results
  // const pendingClaims = filteredClaims.filter(claim => claim.status === 'available');
  // const pendingClaimIds = pendingClaims.map(claim => claim.id);

  // Check if all pending claims are selected
  // const allPendingSelected = pendingClaimIds.length > 0 && pendingClaimIds.every(id => selectedClaims.includes(id));

  // const toggleClaimSelection = claimId => {
  //   setSelectedClaims(prev => (prev.includes(claimId) ? prev.filter(id => id !== claimId) : [...prev, claimId]));
  // };

  // const handleSelectAllPending = () => {
  //   if (allPendingSelected) {
  //     // Deselect all pending claims
  //     setSelectedClaims(prev => prev.filter(id => !pendingClaimIds.includes(id)));
  //   } else {
  //     // Select all pending claims
  //     setSelectedClaims(prev => [...new Set([...prev, ...pendingClaimIds])]);
  //   }
  // };

  // const handleClaimSelected = () => {
  //   console.log('Claiming selected items:', selectedClaims);
  // };

  // Reusable class combinations
  const getCardClasses = claim =>
    clsx('flex flex-col gap-3 rounded-xl p-4 mb-4 shadow border border-steel-750', {
      'bg-steel-750': selectedClaims.includes(claim.id),
      'bg-steel-850': !selectedClaims.includes(claim.id) && claim.status !== 'claimed',
    });

  const getTableRowClasses = claim =>
    clsx('transition-all duration-300 cursor-pointer', {
      'bg-steel-750': selectedClaims.includes(claim.id),
      'bg-steel-850 hover:bg-steel-750': !selectedClaims.includes(claim.id) && claim.status !== 'claimed',
    });

  const getFilterButtonClasses = value =>
    clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors', {
      'bg-steel-750 text-white': activeFilter === value,
      'text-steel-300 hover:text-orange-400 hover:bg-steel-800': activeFilter !== value,
    });

  // const getCheckboxClasses = (isSelected, isPending = true) =>
  //   clsx('w-6 h-6 rounded-full border-2 transition-all', {
  //     'bg-orange-500 border-orange-500': isSelected && isPending,
  //     'border-steel-600 hover:border-orange-400': !isSelected && isPending,
  //     'bg-green-500': !isPending,
  //     'cursor-pointer': isPending,
  //     'cursor-not-allowed opacity-50': !isPending,
  //   });

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

  // const SelectionCheckbox = ({ claim }) => {
  //   const isSelected = selectedClaims.includes(claim.id);
  //   const isPending = claim.status === 'available';

  //   return (
  //     <div
  //       className={getCheckboxClasses(isSelected, isPending)}
  //       onClick={isPending ? () => toggleClaimSelection(claim.id) : undefined}
  //       role="checkbox"
  //       aria-checked={isSelected}
  //       tabIndex={isPending ? 0 : undefined}
  //     >
  //       {(isSelected || !isPending) && <Check className="w-4 h-4 text-white m-0.5" />}
  //     </div>
  //   );
  // };

  const ClaimCard = ({ claim }) => (
    <div className={getCardClasses(claim)}>
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SelectionCheckbox claim={claim} />
          <span className="font-medium text-white text-lg">{claim.vault}</span>
        </div>
        <span className="text-steel-300 text-sm">{claim.date}</span>
      </div> */}
      <div className="flex items-center gap-3">
        <img
          alt={`${claim.vault} preview`}
          className="w-14 h-14 rounded-lg object-cover"
          src={claim.image || '/placeholder.svg'}
        />
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <a
              href={claim.link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-orange-400 hover:text-orange-300 text-sm"
            >
              {claim.link}
            </a>
            <span className="font-medium text-white text-base">{claim.reward}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ClaimStatusIndicator claim={claim} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-russo text-4xl uppercase text-white">My Claims</h2>
      <div>
        <LavaTabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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
        </div> */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={getFilterButtonClasses(option.value)}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="ml-2 text-steel-300">Loading your claims...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p>Error loading claims: {error.message}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile) */}
          <div className="overflow-x-auto rounded-2xl border border-steel-750 hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="text-dark-100 text-sm border-b border-steel-750">
                  {/* <th className="px-4 py-3 text-left w-12">
                    <div
                      className={getCheckboxClasses(allPendingSelected, pendingClaimIds.length > 0)}
                      onClick={pendingClaimIds.length > 0 ? handleSelectAllPending : undefined}
                      role="checkbox"
                      aria-checked={allPendingSelected}
                      tabIndex={pendingClaimIds.length > 0 ? 0 : undefined}
                    >
                      {allPendingSelected && pendingClaimIds.length > 0 && (
                        <Check className="w-4 h-4 text-white m-0.5" />
                      )}
                    </div>
                  </th> */}
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
                  <tr key={claim.id} className={getTableRowClasses(claim)}>
                    {/* <td className="px-4 py-3">
                      <SelectionCheckbox claim={claim} />
                    </td> */}
                    <td className="px-4 py-3 font-medium text-white">{claim.vault}</td>
                    <td className="px-4 py-3">
                      <img
                        alt={`${claim.vault} preview`}
                        className="w-12 h-12 rounded-lg object-cover"
                        src={claim.image}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={claim.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
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
          {/* Mobile Card List (only on mobile) */}
          <div className="block md:hidden">
            {filteredClaims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
          {filteredClaims.length === 0 && (
            <div className="text-center py-12 text-steel-400">
              <p>No claims found for the selected filter.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
