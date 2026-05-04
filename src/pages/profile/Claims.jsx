import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye } from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

import { LavaTabs } from '@/components/shared/LavaTabs';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useClaims, useBuildTerminationClaim, useSubmitTerminationClaim } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useModalControls } from '@/lib/modals/modal.context';
import { ClaimsApiProvider } from '@/services/api/claims';
import { LavaTable } from '@/components/shared/LavaTable';

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
  const navigate = useNavigate();

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
      setFilters(prevFilters => ({ ...prevFilters, page: 1, type: selectedTab.type }));
    }
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    setFilters(prevFilters => ({ ...prevFilters, page }));
  };

  const handleClaim = async claim => {
    try {
      setProcessedClaim(claim.id);
      setStatus('building');

      const isTerminationClaim = claim?.type === 'termination';

      if (isTerminationClaim) {
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

    let rewardDisplay = null;
    if (claim.adaAmount && claim.adaAmount > 0) {
      rewardDisplay = `${(claim.adaAmount / 1000000).toLocaleString()} ADA`;
    }

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

  const filteredClaims = formattedClaims.filter(claim =>
    ['pending', 'claimed', 'failed', 'available'].includes(claim.status)
  );

  const getRowClassName = claim =>
    clsx('transition-all duration-300', {
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
    <div
      className={clsx('flex flex-col gap-3 rounded-xl p-4 mb-4 shadow border border-steel-750', {
        'bg-steel-750': selectedClaims.includes(claim.id),
        'bg-steel-850': !selectedClaims.includes(claim.id) && claim.status !== 'claimed',
      })}
    >
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

  const isCancellation = activeTab.id === 'cancellation';

  const columns = useMemo(
    () => [
      {
        key: 'vault',
        header: 'Vault',
        render: claim => (
          <div className="flex items-center gap-3">
            {claim.image ? (
              <img
                src={claim.image || '/favicon/favicon.ico'}
                alt={claim.image || '-'}
                className="w-12 h-12 rounded-full"
                onError={e => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <L4vaIcon className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div
              className="flex items-center gap-1 font-medium text-white uppercase hover:text-orange-500 transition-colors cursor-pointer"
              onClick={() => {
                if (!claim.link || claim.link === '#') return;
                navigate({ to: claim.link });
              }}
            >
              {claim.vault || '-'} <ExternalLink size={16} />
            </div>
          </div>
        ),
        cellClassName: 'pr-8 sm:pr-0',
      },
      {
        key: 'date',
        header: 'Date',
        accessor: 'date',
        cellClassName: 'text-steel-300',
      },
      {
        key: 'reward',
        header: isCancellation ? 'Asset' : 'Reward',
        render: claim => {
          if (claim.reward || claim.ftReward) {
            return (
              <div className="flex flex-col gap-1">
                {claim.reward && <span className="font-medium text-white">{claim.reward}</span>}
                {claim.ftReward && <span className="font-medium text-green-400 text-sm">{claim.ftReward}</span>}
              </div>
            );
          }
          if (!claim.reward && isCancellation && claim.assets) {
            return (
              <button
                onClick={() => openModal('NftModal', { assets: claim.assets })}
                className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
              >
                Show All NFTs
                <Eye size={16} />
              </button>
            );
          }
          return <span className="font-medium text-white">-</span>;
        },
      },
      {
        key: 'vt_tokens',
        header: 'Vault Tokens',
        accessor: 'vt_tokens',
        cellClassName: 'font-medium text-white',
        hidden: isCancellation,
      },
      {
        key: 'status',
        header: 'Status',
        render: claim => <ClaimStatusIndicator claim={claim} />,
      },
    ],
    [isCancellation, navigate, openModal, status, processedClaim, wallet, handleClaim]
  );

  const totalPages = Math.ceil(pagination.total / pagination.limit);

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

      <LavaTable
        columns={columns}
        data={filteredClaims}
        rowKey="id"
        isLoading={isLoading}
        error={error ? `Error loading claims: ${error.message}` : null}
        emptyMessage="No claims found"
        emptyComponent={<NoDataPlaceholder message="No claims found" />}
        getRowClassName={getRowClassName}
        mobileRender={claim => <ClaimCard claim={claim} />}
        pagination={
          filteredClaims.length && totalPages > 1
            ? { currentPage, totalPages, onPageChange: handlePageChange }
            : undefined
        }
      />
    </div>
  );
};
