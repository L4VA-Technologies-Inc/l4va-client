import { Edit } from 'lucide-react';

import { formatInterval, formatNum, formatDateTime, substringAddress } from '@/utils/core.utils';
import { VAULT_VALUE_METHOD_OPTIONS } from '@/components/vaults/constants/vaults.constants';

export const LaunchAssetContribution = ({ data, setCurrentStep }) => {
  const formatTime = (type, time) => {
    if (type === 'upon-vault-launch') {
      return 'Upon vault launch';
    }
    return formatDateTime(new Date(time));
  };

  const getContributionDuration = () => formatInterval(new Date(data.contributionDuration));

  return (
    <section>
      <div className="rounded-t-lg py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4">
        <p className="font-bold text-xl md:text-2xl">Asset Contribution</p>
        <button
          className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500"
          type="button"
          onClick={() => setCurrentStep(2)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg">
        <div className="space-y-12">
          <div>
            <p className="uppercase font-semibold text-dark-100">Valuation type</p>
            <p>{VAULT_VALUE_METHOD_OPTIONS.find(option => option.name === data.valuationType)?.label}</p>
          </div>
          {data.valuationType === 'fixed' && (
            <>
              <div>
                <p className="uppercase font-semibold text-dark-100">Valuation Currency</p>
                <p>{data.valuationCurrency || 'Not set'}</p>
              </div>
              <div>
                <p className="uppercase font-semibold text-dark-100">Valuation Amount</p>
                <p>{data.valuationAmount ? formatNum(data.valuationAmount) : 'Not set'}</p>
              </div>
            </>
          )}
          <div>
            <p className="uppercase font-semibold text-dark-100">Contribution duration</p>
            <p>{data.contributionDuration ? getContributionDuration() : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Contribution Window Open Time</p>
            <p>{formatTime(data.contributionOpenWindowType, data.contributionOpenWindowTime)}</p>
          </div>
        </div>
        <div className="space-y-12">
          <div>
            <p className="uppercase font-semibold text-dark-100">Asset whitelist</p>
            {data.assetsWhitelist?.length ? (
              <div className="space-y-2">
                {data.assetsWhitelist.slice(0, 5).map((asset, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{substringAddress(asset.policyId)}</span>
                  </div>
                ))}
                {data.assetsWhitelist.length > 5 && (
                  <p className="text-dark-100 mt-2">+{formatNum(data.assetsWhitelist.length - 5)} more assets</p>
                )}
              </div>
            ) : (
              <span>Not set</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
