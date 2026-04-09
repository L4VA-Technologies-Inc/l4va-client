import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { formatTimeAgo } from '@/utils/rewards/normalizers';
import { formatCompactNumber } from '@/utils/core.utils';

export const ClaimsSummary = ({ claimableAmount = 0, claimHistory = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-1/3" />
          <div className="h-12 bg-gray-700 rounded animate-pulse w-full" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
          </div>
        </div>
      </Card>
    );
  }

  const recentClaims = claimHistory?.slice(0, 3) || [];
  const hasClaimable = claimableAmount > 0;
  const hasClaims = recentClaims.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Claims</h3>
        <Link to="/rewards/claims" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Available to Claim</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${hasClaimable ? 'text-orange-400' : 'text-gray-500'}`}>
            {formatCompactNumber(claimableAmount)}
          </span>
          <span className="text-sm text-gray-500">$L4VA</span>
        </div>
      </div>

      {!hasClaims ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-sm">No claim history yet</div>
          <div className="text-gray-600 text-xs mt-1">Your claims will appear here once you start claiming rewards</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-400 mb-2">Recent Claims</div>
          {recentClaims.map(claim => (
            <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-white">{formatCompactNumber(claim.amount)} $L4VA</div>
                <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(claim.claimedAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                {claim.status === 'confirmed' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                {claim.status === 'pending' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                {claim.status === 'failed' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
