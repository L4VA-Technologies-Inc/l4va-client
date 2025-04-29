import { Edit } from 'lucide-react';

import { formatInterval, formatNum, formatDateTime } from '@/utils/core.utils';
import {
  VAULT_VALUATION_TYPE_OPTIONS,
} from '@/components/vaults/constants/vaults.constants';

export const LaunchAssetContribution = ({ data, setCurrentStep }) => {
  const formatTime = (type, time) => {
    if (type === 'upon-vault-lunch') {
      return 'Upon vault launch';
    }
    return formatDateTime(new Date(time));
  };

  const getContributionDuration = () => formatInterval(new Date(data.contributionDuration));

  return (
    <section>
      <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
        <p className="font-bold text-2xl">
          Asset Contribution
        </p>
        <button
          className="flex items-center gap-2 text-dark-100"
          type="button"
          onClick={() => setCurrentStep(2)}
        >
          <Edit size={24} />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
        <div className="space-y-10">
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Valuation type
            </p>
            <p className="text-[20px]">
              {VAULT_VALUATION_TYPE_OPTIONS.find(option => option.name === data.valuationType)?.label}
            </p>
          </div>
          {data.valuationType === 'fixed' && (
            <>
              <div>
                <p className="uppercase font-semibold text-dark-100">
                  Valuation Currency
                </p>
                <p className="text-[20px]">
                  {data.valuationCurrency || 'Not set'}
                </p>
              </div>
              <div>
                <p className="uppercase font-semibold text-dark-100">
                  Valuation Amount
                </p>
                <p className="text-[20px]">
                  {data.valuationAmount ? formatNum(data.valuationAmount) : 'Not set'}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Contribution duration
            </p>
            <p className="text-[20px]">
              {data.contributionDuration ? getContributionDuration() : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Contribution Window Open Time
            </p>
            <p className="text-[20px]">
              {formatTime(data.contributionOpenWindowType, data.contributionOpenWindowTime)}
            </p>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Asset whitelist
            </p>
            {data.assetsWhitelist?.length ? (
              <div className="space-y-2">
                {data.assetsWhitelist.slice(0, 5).map((asset, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[20px]">{asset.policyId}</span>
                  </div>
                ))}
                {data.assetsWhitelist.length > 5 && (
                  <p className="text-dark-100 text-sm mt-2">
                    +{formatNum(data.assetsWhitelist.length - 5)} more assets
                  </p>
                )}
              </div>
            ) : <span className="text-[20px]">Not set</span>}
          </div>
        </div>
      </div>
    </section>
  );
};
