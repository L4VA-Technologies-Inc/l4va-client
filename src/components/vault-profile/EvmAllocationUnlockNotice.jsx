import { Clock, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

const formatLeft = seconds => {
  if (seconds <= 0) return 'any moment now';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `in ${h}h ${m}m` : `in ${Math.max(m, 1)}m`;
};

/**
 * V13 Robinhood vaults: after a cycle closes, contributors' VT and ETH unlock only after a safety
 * delay, during which the allocation can be reviewed and stopped. Acquirers are paid straight
 * away and are not affected. Renders nothing for other vaults.
 */
export const EvmAllocationUnlockNotice = ({ status }) => {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const pending = Boolean(status?.rootPending);

  useEffect(() => {
    if (!pending) return undefined;
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30000);
    return () => clearInterval(id);
  }, [pending]);

  if (status?.rootCancelled) {
    return (
      <div className="flex gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/60">
        <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-steel-300 space-y-1">
          <p className="font-medium text-steel-200">Contributor allocation under review</p>
          <p>
            The allocation for this cycle was stopped before it unlocked. A corrected allocation will be published;
            nothing is lost in the meantime.
          </p>
        </div>
      </div>
    );
  }

  if (!pending) return null;

  const unlocksAt = new Date(status.rootActivatesAt * 1000);
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-steel-900/50 border border-steel-850">
      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-steel-300 space-y-1">
        <p className="font-medium text-steel-200">
          Contributor allocations unlock {formatLeft(status.rootActivatesAt - now)}
        </p>
        <p>
          Asset contributors receive their VT and ETH after a safety review window ({unlocksAt.toLocaleString()}).
          Acquirers&apos; VT is sent without waiting.
        </p>
      </div>
    </div>
  );
};
