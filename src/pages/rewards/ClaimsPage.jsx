import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useWallet } from '@ada-anvil/weld/react';

import { useClaimTransactions } from '@/hooks/useRewardsClaims';
import { ClaimHistoryDetails } from '@/components/rewards';

export const ClaimsPage = () => {
  const navigate = useNavigate();
  const { changeAddressBech32: walletAddress, isConnected } = useWallet();

  const { data: transactionsData, isLoading } = useClaimTransactions(walletAddress);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate({ to: '/rewards' })}
            className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rewards
          </button>
          <div className="bg-steel-850 border border-steel-750 rounded-2xl p-8 text-center">
            <p className="text-steel-400">Connect your wallet to view claim history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <button
          onClick={() => navigate({ to: '/rewards' })}
          className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rewards
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Claim History</h1>
          <p className="text-steel-400">View your confirmed claim transactions</p>
        </div>

        {/* Claim History Component */}
        <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5 md:p-6">
          <ClaimHistoryDetails
            transactions={transactionsData?.transactions || transactionsData || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
