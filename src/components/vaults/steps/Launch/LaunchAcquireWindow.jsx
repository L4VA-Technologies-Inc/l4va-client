import { Edit } from 'lucide-react';

import { formatNum, formatDateTime, formatInterval } from '@/utils/core.utils';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { getLiquidityPoolContributionHint, getReserveHint } from '@/components/vaults/constants/vaults.constants';
import { useCurrency } from '@/hooks/useCurrency';
import { useNetwork } from '@/hooks/useNetwork';

export const LaunchAcquireWindow = ({ data, setCurrentStep }) => {
  const { currencyLabel } = useCurrency();
  const { isRobinHood } = useNetwork();
  // 0 is a real choice (e.g. no LP), so only a missing value reads as "Not set".
  const formatPercentValue = value =>
    value === null || value === undefined || value === '' ? 'Not set' : `${formatNum(value)}%`;

  const formatTime = (type, time) => {
    if (type === 'upon-asset-window-closing') {
      return data.isAcquireOnly ? 'Upon vault launch' : 'Upon asset window closing';
    }
    return time ? formatDateTime(new Date(time)) : 'Not set';
  };

  const getAcquireWindowDuration = () => formatInterval(new Date(data.acquireWindowDuration));

  return (
    <section className="min-w-0 overflow-x-hidden">
      <div className="rounded-t-[10px] py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4 min-w-0">
        <p className="font-bold text-xl md:text-2xl break-words min-w-0 flex-shrink">Acquire</p>
        <button
          className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500 flex-shrink-0"
          type="button"
          onClick={() => setCurrentStep(3)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg min-w-0">
        <div className="space-y-12 min-w-0">
          <div>
            <p className="uppercase font-semibold text-dark-100">Acquire Window Duration</p>
            <p className="break-words">{data.acquireWindowDuration ? getAcquireWindowDuration() : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Acquire Window Open Time</p>
            <p className="break-words">{formatTime(data.acquireOpenWindowType, data.acquireOpenWindowTime)}</p>
          </div>
        </div>
        <div className="space-y-12 min-w-0">
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Tokens for Acquirers (%)</p>
              <HoverHelp hint="The percentage (%) of net vault tokens minted (total vault tokens minus LP Contribution) which will be received by Acquirers when vault locks." />
            </div>
            <p className="break-words">
              {data.tokensForAcquires ? `${formatNum(data.tokensForAcquires)}%` : 'Not set'}
            </p>
          </div>
          {isRobinHood && data.isAcquireOnly && (
            <div>
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Minimum raise</p>
              <p className="break-words">
                {data.minAcquireThreshold
                  ? `${data.minAcquireThresholdUsd ? `$${formatNum(data.minAcquireThresholdUsd)} ≈ ` : ''}${data.minAcquireThreshold} ETH`
                  : 'Not set'}
              </p>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Lock Reserve (%)</p>
              <HoverHelp hint={getReserveHint(currencyLabel)} />
            </div>
            <p className="break-words">{formatPercentValue(data.acquireReserve)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">
                Liquidity Pool (LP) Contribution (%)
              </p>
              <HoverHelp hint={getLiquidityPoolContributionHint(currencyLabel)} />
            </div>
            <p className="break-words">{formatPercentValue(data.liquidityPoolContribution)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
