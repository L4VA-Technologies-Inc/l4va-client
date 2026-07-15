import { Package, ExternalLink, Coins, CheckCircle2 } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';

export const RelicsStakingDetails = ({ proposal }) => {
  const isStaking = proposal.proposalType === 'relics_staking';
  const relicsData = proposal.metadata?.relicsStaking;

  if (!relicsData) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-xl p-6 text-center">
        <p className="text-steel-400">No {isStaking ? 'staking' : 'unstaking'} details available</p>
      </div>
    );
  }

  const { platform, executedStakes, executedUnstakes, totalVlrmRewards } = relicsData;

  // Show execution results if proposal is passed/executed
  const hasExecutionData = isStaking ? executedStakes?.length > 0 : executedUnstakes?.length > 0;

  return (
    <div className="space-y-4">
      {/* Platform Info */}
      <div className="bg-steel-850 border border-steel-750 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-steel-400">Platform</p>
            <p className="text-white font-semibold mt-1">
              {platform === 'anvil-relics' ? 'Anvil Relics Staking' : platform}
            </p>
          </div>
          {platform === 'anvil-relics' && (
            <a
              href="https://relics-staking.ada-anvil.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-steel-800 hover:bg-steel-750 text-steel-300 hover:text-white rounded-lg transition-colors text-sm flex items-center gap-1.5"
            >
              View Platform
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Execution Results - Staking */}
      {isStaking && hasExecutionData && (
        <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-steel-750">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h4 className="text-lg font-semibold text-white">Execution Results</h4>
            </div>
            <p className="text-sm text-steel-400 mt-1">
              {executedStakes.length} batch{executedStakes.length > 1 ? 'es' : ''} executed successfully
            </p>
          </div>
          <div className="divide-y divide-steel-750">
            {executedStakes.map((batch, index) => (
              <div key={index} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Batch {index + 1}</p>
                      <p className="text-steel-400 text-xs">{batch.assetIds?.length || 0} NFTs staked</p>
                    </div>
                  </div>
                  {batch.txHash && (
                    <a
                      href={`https://cardanoscan.io/transaction/${batch.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-steel-800 hover:bg-steel-750 text-steel-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1.5"
                    >
                      View Tx
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {batch.stakeIds && batch.stakeIds.length > 0 && (
                  <div className="bg-steel-900 rounded-lg p-3 mt-3">
                    <p className="text-steel-400 text-xs mb-2">Stake IDs:</p>
                    <div className="flex flex-wrap gap-2">
                      {batch.stakeIds.map((stakeId, i) => (
                        <span key={i} className="px-2 py-1 bg-steel-800 text-steel-300 rounded text-xs font-mono">
                          {stakeId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Results - Unstaking */}
      {!isStaking && hasExecutionData && (
        <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-steel-750">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h4 className="text-lg font-semibold text-white">Execution Results</h4>
            </div>
            <p className="text-sm text-steel-400 mt-1">
              {executedUnstakes.length} stake{executedUnstakes.length > 1 ? 's' : ''} unstaked successfully
            </p>
          </div>

          {/* VLRM Rewards Summary */}
          {totalVlrmRewards > 0 && (
            <div className="p-5 bg-orange-500/5 border-b border-steel-750">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-steel-400">Total VLRM Rewards Earned</p>
                    <p className="text-xl font-bold text-orange-gradient">{formatNum(totalVlrmRewards, 4)} VLRM</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unstake Details */}
          <div className="divide-y divide-steel-750">
            {executedUnstakes.map((unstake, index) => (
              <div key={index} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Stake ID: {unstake.stakeId}</p>
                      {unstake.vlrmRewards > 0 && (
                        <p className="text-orange-400 text-xs">+{formatNum(unstake.vlrmRewards, 4)} VLRM</p>
                      )}
                    </div>
                  </div>
                  {unstake.txHash && (
                    <a
                      href={`https://cardanoscan.io/transaction/${unstake.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-steel-800 hover:bg-steel-750 text-steel-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1.5"
                    >
                      View Tx
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Execution */}
      {!hasExecutionData && proposal.status === 'passed' && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-white font-medium">Proposal Passed</p>
          <p className="text-steel-400 text-sm mt-1">
            {isStaking ? 'Staking' : 'Unstaking'} will be executed automatically
          </p>
        </div>
      )}
    </div>
  );
};
