import { Clock, Lock } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';

/**
 * Robinhood (V13) review: the vault's token split is fixed by the contract at creation, and
 * shows what happens when, so creators and acquirers know what to expect.
 *
 * Same math as the contract (and Cardano): the LP takes LP% / 2 of the supply as VT (paired with
 * the same share of the raise in ETH), acquirers get their share of what is left, and asset
 * contributors the rest.
 */
export const LaunchRobinhoodTerms = ({ data, isIndexVault }) => {
  const supply = Number(data.ftTokenSupply) || 0;
  const lpPct = Number(data.liquidityPoolContribution) || 0;
  const acquirerPct = Number(data.tokensForAcquires) || 0;
  const lpVt = (supply * lpPct) / 200;
  const acquirerVt = ((supply - lpVt) * acquirerPct) / 100;
  const contributorVt = Math.max(supply - lpVt - acquirerVt, 0);

  const rows = [
    { label: 'Acquirers', value: acquirerVt },
    ...(contributorVt > 0 ? [{ label: 'Asset contributors', value: contributorVt }] : []),
    ...(lpVt > 0 ? [{ label: 'Liquidity pool', value: lpVt }] : []),
  ];

  return (
    <section className="min-w-0 overflow-x-hidden">
      <div className="rounded-t-[10px] py-4 px-4 md:px-8 bg-white/5">
        <p className="font-bold text-xl md:text-2xl">Fixed at creation</p>
        <p className="text-sm text-dark-100">
          The smart contract locks these numbers when the vault is created. Nobody can change them later, including
          L4VA.
        </p>
      </div>
      <div className="p-4 md:p-8 space-y-6 rounded-b-[10px] bg-input-bg min-w-0">
        {supply > 0 && (
          <div>
            <p className="uppercase font-semibold text-dark-100 mb-2">
              Token split ({formatNum(supply, 0)} {data.vaultTokenTicker || 'VT'} total)
            </p>
            <ul className="space-y-1">
              {rows.map(r => (
                <li key={r.label} className="flex justify-between gap-3">
                  <span>{r.label}</span>
                  <span className="font-bold tabular-nums">
                    {formatNum(r.value, 0)} ({formatNum((r.value / supply) * 100, 2)}%)
                  </span>
                </li>
              ))}
            </ul>
            {lpVt > 0 && (
              <p className="text-sm text-dark-100 mt-2">
                The pool gets {formatNum(lpPct / 2, 2)}% of the tokens and {formatNum(lpPct / 2, 2)}% of the vault value
                in ETH, so it opens at the vault&apos;s value (amount raised ÷ acquirer share).
              </p>
            )}
          </div>
        )}
        <div className="space-y-3 text-sm">
          <p className="uppercase font-semibold text-dark-100 text-base">What happens when</p>
          <p className="flex gap-2">
            <Lock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <span>
              <span className="text-white">When the acquire window locks:</span> acquirers receive their tokens right
              away
              {isIndexVault ? ', and the basket is bought with the ETH raised.' : '.'}
              {lpVt > 0 && ' The liquidity pool is created at the same time.'}
            </span>
          </p>
          {contributorVt > 0 && (
            <p className="flex gap-2">
              <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>
                <span className="text-white">Asset contributors</span> receive their tokens and ETH after a 24-hour
                safety review.
              </span>
            </p>
          )}
          <p className="flex gap-2">
            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <span>
              <span className="text-white">Payouts to holders</span> (distributions) open 24 hours after they are
              announced. During that window the L4VA guardian can stop a wrong payout; the funds then return to the
              vault.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
