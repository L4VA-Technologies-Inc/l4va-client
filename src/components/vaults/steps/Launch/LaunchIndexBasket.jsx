import { Edit } from 'lucide-react';

import { BasketAllocationBar } from '@/components/vaults/index/IndexBasketEditor';
import { basketSegmentColor, formatBps } from '@/components/vaults/index/indexVault.utils';

export const LaunchIndexBasket = ({ data, setCurrentStep }) => {
  const targets = data.indexBasket?.targets || [];
  const reserveBps = Number(data.indexBasket?.reserveBps ?? 0);

  return (
    <section className="min-w-0 overflow-x-hidden">
      <div className="rounded-t-[10px] py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4 min-w-0">
        <div className="min-w-0">
          <p className="font-bold text-xl md:text-2xl break-words">Index Basket</p>
          <p className="text-sm text-dark-100">
            Bought automatically with the ETH raised once the acquire window locks.
          </p>
        </div>
        <button
          className="flex items-center gap-2 text-dark-100 self-start hover:text-orange-500 flex-shrink-0"
          type="button"
          onClick={() => setCurrentStep(3)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 space-y-6 rounded-b-[10px] bg-input-bg min-w-0">
        {targets.length === 0 ? (
          <p className="text-red-600">No assets in the basket yet.</p>
        ) : (
          <>
            <BasketAllocationBar targets={targets} reserveBps={reserveBps} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-3">
              {targets.map((t, i) => (
                <li key={t.assetAddress} className="flex items-center justify-between gap-3 min-w-0">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ background: basketSegmentColor(i) }}
                    />
                    <span className="truncate">{t.symbol || t.assetAddress}</span>
                  </span>
                  <span className="font-bold tabular-nums">{formatBps(t.weightBps)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div>
          <p className="uppercase font-semibold text-dark-100">Cash Reserve</p>
          <p>{formatBps(reserveBps)} of vault value kept in ETH</p>
        </div>
      </div>
    </section>
  );
};
