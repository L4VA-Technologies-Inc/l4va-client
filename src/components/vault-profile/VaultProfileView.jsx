import { Copy, EyeIcon, User, Share, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { SwapComponent } from '../swap/Swap';

import { useCurrency } from '@/hooks/useCurrency';
import {
  BUTTON_DISABLE_THRESHOLD_MS,
  VAULT_STATUSES,
  VAULT_TAGS_OPTIONS,
} from '@/components/vaults/constants/vaults.constants';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { Chip } from '@/components/shared/Chip';
import { VaultCountdown } from '@/components/vault-profile/VaultCountdown';
const VaultContribution = lazy(() =>
  import('@/components/vault-profile/VaultContribution').then(module => ({
    default: module.VaultContribution,
  }))
);
const VaultStats = lazy(() =>
  import('@/components/vault-profile/VaultStats').then(module => ({
    default: module.VaultStats,
  }))
);
const VaultTabs = lazy(() =>
  import('@/components/vault-profile/VaultTabs').then(module => ({
    default: module.VaultTabs,
  }))
);
import { Spinner } from '@/components/Spinner';
import { VaultSkeleton } from '@/components/vault-profile/VaultSkeleton';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { useVaultStatusTracker } from '@/hooks/useVaultStatusTracker';
import {
  formatCompactNumber,
  formatNum,
  getCountdownName,
  getCountdownTime,
  substringAddress,
} from '@/utils/core.utils';
import { areAllAssetsAtMaxCapacity } from '@/utils/vaultContributionLimits';
import { useVaultAssets } from '@/services/api/queries';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useViewVault } from '@/services/api/queries.js';
import { IS_PREPROD } from '@/utils/networkValidation.ts';

const ContributionSkeleton = () => (
  <div className="p-4 space-y-8">
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <VaultSkeleton className="h-4 w-24 bg-steel-800" />
        <VaultSkeleton className="h-3 w-32 bg-steel-800" />
      </div>

      <div className="relative h-2 w-full rounded-full bg-steel-900 overflow-hidden">
        <VaultSkeleton className="h-full w-full bg-steel-800" />
      </div>

      <div className="flex justify-end">
        <VaultSkeleton className="h-3 w-16 bg-steel-800" />
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <VaultSkeleton className="h-4 w-20 bg-steel-800" />
        <VaultSkeleton className="h-3 w-8 bg-steel-800" />
      </div>
      <div className="relative h-2 w-full rounded-full bg-steel-900 overflow-hidden">
        <VaultSkeleton className="h-full w-full bg-steel-800" />
      </div>
    </div>

    <div>
      <VaultSkeleton className="h-3 w-24 bg-steel-800" />
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 py-2">
    {[...Array(5)].map((_, idx) => (
      <div key={idx} className="flex flex-col items-center space-y-2">
        <VaultSkeleton className="h-3 w-20 bg-steel-800" />
        <VaultSkeleton className="h-6 w-24 bg-steel-700 rounded-md" />
      </div>
    ))}
  </div>
);

const TabsSkeleton = () => (
  <div className="pt-4 space-y-6">
    <div className="flex gap-6 border-b border-steel-900 pb-0">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="pb-3">
          <VaultSkeleton className="h-5 w-20 bg-steel-800" />
        </div>
      ))}
    </div>

    <div className="w-full">
      <VaultSkeleton className="h-12 w-full rounded-xl bg-steel-900" />
    </div>

    <div className="rounded-xl border border-steel-850 bg-steel-950 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-steel-900/30 border-b border-steel-850">
        <VaultSkeleton className="h-4 w-16 bg-steel-800" />
        <VaultSkeleton className="h-4 w-24 bg-steel-800" />
        <VaultSkeleton className="h-4 w-16 bg-steel-800" />
        <VaultSkeleton className="h-4 w-16 bg-steel-800" />
        <VaultSkeleton className="h-4 w-16 bg-steel-800" />
      </div>

      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 border-b border-steel-850/50 last:border-0">
          <div className="flex items-center gap-3 w-1/4">
            <VaultSkeleton className="h-10 w-10 rounded-lg bg-steel-800" />
            <VaultSkeleton className="h-4 w-20 bg-steel-700" />
          </div>
          <VaultSkeleton className="h-4 w-12 bg-steel-800" />
          <VaultSkeleton className="h-4 w-16 bg-steel-800" />
          <div className="flex items-center gap-4">
            <VaultSkeleton className="h-4 w-8 bg-steel-800" />
            <VaultSkeleton className="h-4 w-4 bg-steel-800" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const VaultProfileView = ({ vault, activeTab: initialTab }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'Assets');
  const { openModal } = useModalControls();

  const router = useRouter();

  const navigate = useNavigate();

  const { isAda } = useCurrency();
  const [deferredReady, setDeferredReady] = useState(false);

  useVaultStatusTracker(vault?.id);
  const viewVaultMutation = useViewVault();
  const viewedVaultsRef = useRef(new Set());

  useEffect(() => {
    if (vault?.id && !viewedVaultsRef.current.has(vault.id)) {
      viewVaultMutation.mutate(vault.id);
      viewedVaultsRef.current.add(vault.id);
    }
  }, [vault.id, viewVaultMutation]);

  useEffect(() => {
    if (!vault?.vaultImage || typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = vault.vaultImage;

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [vault?.vaultImage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDeferredReady(true);
      return;
    }

    const idleCallback =
      window.requestIdleCallback || ((cb, timeout) => window.setTimeout(cb, timeout?.timeout || 300));
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout;

    const handle = idleCallback(
      () => {
        setDeferredReady(true);
      },
      { timeout: 500 }
    );

    return () => cancelIdle(handle);
  }, []);

  const { data: vaultAssetsData } = useVaultAssets(vault?.id);
  const contributedAssets = vaultAssetsData?.data?.items || [];

  const handleTabChange = tab => setActiveTab(tab);

  const renderActionButton = () => {
    const allAssetsAtMaxCapacity = areAllAssetsAtMaxCapacity(vault.assetsWhitelist, contributedAssets);

    const buttonConfig = {
      Assets: {
        text: allAssetsAtMaxCapacity ? 'Contribution Limit Reached' : 'Contribute',
        handleClick: () => openModal('ContributeModal', { vault }),
        available:
          vault.vaultStatus === VAULT_STATUSES.CONTRIBUTION &&
          new Date(vault.contributionPhaseStart).getTime() + vault.contributionDuration >
            Date.now() + BUTTON_DISABLE_THRESHOLD_MS &&
          !allAssetsAtMaxCapacity,
        disabled: vault.vaultStatus !== VAULT_STATUSES.CONTRIBUTION || allAssetsAtMaxCapacity,
      },
      Acquire: {
        text: 'Acquire',
        handleClick: () => openModal('AcquireModal', { vault }),
        available:
          vault.vaultStatus === VAULT_STATUSES.ACQUIRE &&
          new Date(vault.acquirePhaseStart).getTime() + vault.acquireWindowDuration >
            Date.now() + BUTTON_DISABLE_THRESHOLD_MS,
      },
      Governance: {
        text: 'Create Proposal',
        available: vault.vaultStatus === VAULT_STATUSES.LOCKED && vault.canCreateProposal,
        handleClick: () => openModal('CreateProposalModal', { vault }),
      },
      Settings: null,
    };

    const config = buttonConfig[activeTab];

    if (!config) return null;

    return (
      <PrimaryButton
        disabled={!config.available || !isAuthenticated}
        className="uppercase"
        onClick={config.handleClick}
      >
        {config.text}
      </PrimaryButton>
    );
  };

  const handleCopyPolicyId = e => {
    e.preventDefault();
    navigator.clipboard.writeText(vault.policyId);
    toast.success('Address copied to clipboard');
  };

  const handleCopyWalletAddress = e => {
    e.preventDefault();
    navigator.clipboard.writeText(vault.contractAddress);
    toast.success('Address copied to clipboard');
  };

  const handleCopyVaultAddress = async e => {
    e.preventDefault();
    const link = `${import.meta.env.VITE_WEB_LINK}/vaults/${vault.id}?tab=${activeTab}`;

    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

    try {
      if (isMobile && navigator.share) {
        await navigator.share({ url: link });
        toast.success('Link shared successfully');
      } else {
        await navigator.clipboard.writeText(link);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Error coy link:', err);
    }
  };

  const handleOwnerClick = ownerId => {
    if (ownerId) {
      router.navigate({
        to: '/profile/$id',
        params: { id: ownerId },
      });
    }
  };

  const renderVaultInfo = () => (
    <div className="flex justify-between items-start w-full mb-6">
      <div className="flex flex-col w-full">
        <div className="flex w-full justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">{vault.name}</h1>
          <div className="flex gap-2">
            {isAuthenticated && (
              <button
                onClick={() => handleOwnerClick(vault.owner.id)}
                className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1 hover:bg-steel-750 transition-colors"
              >
                <User className="w-4 h-4 text-orange-500" />
              </button>
            )}
            {/* Statistic */}
            {vault.liquidityPoolContribution !== 0 && IS_PREPROD && (
              <button
                onClick={() => openModal('ChartModal', { vault })}
                className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1 hover:bg-steel-750 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-orange-500" />
              </button>
            )}
            <span className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1">
              <EyeIcon className="w-4 h-4 text-orange-500" />
              <span>{formatCompactNumber(vault.countView)}</span>
            </span>
            <button
              onClick={handleCopyVaultAddress}
              className="bg-steel-850 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1 hover:bg-steel-750 transition-colors"
            >
              <Share className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-dark-100">
            <span className="font-medium">ID:</span>
            <span>{vault.id}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-dark-100">
            <span className="font-medium">Wallet:</span>
            <a
              href={`https://pool.pm/${vault.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-orange-500 transition-colors"
            >
              {substringAddress(vault.contractAddress)}
            </a>
            <button
              onClick={handleCopyWalletAddress}
              className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
            >
              <Copy size={16} className="hover:text-orange-500" />
            </button>
          </div>

          {vault.policyId && (
            <div className="flex items-center gap-2 text-sm text-dark-100">
              <span className="font-medium">Policy ID:</span>
              <button
                onClick={handleCopyPolicyId}
                className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
              >
                {substringAddress(vault.policyId)}
                <Copy size={16} className="hover:text-orange-500" />
              </button>
            </div>
          )}
        </div>

        {vault.tags && vault.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vault.tags.map(tag => {
              const tagOption = VAULT_TAGS_OPTIONS.find(option => option.value === tag);
              const tagLabel = tagOption ? tagOption.label : tag;
              return <Chip key={tag} label={tagLabel} size="sm" className="bg-steel-850 text-white border-steel-750" />;
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderPublishedOverlay = () => {
    if (
      vault.vaultStatus === VAULT_STATUSES.PUBLISHED &&
      !(
        vault.contributionOpenWindowType === 'custom' &&
        new Date(vault.contributionOpenWindowTime).getTime() - Date.now() > 0
      )
    ) {
      return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-steel-950 rounded-xl p-8 flex flex-col items-center space-y-4 max-w-md mx-4">
            <Spinner />
            <h3 className="text-xl font-semibold text-white">Registering on Blockchain</h3>
            <p className="text-sm text-gray-300 text-center">
              Your vault is being registered on the blockchain. This process may take a few moments.
            </p>
            <PrimaryButton onClick={() => navigate({ to: '/vaults' })}>Go back</PrimaryButton>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFailureBanner = () => {
    if (vault.vaultStatus !== VAULT_STATUSES.FAILED || !vault.failureReason) {
      return null;
    }

    const failureMessages = {
      asset_threshold_violation: 'Assets did not meet the required thresholds',
      acquire_threshold_not_met: 'Acquisition threshold was not met',
      no_contributions: 'No assets were contributed',
      no_confirmed_transactions: 'No confirmed transactions',
      manual_cancellation: 'Vault was manually cancelled',
    };

    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-6">
        <p className="text-sm text-red-300">
          {failureMessages[vault.failureReason] || 'Vault did not meet requirements'}
        </p>
      </div>
    );
  };

  return (
    <>
      {renderPublishedOverlay()}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 space-y-4 bg-steel-950 rounded-xl p-4">
          <div className="overflow-hidden rounded-lg">
            <div className="w-full" style={{ aspectRatio: '4 / 3' }}>
              {vault.vaultImage ? (
                <img
                  src={vault.vaultImage}
                  alt={vault.name}
                  loading="eager"
                  decoding="async"
                  className="object-cover w-full h-auto aspect-square rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-steel-850 flex items-center justify-center">
                  <L4vaIcon className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          </div>
          <p className="mb-2 font-medium">{getCountdownName(vault)}</p>
          <div className="mb-6">
            <VaultCountdown
              className="h-[65px]"
              countdownValue={getCountdownTime(vault)}
              color={vault.vaultStatus === 'locked' ? 'yellow' : 'red'}
            />
          </div>
          <div className="mb-6">{renderFailureBanner()}</div>
          {vault.vaultStatus !== 'locked' ? (
            deferredReady ? (
              <Suspense fallback={<ContributionSkeleton />}>
                <VaultContribution vault={vault} />
              </Suspense>
            ) : (
              <ContributionSkeleton />
            )
          ) : null}
          <div className="overflow-hidden mx-auto w-full mt-4 lg:block hidden">
            <SwapComponent
              overrideDisplay
              config={{
                defaultToken: import.meta.env.VITE_SWAP_VLRM_TOKEN_ID,
                style: { width: '100%' },
              }}
            />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-steel-950 rounded-xl p-4">
            {renderVaultInfo()}
            <div className="mb-6">
              <p className="text-sm">{vault.description || 'No description'}</p>
            </div>
            <div className="mb-6">
              {deferredReady ? (
                <Suspense fallback={<StatsSkeleton />}>
                  <VaultStats
                    assetValue={vault.vaultStatus}
                    ftGains={(() => {
                      if (isAda) {
                        if (!vault?.gainsAda) return 'N/A';
                        const isNegative = vault.gainsAda < 0;
                        return `${isNegative ? '-' : ''}₳${formatNum(Math.abs(vault.gainsAda))}`;
                      } else {
                        if (!vault?.gainsUsd) return 'N/A';
                        const isNegative = vault.gainsUsd < 0;
                        return `${isNegative ? '-' : ''}$${formatNum(Math.abs(vault.gainsUsd))}`;
                      }
                    })()}
                    fdv={(() => {
                      if (isAda) {
                        return vault?.fdv ? `₳${formatNum(vault.fdv)}` : 'N/A';
                      } else {
                        return vault?.fdvUsd ? `$${formatNum(vault.fdvUsd)}` : 'N/A';
                      }
                    })()}
                    fdvTvl={
                      vault.vaultStatus !== 'contribution' && vault.vaultStatus !== 'acquire'
                        ? vault.fdvTvl != null
                          ? vault.fdvTvl < 0.01 && vault.fdvTvl > 0
                            ? '< 0.01'
                            : vault.fdvTvl.toFixed(2)
                          : 'N/A'
                        : 'N/A'
                    }
                    vtPrice={vault.vtPrice ?? 'N/A'}
                    tvl={(() => {
                      if (isAda) {
                        return vault.assetsPrices?.totalValueAda
                          ? `₳${formatNum(vault.assetsPrices?.totalValueAda)}`
                          : 'N/A';
                      } else {
                        return vault.assetsPrices?.totalValueUsd
                          ? `$${formatNum(vault.assetsPrices?.totalValueUsd)}`
                          : 'N/A';
                      }
                    })()}
                  />
                </Suspense>
              ) : (
                <StatsSkeleton />
              )}
            </div>
            <div className="flex justify-center mb-6">{renderActionButton()}</div>
            {deferredReady ? (
              <Suspense fallback={<TabsSkeleton />}>
                <VaultTabs activeTab={activeTab} vault={vault} onTabChange={handleTabChange} />
              </Suspense>
            ) : (
              <TabsSkeleton />
            )}
          </div>
          <div className="bg-steel-950 rounded-xl p-4 overflow-hidden mx-auto w-full mt-4 lg:hidden block">
            <SwapComponent
              overrideDisplay
              config={{
                defaultToken: import.meta.env.VITE_SWAP_VLRM_TOKEN_ID,
                style: { width: '100%' },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
