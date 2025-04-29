import { Edit } from 'lucide-react';

import { formatNum, formatDateTime, formatInterval } from '@/utils/core.utils';

export const LaunchInvestmentWindow = ({ data, setCurrentStep }) => {
  const formatTime = (type, time) => {
    if (type === 'upon-asset-window-closing') {
      return 'Upon asset window closing';
    }
    return formatDateTime(new Date(time));
  };

  const getInvestmentWindowDuration = () => formatInterval(new Date(data.investmentWindowDuration));

  return (
    <section>
      <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
        <p className="font-bold text-2xl">
          Investment
        </p>
        <button
          className="flex items-center gap-2 text-dark-100"
          type="button"
          onClick={() => setCurrentStep(3)}
        >
          <Edit size={24} />
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
        <div className="space-y-10">
          {data.privacy !== 'public' && (
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Investor whitelist
              </p>
              <div className="space-y-2">
                {data.investorsWhitelist?.length ? (
                  <>
                    {data.investorsWhitelist.slice(0, 5).map((investor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[20px]">{investor.walletAddress || 'Not set'}</span>
                      </div>
                    ))}
                    {data.investorsWhitelist.length > 5 && (
                      <p className="text-dark-100 text-sm mt-2">
                        +{formatNum(data.investorsWhitelist.length - 5)} more investors
                      </p>
                    )}
                  </>
                ) : data.investorsWhitelistCsv ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">CSV file uploaded</span>
                    <a
                      href={data.investorsWhitelistCsv.url}
                      download={data.investorsWhitelistCsv.fileName}
                      className="text-primary hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  <span className="text-[20px]">Not set</span>
                )}
              </div>
            </div>
          )}
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Investment Window Duration
            </p>
            <p className="text-[20px]">
              {data.investmentWindowDuration ? getInvestmentWindowDuration() : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Investment Window Open Time
            </p>
            <p className="text-[20px]">
              {formatTime(data.investmentOpenWindowType, data.investmentOpenWindowTime)}
            </p>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <p className="uppercase font-semibold text-dark-100">
              % of Assets Fractionalized
            </p>
            <p className="text-[20px]">
              {data.offAssetsOffered ? `${formatNum(data.offAssetsOffered)}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              FT Investment Reserve
            </p>
            <p className="text-[20px]">
              {data.ftInvestmentReserve ? `${formatNum(data.ftInvestmentReserve)}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              % Liquidity Pool Contribution
            </p>
            <p className="text-[20px]">
              {data.liquidityPoolContribution ? `${formatNum(data.liquidityPoolContribution)}%` : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
