import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '@ada-anvil/weld/react';

import { LavaTabs } from '@/components/shared/LavaTabs';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useClaims } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { Pagination } from '@/components/shared/Pagination';
import L4vaIcon from '@/icons/l4va.svg?react';

const tabOptions = ['Distribution', 'Distribution to Terminate', '$L4VA'];

const TAB_TO_CLAIM_TYPES = {
  Distribution: ['contributor', 'acquirer'],
  'Distribution to Terminate': ['final_distribution'],
  $L4VA: ['l4va'],
};

const ASSET_TYPE_LABELS = {
  contributor: 'Contributor Reward',
  acquirer: 'Acquirer Reward',
  owner: 'Owner Reward',
};

export const Claims = () => {
  const [activeTab, setActiveTab] = useState(tabOptions[0]);
  const [status, setStatus] = useState('idle');
  const [processedClaim, setProcessedClaim] = useState(null);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const wallet = useWallet('handler', 'isConnected', 'isUpdatingUtxos');

  const { data, isLoading, error, refetch } = useClaims(currentPage, 10);
  const claims = data?.data?.items || [];
  const pagination = data?.data || { page: 1, total: 0, limit: 10 };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handleAdaAmount = amount => {
    if (amount && amount > 0) {
      return `${(amount / 1e6).toLocaleString()} ADA`;
    }

    return '-';
  };

  const handleVtAmount = (amount, claim) => {
    if (amount) {
      return `${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} TRM`;
    }

    return `${claim.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} TRM`;
  };

  const formattedClaims = claims.map(claim => {
    const date = claim.updated_at || claim.created_at;
    const adaAmount = handleAdaAmount(claim.metadata?.adaAmount);
    const userTotalVtTokens = handleVtAmount(claim.metadata?.userTotalVtTokens, claim);
    return {
      id: claim.id,
      vault: claim.vault?.name || ASSET_TYPE_LABELS[claim.type] || 'Unknown Vault',
      image: claim.vault?.vaultImage,
      link: claim.vault?.id ? `/vaults/${claim.vault.id}` : '#',
      date: date ? new Date(date).toLocaleDateString('en-US') : 'N/A',
      reward: adaAmount,
      vt_tokens: userTotalVtTokens,
      status: claim.status || 'pending',
      type: claim.type,
      rawData: claim,
    };
  });

  const filteredClaims = formattedClaims.filter(claim => {
    const allowedTypes = TAB_TO_CLAIM_TYPES[activeTab];
    if (!allowedTypes.includes(claim.type)) return false;

    const allowedStatuses = ['pending', 'claimed', 'failed'];
    return allowedStatuses.includes(claim.status);
  });

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

  const ClaimStatusIndicator = ({ claim }) => {
    if (claim.status === 'claimed') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Distributed</span>
        </div>
      );
    } else if (claim.status === 'pending') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Pending</span>
        </div>
      );
    } else if (claim.status === 'failed') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Failed</span>
        </div>
      );
    }

    if (processedClaim === claim.id && status !== 'idle') {
      return (
        <PrimaryButton size="sm" disabled>
          {status.toUpperCase()}
        </PrimaryButton>
      );
    }

    return <span>{claim.status}</span>;
  };

  const ClaimCard = ({ claim }) => (
    <div className={getCardClasses(claim)}>
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
            <span className="font-medium text-white text-base">{claim.vt_tokens}</span>
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
      <h2 className="font-russo text-4xl uppercase text-white">My Rewards</h2>
      <div>
        <LavaTabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab} />
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
          <div className="overflow-x-auto rounded-2xl border border-steel-750 hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="text-dark-100 text-sm border-b border-steel-750">
                  <th className="px-4 py-3 text-left">Vault</th>
                  <th className="px-4 py-3 text-left">Preview</th>
                  <th className="px-4 py-3 text-left">Link</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Reward</th>
                  <th className="px-4 py-3 text-left">Vault Tokens</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map(claim => (
                  <tr key={claim.id} className={getTableRowClasses(claim)}>
                    <td className="px-4 py-3 font-medium text-white">{claim.vault}</td>
                    <td className="px-4 py-3">
                      {claim.image ? (
                        <img
                          alt={`${claim.vault} preview`}
                          className="w-12 h-12 rounded-lg object-cover"
                          src={claim.image}
                        />
                      ) : (
                        <L4vaIcon className="w-12 h-12 rounded-lg object-cover" />
                      )}
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
                    <td className="px-4 py-3 font-medium text-white">{claim.vt_tokens}</td>
                    <td className="px-4 py-3">
                      <ClaimStatusIndicator claim={claim} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="block md:hidden">
            {filteredClaims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>

          {filteredClaims.length && Math.ceil(pagination.total / pagination.limit) > 1 ? (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(pagination.total / pagination.limit)}
                onPageChange={handlePageChange}
                className="justify-center"
              />
            </div>
          ) : null}

          {filteredClaims.length === 0 && <NoDataPlaceholder message="No claims found" />}
        </>
      )}
    </div>
  );
};
