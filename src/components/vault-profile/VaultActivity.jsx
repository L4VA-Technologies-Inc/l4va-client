import { useState } from 'react';
import { Rocket, Coins, Settings, User, Calendar, ChevronUp, ExternalLink, Bitcoin } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from '@tanstack/react-router';

import L4vaIcon from '@/icons/l4va.svg?react';
import { useVaultActivity } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/shared/Pagination';
import { getIPFSUrl } from '@/utils/core.utils';
import { IS_PREPROD } from '@/utils/networkValidation';

const TRANSACTION_TYPES = {
  'create-vault': {
    label: 'Vault Created',
    icon: Rocket,
    iconColor: 'text-orange-500',
  },
  contribute: {
    label: 'Contribution',
    icon: Bitcoin,
    iconColor: 'text-orange-500',
  },
  acquire: {
    label: 'Acquisition',
    icon: Coins,
    iconColor: 'text-orange-500',
  },
  'update-vault': {
    label: 'Phase Transition',
    icon: Settings,
    iconColor: 'text-orange-500',
  },
};

const formatDate = dateString => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAmount = amount => {
  if (!amount) return '0';
  const numValue = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numValue)) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const getTransactionTitle = transaction => {
  const config = TRANSACTION_TYPES[transaction.type] || TRANSACTION_TYPES.contribute;

  switch (transaction.type) {
    case 'create-vault': {
      return 'Vault Created';
    }

    case 'acquire': {
      const adaAsset = transaction.assets?.find(asset => asset.type === 'ada' || asset.policy_id === 'lovelace');
      if (adaAsset?.quantity) {
        return `${formatAmount(adaAsset.quantity)} ADA`;
      }
      if (transaction.amount) {
        return `${formatAmount(transaction.amount)} ADA`;
      }
      return 'Acquire';
    }

    case 'contribute': {
      const nftCount = transaction.assets?.length || 0;
      if (nftCount > 0) {
        return `${nftCount} ${nftCount === 1 ? 'Asset' : 'Assets'}`;
      }
      return 'Contribution';
    }

    case 'update-vault': {
      return 'Phase Transition';
    }

    default:
      return config.label;
  }
};

const ActivityCard = ({ transaction }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const config = TRANSACTION_TYPES[transaction.type] || TRANSACTION_TYPES.contribute;
  const Icon = config.icon;
  const title = getTransactionTitle(transaction);

  const hasDetails = transaction.user || (transaction.type === 'contribute' && transaction.assets?.length > 0);

  const handleOwnerClick = ownerId => {
    if (ownerId) {
      router.navigate({
        to: '/profile/$id',
        params: { id: ownerId },
      });
    }
  };

  const getDescription = () => {
    switch (transaction.type) {
      case 'create-vault': {
        return 'Vault was initialized';
      }
      case 'contribute': {
        return 'Assets contributed to vault';
      }
      case 'acquire': {
        return 'ADA spent on acquire';
      }
      case 'update-vault': {
        return 'Vault moved to next phase';
      }
      default:
        return config.label;
    }
  };

  const openCardanoScan = () => {
    if (transaction.tx_hash) {
      const baseUrl = IS_PREPROD ? 'https://preprod.cardanoscan.io' : 'https://cardanoscan.io';
      window.open(`${baseUrl}/transaction/${transaction.tx_hash}`, '_blank');
    }
  };

  const nftAssets =
    transaction.type === 'contribute' ? transaction.assets?.filter(asset => asset.type === 'nft') || [] : [];
  const visibleNFTs = showAllAssets ? nftAssets : nftAssets.slice(0, 4);
  const remainingNFTs = nftAssets.length - 4;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-steel-750 bg-steel-950 transition-all duration-200 hover:border-steel-700">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-steel-850">
            <Icon className={clsx('w-5 h-5', config.iconColor)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <div className="flex items-center gap-2 text-sm text-dark-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(transaction.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {transaction.tx_hash && (
                  <button
                    onClick={openCardanoScan}
                    className="flex-shrink-0 inline-flex items-center gap-1 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                  >
                    <ExternalLink className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs text-white font-medium group-hover:text-orange-500 transition-colors hidden sm:block">
                      Show in Explorer
                    </span>
                  </button>
                )}
                {hasDetails && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex-shrink-0 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                    title={expanded ? 'Show less' : 'Show details'}
                  >
                    <ChevronUp
                      className={clsx(
                        'w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-all',
                        expanded ? '' : 'rotate-180'
                      )}
                    />
                  </button>
                )}
              </div>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-steel-750">
                <p className="text-sm text-dark-100 mb-3">{getDescription()}</p>

                {transaction.type === 'contribute' && nftAssets.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {visibleNFTs.map((asset, index) => (
                        <div key={asset.id || index} className="relative group" title={asset.name || 'NFT'}>
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-steel-850 border border-steel-750 hover:border-orange-500/50 transition-colors">
                            {asset.image ? (
                              <img
                                src={getIPFSUrl(asset.image)}
                                alt={asset.name || 'NFT'}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Coins className="w-6 h-6 text-dark-100" />
                              </div>
                            )}
                          </div>
                          {asset.name && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-steel-850 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none border border-steel-750">
                              {asset.name}
                            </div>
                          )}
                        </div>
                      ))}
                      {!showAllAssets && remainingNFTs > 0 && (
                        <button
                          onClick={() => setShowAllAssets(true)}
                          className="w-12 h-12 rounded-lg flex items-center justify-center bg-steel-850 border border-steel-750 hover:border-orange-500/50 hover:bg-steel-750 transition-all cursor-pointer group"
                          title={`Show ${remainingNFTs} more assets`}
                        >
                          <span className="text-sm font-medium text-dark-100 group-hover:text-orange-500 transition-colors">
                            +{remainingNFTs}
                          </span>
                        </button>
                      )}
                    </div>
                    {showAllAssets && nftAssets.length > 4 && (
                      <button
                        onClick={() => setShowAllAssets(false)}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-dark-100 hover:text-orange-500 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                        Show less
                      </button>
                    )}
                  </div>
                )}

                {transaction.user && (
                  <button
                    onClick={() => handleOwnerClick(transaction.user.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                  >
                    <User className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                    <span className="text-sm text-white font-medium group-hover:text-orange-500 transition-colors">
                      {transaction.user.name || `User ${transaction.user.id?.slice(0, 8)}`}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="py-12 flex items-center justify-center">
    <Spinner />
  </div>
);

const ErrorState = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-steel-850 mb-4">
      <Settings className="w-8 h-8 text-dark-100" />
    </div>
    <p className="text-white text-lg font-medium">Failed to load activity</p>
    <p className="text-dark-100 text-sm mt-2">Please try again later</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-steel-850 mb-4">
      <Coins className="w-8 h-8 text-dark-100" />
    </div>
    <p className="text-white text-lg font-medium">No activity yet</p>
    <p className="text-dark-100 text-sm mt-2">Transaction history will appear here</p>
  </div>
);

export const VaultActivity = ({ vault }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useVaultActivity(vault?.id, {
    page,
    limit,
    sortOrder: 'DESC',
  });

  const responseData = data?.data || data;
  const items = responseData?.items || [];
  const pagination = {
    currentPage: responseData?.page || page,
    totalPages: responseData?.totalPages || 1,
    totalItems: responseData?.total || 0,
  };

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center mb-6">
          {vault.vaultImage ? (
            <img
              alt={vault.name}
              className="w-[100px] h-[100px] rounded-full mb-4 object-cover border-4 border-steel-750"
              src={vault.vaultImage}
            />
          ) : (
            <div className="w-[100px] h-[100px] rounded-full mb-4 bg-steel-850 flex items-center justify-center border-4 border-steel-750">
              <L4vaIcon className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-white">{vault.name}</h1>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase text-white">Vault Activity</h2>
            {!isLoading && !error && items.length > 0 && (
              <span className="text-sm text-dark-100 bg-steel-750 px-3 py-1 rounded-full">
                {pagination.totalItems} {pagination.totalItems === 1 ? 'transaction' : 'transactions'}
              </span>
            )}
          </div>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {items.map((transaction, index) => (
                  <ActivityCard key={transaction.id || index} transaction={transaction} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
