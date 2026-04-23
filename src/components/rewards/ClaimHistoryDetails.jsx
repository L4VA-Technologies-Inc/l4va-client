import { CheckCircle2, Clock, ExternalLink } from 'lucide-react';

import { formatCompactNumber } from '@/utils/core.utils';
import { IS_PREPROD } from '@/utils/networkValidation';

/**
 * Displays user's claim transaction history
 * Shows only completed/claimed transactions with amounts and on-chain links
 */
export const ClaimHistoryDetails = ({ transactions = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-steel-850 border border-steel-750 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2 mb-2" />
                <div className="h-3 bg-gray-700 rounded animate-pulse w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-steel-600 mx-auto mb-3" />
        <p className="text-steel-400">No claim transactions yet</p>
        <p className="text-steel-500 text-sm mt-1">Your claimed transactions will appear here</p>
      </div>
    );
  }

  // Filter to show pending and confirmed transactions
  const allTxs = transactions
    .filter(tx => {
      const status = tx.status?.toLowerCase();
      return status === 'confirmed' || status === 'pending';
    })
    .sort(
      (a, b) => new Date(b.confirmedAt || b.createdAt).getTime() - new Date(a.confirmedAt || a.createdAt).getTime()
    );

  if (allTxs.length === 0) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-steel-600 mx-auto mb-3" />
        <p className="text-steel-400">No claim transactions yet</p>
        <p className="text-steel-500 text-sm mt-1">Your transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allTxs.map((tx, index) => {
        const isConfirmed = tx.status?.toLowerCase() === 'confirmed';

        return (
          <div
            key={tx.transactionId || index}
            className="bg-steel-850 border border-steel-750 rounded-xl p-4 hover:bg-steel-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {isConfirmed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">{formatCompactNumber(tx.totalAmount || 0)} $L4VA</p>
                  <span className="text-xs text-steel-500">• {tx.claimsCount || 1} claim(s)</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isConfirmed ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
                  >
                    {isConfirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                <p className="text-steel-400 text-sm">
                  {tx.confirmedAt
                    ? new Date(tx.confirmedAt).toLocaleDateString()
                    : new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Link */}
              {tx.transactionId && (
                <a
                  href={`${IS_PREPROD ? 'https://preprod.cardanoscan.io' : 'https://cardanoscan.io'}/transaction/${tx.transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-white hover:text-orange-500 transition-colors"
                  aria-label="View on Cardanoscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
