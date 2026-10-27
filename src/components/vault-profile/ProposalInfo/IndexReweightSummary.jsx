import { ArrowRight } from 'lucide-react';

import { BasketAllocationBar } from '@/components/vaults/index/IndexBasketEditor';
import { formatBps } from '@/components/vaults/index/indexVault.utils';

/** Old → new basket weights of an index re-weight proposal. */
export const IndexReweightSummary = ({ reweight, label = 'New weights' }) => {
  const previous = new Map((reweight.previousTargets || []).map(t => [t.assetAddress, t]));
  const next = new Map(reweight.targets.map(t => [t.assetAddress, t]));
  const addresses = [...new Set([...next.keys(), ...previous.keys()])];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400">{label}</h3>
      <BasketAllocationBar targets={reweight.targets} reserveBps={reweight.reserveBps} />
      <ul className="space-y-1 text-sm">
        {addresses.map(address => {
          const from = Number(previous.get(address)?.weightBps ?? 0);
          const to = Number(next.get(address)?.weightBps ?? 0);
          const symbol = next.get(address)?.symbol || previous.get(address)?.symbol || address;
          return (
            <li key={address} className="flex items-center justify-between gap-3">
              <span className="truncate">
                {symbol}
                {to === 0 && <span className="ml-2 text-xs text-yellow-400">removed</span>}
                {from === 0 && <span className="ml-2 text-xs text-green-500">new</span>}
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-dark-100">{formatBps(from)}</span>
                <ArrowRight className="h-3 w-3 text-dark-100" />
                <span className="font-medium">{formatBps(to)}</span>
              </span>
            </li>
          );
        })}
        {reweight.previousReserveBps !== null && reweight.previousReserveBps !== reweight.reserveBps && (
          <li className="flex items-center justify-between gap-3">
            <span>Cash reserve</span>
            <span className="flex items-center gap-2 tabular-nums">
              <span className="text-dark-100">{formatBps(reweight.previousReserveBps)}</span>
              <ArrowRight className="h-3 w-3 text-dark-100" />
              <span className="font-medium">{formatBps(reweight.reserveBps)}</span>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};
