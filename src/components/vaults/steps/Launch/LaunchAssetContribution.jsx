import { Edit } from 'lucide-react';

import { formatInterval, formatNum, formatDateTime, substringAddress } from '@/utils/core.utils';
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
            <div className="flex items-center gap-2">
              <p className="uppercase font-semibold text-dark-100">Valuation type</p>
              <HoverHelp hint={VALUE_METHOD_HINT} />
            </div>

            <p>{VAULT_VALUE_METHOD_OPTIONS.find(option => option.name === data.valueMethod)?.label}</p>
          </div>
          {data.valueMethod === 'fixed' && (
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
              <div className="space-y-6">
                {data.assetsWhitelist.slice(0, 5).map((asset, index) => {
                  return (
                    <div key={asset.policyId || index} className="space-y-4">
                      <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>{substringAddress(asset.policyId)}</span>
                        </div>
                        <span>{asset.policyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="uppercase font-semibold text-dark-100">Min asset cap</p>
                          <p>{data.assetsWhitelist?.length ? formatNum(asset.countCapMin) : 'Not set'}</p>
                        </div>
                        <div>
                          <p className="uppercase font-semibold text-dark-100">Max asset cap</p>
                          <p>{data.assetsWhitelist?.length ? formatNum(asset.countCapMax) : 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
