import { Wallet, History, Receipt } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';

import { useClaimableAmount, useClaimHistory, useClaimTransactions } from '@/hooks/useRewardsClaims';
import { formatRewardAmount, formatTimeAgo } from '@/utils/rewards/normalizers';
import { ClaimButton } from '@/components/rewards/ClaimButton';
import { ClaimTransactionStatus } from '@/components/rewards/ClaimTransactionStatus';
import { Card } from '@/components/ui/card';

export const ClaimsPage = () => {
  const { address: walletAddress, isConnected } = useWallet();

  const { data: claimableData, isLoading: isLoadingClaimable } = useClaimableAmount(walletAddress);
  const { data: claimHistoryData, isLoading: isLoadingHistory } = useClaimHistory(walletAddress);
  const { data: claimTxData, isLoading: isLoadingTransactions } = useClaimTransactions(walletAddress);

  // Data is already normalized by backend
  const claimableAmount = claimableData?.claimableAmount || 0;
  const claimHistory = claimHistoryData || [];
  const claimTransactions = claimTxData || [];

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Claim Rewards</h1>
          <Card className="p-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to claim your rewards</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Claim Rewards</h1>
          <p className="text-gray-400">Claim your earned L4VA rewards</p>
        </div>

        {/* Claimable Amount Card */}
        <Card className="p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          {isLoadingClaimable ? (
            <div className="space-y-4">
              <div className="h-6 bg-gray-700 rounded animate-pulse w-1/3" />
              <div className="h-16 bg-gray-700 rounded animate-pulse w-full" />
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-400 mb-3">Available to Claim</div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl font-bold text-orange-400">{formatRewardAmount(claimableAmount)}</span>
                <span className="text-xl text-gray-500">$L4VA</span>
              </div>

              {claimableData?.breakdown && (
                <div className="flex gap-6 mb-6 text-sm">
                  {claimableData.breakdown.immediate > 0 && (
                    <div>
                      <span className="text-gray-400">Immediate: </span>
                      <span className="text-white font-medium">
                        {formatRewardAmount(claimableData.breakdown.immediate)} $L4VA
                      </span>
                    </div>
                  )}
                  {claimableData.breakdown.unlocked > 0 && (
                    <div>
                      <span className="text-gray-400">Unlocked: </span>
                      <span className="text-white font-medium">
                        {formatRewardAmount(claimableData.breakdown.unlocked)} $L4VA
                      </span>
                    </div>
                  )}
                </div>
              )}

              <ClaimButton
                walletAddress={walletAddress}
                claimableAmount={claimableAmount}
                className="w-full md:w-auto px-8 py-3 text-lg"
              />
            </>
          )}
        </Card>

        {/* Claim Transactions */}
        {claimTransactions.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            </div>

            <div className="space-y-3">
              {claimTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">{formatRewardAmount(tx.amount)} $L4VA</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(tx.createdAt)}</div>
                    {tx.errorMessage && <div className="text-xs text-red-400 mt-1">{tx.errorMessage}</div>}
                  </div>
                  <ClaimTransactionStatus status={tx.status} transactionHash={tx.transactionHash} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Claim History */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Claim History</h2>
          </div>

          {isLoadingHistory ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : claimHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No claim history yet</div>
              <div className="text-gray-600 text-sm mt-1">Your claims will appear here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {claimHistory.map(claim => (
                <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">{formatRewardAmount(claim.amount)} $L4VA</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(claim.claimedAt)}</div>
                    {claim.epochId && <div className="text-xs text-gray-600 mt-1">Epoch: {claim.epochId}</div>}
                  </div>
                  <ClaimTransactionStatus status={claim.status} transactionHash={claim.transactionHash} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {isLoadingTransactions && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Loading transactions...</div>
          </div>
        )}
      </div>
    </div>
  );
};
