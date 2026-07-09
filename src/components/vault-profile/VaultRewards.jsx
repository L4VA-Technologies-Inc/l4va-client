import { useState } from 'react';
import { Coins, TrendingUp, Package, Plus, Sprout } from 'lucide-react';

import { useRelicsStakingData } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { formatNum } from '@/utils/core.utils';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { useModalControls } from '@/lib/modals/modal.context';

export const VaultRewards = ({ vault }) => {
  const { data, isLoading } = useRelicsStakingData(vault.id);
  const [activeSection, setActiveSection] = useState('nft-staking'); // 'nft-staking', 'lp-farms'
  const { openModal } = useModalControls();

  const handleCreateProposal = action => {
    // Navigate to create proposal modal with pre-filled action type
    openModal('CreateProposalModal', {
      vault,
      defaultAction: action, // 'stake', 'unstake', or 'harvest'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  const { eligibleAssets, stakedAssets, stats } = data || {};
  const hasStakedAssets = stakedAssets?.assets?.length > 0;
  const hasEligibleAssets = eligibleAssets?.assets?.length > 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Vault Rewards</h2>
          <p className="text-steel-400 text-sm mt-1">Track all rewards earned by this vault</p>
        </div>
      </div>

      {/* Section Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSection('nft-staking')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
            activeSection === 'nft-staking'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-steel-800 text-steel-400 hover:text-white border border-steel-750'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            NFT Staking
          </div>
        </button>
        <button
          onClick={() => setActiveSection('lp-farms')}
          disabled
          className="px-4 py-2 rounded-xl font-medium bg-steel-850 text-steel-500 border border-steel-750 cursor-not-allowed whitespace-nowrap"
        >
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4" />
            LP Farms <span className="text-xs">(Coming Soon)</span>
          </div>
        </button>
      </div>

      {/* Active Section Content */}
      {activeSection === 'nft-staking' && (
        <NftStakingSection
          vault={vault}
          stats={stats}
          eligibleAssets={eligibleAssets}
          stakedAssets={stakedAssets}
          hasStakedAssets={hasStakedAssets}
          hasEligibleAssets={hasEligibleAssets}
          onCreateProposal={handleCreateProposal}
        />
      )}

      {/* Future sections will go here */}
      {activeSection === 'lp-farms' && <LpFarmsSection />}
    </div>
  );
};

// ============================================================================
// NFT STAKING SECTION
// ============================================================================

const NftStakingSection = ({
  stats,
  eligibleAssets,
  stakedAssets,
  hasStakedAssets,
  hasEligibleAssets,
  onCreateProposal,
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Staked */}
        <div className="bg-steel-850 border border-steel-750 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-steel-400 text-sm">Total Staked</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalStaked || 0} NFTs</p>
          <p className="text-steel-500 text-xs mt-1">Earning Rewards</p>
        </div>

        {/* VLRM Earned */}
        <div className="bg-steel-850 border border-steel-750 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-steel-400 text-sm">VLRM Earned</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-gradient">{formatNum(stats?.totalVlrmEarned || 0, 4)} VLRM</p>
          <p className="text-steel-500 text-xs mt-1">Lifetime Rewards</p>
        </div>

        {/* Available to Stake */}
        <div className="bg-steel-850 border border-steel-750 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-steel-400 text-sm">Ready to Stake</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{eligibleAssets?.count || 0} NFTs</p>
          <p className="text-steel-500 text-xs mt-1">Eligible Relics</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton
          onClick={() => onCreateProposal('stake')}
          disabled={!hasEligibleAssets}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Staking Proposal
        </PrimaryButton>
        <SecondaryButton
          onClick={() => onCreateProposal('unstake')}
          disabled={!hasStakedAssets}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Unstaking Proposal
        </SecondaryButton>
      </div>

      {/* Staked Assets List */}
      {hasStakedAssets ? (
        <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-steel-750">
            <h3 className="text-lg font-semibold text-white">Staked Assets ({stakedAssets.count})</h3>
            <p className="text-sm text-steel-400 mt-1">Relics NFTs currently earning VLRM rewards</p>
          </div>
          <div className="divide-y divide-steel-750">
            {stakedAssets.assets.map(asset => (
              <StakedAssetRow key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ) : (
        <NoDataPlaceholder
          message="No staked assets"
          description="Create a staking proposal to stake Relics NFTs and earn VLRM rewards"
          iconBgColor="bg-purple-500/15"
          iconInnerBgColor="bg-purple-500/30"
        />
      )}

      {/* Eligible Assets (Collapsible) */}
      {hasEligibleAssets && (
        <details className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
          <summary className="p-5 cursor-pointer hover:bg-steel-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Eligible Assets ({eligibleAssets.count})</h3>
                <p className="text-sm text-steel-400 mt-1">NFTs available for staking proposals</p>
              </div>
            </div>
          </summary>
          <div className="border-t border-steel-750 divide-y divide-steel-750">
            {eligibleAssets.assets.map(asset => (
              <EligibleAssetRow key={asset.id} asset={asset} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

// Staked Asset Row Component
const StakedAssetRow = ({ asset }) => {
  return (
    <div className="p-4 hover:bg-steel-800 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {asset.metadata?.image && (
            <img src={asset.metadata.image} alt={asset.name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-white font-medium">{asset.name}</p>
            <p className="text-steel-400 text-sm">
              {asset.policy_id?.slice(0, 8)}...{asset.policy_id?.slice(-6)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-steel-400 text-sm">Stake ID</p>
          <p className="text-white font-mono text-sm">{asset.stake_id || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

// Eligible Asset Row Component
const EligibleAssetRow = ({ asset }) => {
  return (
    <div className="p-4 hover:bg-steel-800 transition-colors">
      <div className="flex items-center gap-3">
        {asset.metadata?.image && (
          <img src={asset.metadata.image} alt={asset.name} className="w-12 h-12 rounded-lg object-cover" />
        )}
        <div>
          <p className="text-white font-medium">{asset.name}</p>
          <p className="text-steel-400 text-sm">
            {asset.policy_id?.slice(0, 8)}...{asset.policy_id?.slice(-6)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FUTURE SECTIONS (Placeholders)
// ============================================================================

const LpFarmsSection = () => {
  return (
    <div className="bg-steel-850 border border-steel-750 rounded-xl p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <Sprout className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">LP Farming Rewards</h3>
      <p className="text-steel-400 max-w-md mx-auto">
        Track rewards earned from vault token liquidity pools (VT/ADA, VT/USDCx farms). Coming in future release.
      </p>
    </div>
  );
};
