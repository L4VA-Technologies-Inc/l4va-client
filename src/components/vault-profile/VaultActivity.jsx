import { useState } from 'react';
import {
  Rocket,
  Coins,
  Settings,
  User,
  Calendar,
  ChevronUp,
  ExternalLink,
  Bitcoin,
  Vote,
  Play,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import L4vaIcon from '@/icons/l4va.svg?react';
import { useVaultActivity } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/shared/Pagination';
import { getIPFSUrl, formatDateTime } from '@/utils/core.utils';
import { IS_PREPROD } from '@/utils/networkValidation';
import { LavaTabs } from '@/components/shared/LavaTabs';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { VaultsApiProvider } from '@/services/api/vaults';
import { getSuccessMessage } from '@/constants/proposalMessages';

const ACTIVITY_TYPES = {
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
  phase_transition: {
    label: 'Phase Transition',
    icon: Settings,
    iconColor: 'text-orange-500',
  },
  proposal_created: {
    label: 'Proposal Created',
    icon: Vote,
    iconColor: 'text-orange-500',
  },
  proposal_started: {
    label: 'Voting Started',
    icon: Play,
    iconColor: 'text-orange-500',
  },
  proposal_ended: {
    label: 'Voting Ended',
    icon: CheckCircle,
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

const getActivityTitle = activity => {
  if (activity.activityType === 'transaction') {
    switch (activity.type) {
      case 'create-vault': {
        return 'Vault Created';
      }

      case 'acquire': {
        const adaAsset = activity.assets?.find(asset => asset.type === 'ada' || asset.policy_id === 'lovelace');
        if (adaAsset?.quantity) {
          return `${formatAmount(adaAsset.quantity)} ADA Acquired`;
        }
        if (activity.amount) {
          return `${formatAmount(activity.amount)} ADA Acquired`;
        }
        return 'Acquire';
      }

      case 'contribute': {
        const nftCount = activity.assets?.length || 0;
        if (nftCount > 0) {
          return `${nftCount} ${nftCount === 1 ? 'Asset' : 'Assets'} Contributed`;
        }
        return 'Contribution';
      }

      default: {
        return 'Transaction';
      }
    }
  } else if (activity.activityType === 'phase_transition') {
    const phaseLabels = {
      contribution: 'Contribution Phase Started',
      acquire: 'Acquire Phase Started',
      locked: 'Vault Locked',
    };
    return phaseLabels[activity.phase] || 'Phase Transition';
  } else {
    return `Proposal "${activity.title || 'Untitled'}"`;
  }
};

const getProposalStatus = activityType => {
  switch (activityType) {
    case 'proposal_created': {
      return { label: 'Created', color: 'bg-orange-500/20 text-orange-500' };
    }
    case 'proposal_started': {
      return { label: 'Started', color: 'bg-emerald-500/20 text-emerald-500' };
    }
    case 'proposal_ended': {
      return { label: 'Finished', color: 'bg-blue-500/20 text-blue-500' };
    }
    default: {
      return null;
    }
  }
};

const ActivityCard = ({ activity }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);

  const activityType = activity.activityType === 'transaction' ? activity.type : activity.activityType;
  const config = ACTIVITY_TYPES[activityType] || ACTIVITY_TYPES.contribute;
  const Icon = config.icon;
  const title = getActivityTitle(activity);

  const isTransaction = activity.activityType === 'transaction';
  const isProposal = activity.activityType && activity.activityType.startsWith('proposal_');
  const hasDetails =
    activity.user || (isTransaction && activity.type === 'contribute' && activity.assets?.length > 0) || isProposal;

  const handleOwnerClick = ownerId => {
    if (ownerId) {
      router.navigate({
        to: '/profile/$id',
        params: { id: ownerId },
      });
    }
  };

  const getDescription = () => {
    if (isTransaction) {
      switch (activity.type) {
        case 'create-vault': {
          return 'Vault was initialized';
        }
        case 'contribute': {
          return 'Assets contributed to vault';
        }
        case 'acquire': {
          return 'ADA spent on acquire';
        }
        default:
          return config.label;
      }
    } else if (activity.activityType === 'phase_transition') {
      const phaseDescriptions = {
        contribution: 'Vault entered contribution phase where users can contribute assets',
        acquire: 'Vault entered acquire phase where assets can be acquired',
        locked: 'Vault has been locked and is now in the final phase',
      };
      return phaseDescriptions[activity.phase] || 'Vault moved to next phase';
    } else if (isProposal) {
      return activity.description || config.label;
    }
    return config.label;
  };

  const openCardanoScan = () => {
    if (activity.tx_hash) {
      const baseUrl = IS_PREPROD ? 'https://preprod.cardanoscan.io' : 'https://cardanoscan.io';
      window.open(`${baseUrl}/transaction/${activity.tx_hash}`, '_blank');
    }
  };

  const handleProposalClick = () => {
    if (activity.proposalId) {
      router.navigate({
        to: '/proposals/$id',
        params: { id: activity.proposalId },
      });
    }
  };

  const nftAssets =
    isTransaction && activity.type === 'contribute' ? activity.assets?.filter(asset => asset.type === 'nft') || [] : [];
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
                <div className="flex sm:flex-row flex-col sm:items-center items-start gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  {isProposal &&
                    (() => {
                      const status = getProposalStatus(activity.activityType);
                      return status ? (
                        <span className={clsx('text-xs font-medium uppercase px-2 py-0.5 rounded', status.color)}>
                          {status.label}
                        </span>
                      ) : null;
                    })()}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(activity.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isTransaction && activity.tx_hash && (
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
                {isProposal && activity.proposalId && (
                  <button
                    onClick={handleProposalClick}
                    className="flex-shrink-0 inline-flex items-center gap-1 p-1.5 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                  >
                    <Vote className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs text-white font-medium group-hover:text-orange-500 transition-colors hidden sm:block">
                      View Proposal
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
                {isProposal ? (
                  <>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-white mb-2">Proposal Description</p>
                      <p className="text-sm text-dark-100">{activity.description || 'No description provided'}</p>
                    </div>

                    {activity.executionError && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 mb-3">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-rose-500 mb-1">Execution Error</p>
                            <p className="text-xs text-rose-400">{activity.executionError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.activityType === 'proposal_ended' && activity.proposalStatus === 'executed' && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-emerald-500 mb-1">Successfully Executed</p>
                            <p className="text-xs text-emerald-400">
                              {getSuccessMessage(activity.proposalType, activity.vault)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-dark-100 mb-3">{getDescription()}</p>

                    {activity.type === 'contribute' && nftAssets.length > 0 && (
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

                    {activity.user && (
                      <button
                        onClick={() => handleOwnerClick(activity.user.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-850 hover:bg-steel-750 border border-steel-750 hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        <User className="w-4 h-4 text-dark-100 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm text-white font-medium group-hover:text-orange-500 transition-colors">
                          {activity.user.name || `User ${activity.user.id?.slice(0, 8)}`}
                        </span>
                      </button>
                    )}
                  </>
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

const ACTIVITY_FILTERS = ['All', 'Contribute', 'Acquire', 'Governance'];

const FILTER_MAP = {
  All: 'all',
  Contribute: 'contribute',
  Acquire: 'acquire',
  Governance: 'governance',
};

export const VaultActivity = ({ vault }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, isLoading, error } = useVaultActivity(vault?.id, {
    page,
    limit,
    sortOrder: 'DESC',
    filter: FILTER_MAP[activeFilter],
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

  const handleFilterChange = filter => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleDownloadCSV = async () => {
    try {
      toast.loading('Preparing CSV...', { id: 'download' });

      const allData = await VaultsApiProvider.getVaultActivity(vault?.id, {
        page: 1,
        limit: 9999,
        sortOrder: 'DESC',
        filter: FILTER_MAP[activeFilter],
        isExport: true,
      });

      const allActivities = allData?.data?.items || allData?.items || [];

      if (!allActivities.length) {
        toast.error('No activities to export', { id: 'download' });
        return;
      }

      const headers = [
        'Date',
        'Type',
        'Activity',
        'Description',
        'User Address',
        'Asset Names',
        'Policy IDs',
        'TX Hash',
      ];

      const rows = allActivities.map(activity => {
        const isTransaction = activity.activityType === 'transaction';
        const isPhaseTransition = activity.activityType === 'phase_transition';
        const isProposal = activity.activityType && activity.activityType.startsWith('proposal_');

        let activityType = '';
        if (isTransaction) {
          activityType = activity.type;
        } else if (isPhaseTransition) {
          activityType = 'phase_transition';
        } else if (isProposal) {
          activityType = activity.activityType.replace('proposal_', 'proposal ');
        }

        let description = '';
        if (isTransaction) {
          switch (activity.type) {
            case 'create-vault':
              description = 'Vault was initialized';
              break;
            case 'contribute':
              description = 'Assets contributed to vault';
              break;
            case 'acquire':
              description = 'ADA spent on acquire';
              break;
          }
        } else if (isPhaseTransition) {
          const phaseDescriptions = {
            contribution: 'Vault entered contribution phase where users can contribute assets',
            acquire: 'Vault entered acquire phase where assets can be acquired',
            locked: 'Vault has been locked and is now in the final phase',
          };
          description = phaseDescriptions[activity.phase] || 'Vault moved to next phase';
        } else {
          description = activity.description || '';
        }

        const userAddress = activity.user?.address || '';

        let assetNames = '';
        let policyIds = '';
        if (isTransaction && activity.type === 'contribute' && activity.assets?.length > 0) {
          const nftAssets = activity.assets.filter(asset => asset.type === 'nft');
          assetNames = nftAssets.map(asset => asset.name || asset.asset_id || 'Unknown').join('; ');
          policyIds = nftAssets.map(asset => asset.policy_id || 'Unknown').join('; ');
        }

        return [
          formatDateTime(activity.created_at),
          activityType,
          getActivityTitle(activity),
          description,
          userAddress,
          assetNames,
          policyIds,
          activity.tx_hash || '',
        ];
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${vault.name}_activity_${FILTER_MAP[activeFilter]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV downloaded successfully', { id: 'download' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV', { id: 'download' });
    }
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-russo text-2xl md:text-3xl lg:text-4xl uppercase text-white">Vault Activity</h2>
              {!isLoading && !error && items.length > 0 && (
                <span className="text-sm text-dark-100 bg-steel-750 px-3 py-1 rounded-full">
                  {pagination.totalItems} {pagination.totalItems === 1 ? 'activity' : 'activities'}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              <LavaTabs
                tabs={ACTIVITY_FILTERS}
                activeTab={activeFilter}
                onTabChange={handleFilterChange}
                className="w-full sm:w-auto"
              />
              <SecondaryButton className="w-full sm:w-auto" onClick={handleDownloadCSV}>
                <Download className="w-4 h-4" />
                Export CSV
              </SecondaryButton>
            </div>
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
                {items.map((activity, index) => (
                  <ActivityCard key={activity.id || index} activity={activity} />
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
