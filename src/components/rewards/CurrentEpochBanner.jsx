import { Calendar, TrendingUp } from 'lucide-react';

import { formatDateRange } from '@/utils/rewards/normalizers';

export const CurrentEpochInfoCard = ({ epoch, isLoading = false, showCalendarIcon = true }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-steel-750 bg-steel-900/60 p-5 flex items-center gap-4">
        {showCalendarIcon && <div className="w-14 h-14 rounded-xl bg-gray-700 animate-pulse flex-shrink-0" />}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3" />
          <div className="h-6 bg-gray-700 rounded animate-pulse w-4/5" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (!epoch) {
    return (
      <div className="rounded-xl border border-steel-750 bg-steel-900/60 p-5 flex items-center">
        <p className="text-sm text-steel-400">No active epoch at the moment</p>
      </div>
    );
  }

  const statusDotColors = {
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
    <div className="rounded-xl border border-steel-750 bg-steel-900/60 p-5 flex items-center gap-4">
      {showCalendarIcon && (
        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
          <Calendar className="w-8 h-8 text-purple-500" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Current Epoch</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${statusDotColors[epoch.status] || 'bg-gray-500'} ${epoch.status === 'active' ? 'animate-pulse' : ''}`}
            />
            <span className="text-xs text-steel-400">{statusLabels[epoch.status] || epoch.status}</span>
          </div>
        </div>
        <p className="text-xl font-bold text-white mb-1">{formatDateRange(epoch.startDate, epoch.endDate)}</p>
        {epoch.epochNumber && <p className="text-sm text-steel-500">Epoch #{epoch.epochNumber}</p>}
      </div>
    </div>
  );
};

export const CurrentEpochBanner = ({ epoch, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-700 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-700 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!epoch) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-2xl p-5 md:p-6">
        <div className="text-center text-steel-400">
          <p>No active epoch at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 md:p-6">
      <CurrentEpochInfoCard epoch={epoch} />

      {/* Total Emission Card */}
      {epoch.emissionTotal && (
        <div className="rounded-xl border border-steel-750 bg-steel-900/40 p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="min-w-0">
            <p className="text-steel-400 text-xs font-medium uppercase tracking-wide">Total Emission</p>
            <p className="text-xl font-bold text-white">{Number(epoch.emissionTotal).toLocaleString()} $L4VA</p>
          </div>
        </div>
      )}
    </div>
  );
};
