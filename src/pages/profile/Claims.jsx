import { useEffect, useState } from 'react';
import { ExternalLink, Eye, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { LavaTabs } from '@/components/shared/LavaTabs';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useClaims, useBuildTerminationClaim, useSubmitTerminationClaim } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { Pagination } from '@/components/shared/Pagination';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useModalControls } from '@/lib/modals/modal.context';
import { ClaimsApiProvider } from '@/services/api/claims';

const tabOptions = [
  { id: 'distribution', name: 'Distribution', type: 'distribution' },
  { id: 'terminate', name: 'Distribution to Terminate', type: 'termination' },
  { id: 'l4va', name: '$L4VA', type: 'l4va' },
  { id: 'cancellation', name: 'Cancellation', type: 'cancellation' },
];

const ASSET_TYPE_LABELS = {
  contributor: 'Contributor Reward',
  acquirer: 'Acquirer Reward',
  expansion: 'Expansion Reward',
  owner: 'Owner Reward',
};

const DEFAULT_TAB = 'distribution';

export const Claims = () => {
  const initialTab = tabOptions.find(tab => tab.id === DEFAULT_TAB);

  const wallet = useWallet('handler', 'isConnected', 'isUpdatingUtxos');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [status, setStatus] = useState('idle');
  const [processedClaim, setProcessedClaim] = useState(null);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [claims, setClaims] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: initialTab.type,
  });

  const { data, isLoading, error, refetch } = useClaims(filters);
  const pagination = data?.data || { page: 1, total: 0, limit: 10 };

  const buildTerminationClaim = useBuildTerminationClaim();
  const submitTerminationClaim = useSubmitTerminationClaim();

  const { openModal } = useModalControls();

  useEffect(() => {
    if (data?.data?.items) {
      setClaims(data.data.items);
    }
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleTabChange = tab => {
    const selectedTab = tabOptions.find(t => t.name === tab);
    if (selectedTab) {
      setActiveTab(selectedTab);
      setFilters(prevFilters => ({
        ...prevFilters,
        page: 1,
        type: selectedTab.type,
      }));
    }
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    setFilters(prevFilters => ({
      ...prevFilters,
      page: page,
    }));
  };

  const handleClaim = async claim => {
    try {
      setProcessedClaim(claim.id);
      setStatus('building');

      // Find the claim to check its type
      const isTerminationClaim = claim?.type === 'termination';

      if (isTerminationClaim) {
        // Termination claim flow: send VT to admin wallet
        const buildResponse = await buildTerminationClaim.mutateAsync(claim.id);
        const { transactionId, presignedTx } = buildResponse.data;

        setStatus('signing');

        const signature = await wallet?.handler?.signTx(presignedTx, true);

        if (!signature) {
          throw new Error('Transaction signing was cancelled');
        }

        setStatus('submitting');

        await submitTerminationClaim.mutateAsync({
          transaction: presignedTx,
          vaultId: claim.rawData.vault.id,
          txId: transactionId,
          signatures: [signature],
        });

        toast.success('Termination claim processed!');
      } else {
        // Regular claim flow
        const { data } = await ClaimsApiProvider.receiveClaim(claim.id);

        setStatus('signing');

        const signature = await wallet?.handler?.signTx(data.presignedTx, true);

        if (!signature) {
          throw new Error('Transaction signing was cancelled');
        }

        setStatus('submitting');

        await ClaimsApiProvider.submitClaim(data.transactionId, {
          transaction: data.presignedTx,
          txId: data.txId,
          signatures: [signature],
          claimId: claim.id,
        });

        toast.success('Claim successful! Your item has been claimed.');
      }

      setSelectedClaims([]);
      await refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to claim item. Please try again.');
    } finally {
      setStatus('idle');
      setProcessedClaim(null);
    }
  };

  const formattedClaims = claims.map(claim => {
    const isTerminationClaim = claim.type === 'termination';
    const ftShares = claim.metadata?.ftShares || [];
    const hasFtDistribution = ftShares.length > 0;

    // Build reward display
    let rewardDisplay = null;
    if (claim.adaAmount && claim.adaAmount > 0) {
      rewardDisplay = `${(claim.adaAmount / 1000000).toLocaleString()} ADA`;
    }

    // Add FT information for termination claims
    let ftDisplay = null;
    if (isTerminationClaim && hasFtDistribution) {
      const ftCount = ftShares.length;
      ftDisplay = `+ ${ftCount} FT${ftCount > 1 ? 's' : ''}`;
    }

    return {
      id: claim.id,
      assets: claim.metadata?.assets,
      vault: claim.vault?.name || ASSET_TYPE_LABELS[claim.type] || 'Unknown Vault',
      image: claim.vault?.vaultImage,
      link: claim.vault?.id ? `/vaults/${claim.vault.id}` : '#',
      date: new Date(claim.updatedAt || claim.createdAt).toLocaleDateString('en-US') || 'N/A',
      reward: rewardDisplay,
      ftReward: ftDisplay,
      ftShares: ftShares,
      vt_tokens: `${claim.amount.toLocaleString()} ${claim.vault.vaultTokenTicker}`,
      status: claim.status || 'pending',
      type: claim.type,
      rawData: claim,
    };
  });

  const filteredClaims = formattedClaims.filter(claim => {
    const allowedStatuses = ['pending', 'claimed', 'failed', 'available'];
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
    if (claim.status === 'claimed' && claim.type !== 'termination') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Distributed</span>
        </div>
      );
    } else if (claim.status === 'claimed' && claim.type === 'termination') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Claimed</span>
        </div>
      );
    } else if (claim.status === 'pending') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Pending</span>
        </div>
      );
    } else if (claim.status === 'available' && claim.type === 'termination') {
      if (processedClaim === claim.id && status !== 'idle') {
        return (
          <PrimaryButton size="sm" disabled>
            {status.toUpperCase()}
          </PrimaryButton>
        );
      }

      return (
        <PrimaryButton
          size="sm"
          disabled={status !== 'idle' || wallet.isUpdatingUtxos}
          onClick={() => handleClaim(claim)}
        >
          {wallet.isUpdatingUtxos ? 'Updating UTXOs...' : 'Claim'}
        </PrimaryButton>
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
              {claim.vault}
            </a>
            {claim.reward && <span className="font-medium text-white text-base">{claim.reward}</span>}
            {claim.ftReward && <span className="font-medium text-green-400 text-sm">{claim.ftReward}</span>}
            <span className="font-medium text-white text-base">{claim.vt_tokens}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ClaimStatusIndicator claim={claim} />
        </div>
      </div>
      {claim.ftShares && claim.ftShares.length > 0 && (
        <div className="mt-2 pt-2 border-t border-steel-700">
          <p className="text-xs text-steel-400 mb-1">FT Distribution:</p>
          <div className="flex flex-wrap gap-2">
            {claim.ftShares.map((ft, idx) => (
              <div key={idx} className="text-xs bg-steel-800 px-2 py-1 rounded">
                <span className="text-green-400">{Number(ft.quantity).toLocaleString()}</span>
                <span className="text-steel-300 ml-1">{ft.name || ft.assetId.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-russo text-4xl uppercase text-white">My Distributions</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex-1 sm:w-auto">
          <LavaTabs
            className="overflow-x-auto text-sm md:text-base w-full"
            tabs={tabOptions.map(tab => tab.name)}
            activeTab={activeTab.name}
            onTabChange={handleTabChange}
          />
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
          <div className="overflow-x-auto rounded-2xl border border-steel-750 hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="text-dark-100 text-sm border-b border-steel-750">
                  <th className="px-4 py-3 text-left">Vault</th>
                  <th className="px-4 py-3 text-left">Preview</th>
                  <th className="px-4 py-3 text-left">Link</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">{activeTab.id !== 'cancellation' ? 'Reward' : 'Asset'}</th>
                  {activeTab.id !== 'cancellation' && <th className="px-4 py-3 text-left">Vault Tokens</th>}
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
                    {claim.reward || claim.ftReward ? (
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {claim.reward && <span className="font-medium text-white">{claim.reward}</span>}
                          {claim.ftReward && (
                            <span className="font-medium text-green-400 text-sm">{claim.ftReward}</span>
                          )}
                        </div>
                      </td>
                    ) : !claim.reward && activeTab.id === 'cancellation' && claim.assets ? (
                      <td className="px-4 py-3 font-medium text-white">
                        <button
                          onClick={() => openModal('NftModal', { assets: claim.assets })}
                          className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
                        >
                          Show All NFTs
                          <Eye size={16} />
                        </button>
                      </td>
                    ) : (
                      <td className="px-4 py-3 font-medium text-white">-</td>
                    )}
                    {activeTab.id !== 'cancellation' && (
                      <td className="px-4 py-3 font-medium text-white">{claim.vt_tokens}</td>
                    )}
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
