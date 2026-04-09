import { Card } from '@/components/ui/card';
import { formatDateRange } from '@/utils/rewards/normalizers';

export const CurrentEpochBanner = ({ epoch, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="space-y-3">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </Card>
    );
  }

  if (!epoch) {
    return (
      <Card className="p-6 bg-gray-800/50 border-gray-700/50">
        <div className="text-center text-gray-400">
          <p>No active epoch at the moment</p>
        </div>
      </Card>
    );
  }

  const statusColors = {
    active: 'bg-green-500',
    processing: 'bg-yellow-500',
    finalized: 'bg-blue-500',
  };

  const statusLabels = {
    active: 'Active',
    processing: 'Processing',
    finalized: 'Finalized',
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">Current Epoch</h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${statusColors[epoch.status] || 'bg-gray-500'} ${epoch.status === 'active' ? 'animate-pulse' : ''}`}
              />
              <span className="text-sm text-gray-400">{statusLabels[epoch.status] || epoch.status}</span>
            </div>
          </div>
          <div className="text-gray-300">{formatDateRange(epoch.startDate, epoch.endDate)}</div>
          {epoch.weekNumber && <div className="text-sm text-gray-500 mt-1">Week {epoch.weekNumber}</div>}
        </div>
        {epoch.totalEmission && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Emission</div>
            <div className="text-2xl font-bold text-purple-400">
              {Number(epoch.totalEmission).toLocaleString()} $L4VA
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
