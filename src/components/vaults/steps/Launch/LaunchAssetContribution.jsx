import { Edit } from 'lucide-react';

import { formatInterval, formatNum, formatDateTime } from '@/utils/core.utils';
import { VAULT_VALUE_METHOD_OPTIONS, VALUE_METHOD_HINT } from '@/components/vaults/constants/vaults.constants';
import { HoverHelp } from '@/components/shared/HoverHelp';

export const LaunchAssetContribution = ({ data, setCurrentStep }) => {
  const formatTime = (type, time) => {
    if (type === 'upon-vault-launch') {
      return 'Upon vault launch';
    }
    return formatDateTime(new Date(time));
  };

  const getContributionDuration = () => formatInterval(new Date(data.contributionDuration));

  return (
    <section className="min-w-0 overflow-x-hidden">
      <div className="rounded-t-lg py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4 min-w-0">
        <p className="font-bold text-xl md:text-2xl break-words min-w-0 flex-shrink">Asset Contribution</p>
        <button
          className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500 flex-shrink-0"
          type="button"
          onClick={() => setCurrentStep(2)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg min-w-0">
        <div className="space-y-12 min-w-0">
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Valuation type</p>
              <HoverHelp hint={VALUE_METHOD_HINT} />
            </div>

            <p className="break-words">
              {VAULT_VALUE_METHOD_OPTIONS.find(option => option.name === data.valueMethod)?.label}
            </p>
          </div>
          {data.valueMethod === 'fixed' && (
            <>
              <div>
                <p className="uppercase font-semibold text-dark-100">Valuation Currency</p>

                <p className="break-words">{data.valuationCurrency || 'Not set'}</p>
              </div>
              <div>
                <p className="uppercase font-semibold text-dark-100">Valuation Amount</p>
                <p className="break-words">{data.valuationAmount ? formatNum(data.valuationAmount) : 'Not set'}</p>
              </div>
            </>
          )}
          <div>
            <p className="uppercase font-semibold text-dark-100">Contribution duration</p>
            <p className="break-words">{data.contributionDuration ? getContributionDuration() : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Contribution Window Open Time</p>
            <p className="break-words">
              {formatTime(data.contributionOpenWindowType, data.contributionOpenWindowTime)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
