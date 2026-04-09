import { formatRewardAmount } from '@/utils/rewards/normalizers';

export const VaultLeaderboard = ({ scores = [], currentWalletAddress = null }) => {
  if (!scores || scores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No leaderboard data available</p>
      </div>
    );
  }

  // Sort by score descending
  const sortedScores = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-2">
      {sortedScores.map((entry, index) => {
        const isCurrentWallet =
          currentWalletAddress && entry.walletAddress?.toLowerCase() === currentWalletAddress.toLowerCase();
        const rank = entry.rank || index + 1;

        return (
          <div
            key={entry.walletAddress || index}
            className={`p-3 rounded-lg flex items-center gap-4 ${
              isCurrentWallet ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/50'
            }`}
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                rank === 1
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : rank === 2
                    ? 'bg-gray-400/20 text-gray-400'
                    : rank === 3
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-gray-700 text-gray-400'
              }`}
            >
              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
            </div>

            {/* Wallet Address */}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-white truncate">
                {entry.walletAddress
                  ? `${entry.walletAddress.slice(0, 12)}...${entry.walletAddress.slice(-8)}`
                  : 'Unknown'}
              </div>
              {isCurrentWallet && <div className="text-xs text-blue-400 mt-0.5">You</div>}
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-lg font-semibold text-white">{formatRewardAmount(entry.score || 0, 0)}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
