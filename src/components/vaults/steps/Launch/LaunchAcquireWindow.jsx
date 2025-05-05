import { Edit } from 'lucide-react';

import { formatNum, formatDateTime, formatInterval } from '@/utils/core.utils';

export const LaunchAcquireWindow = ({ data, setCurrentStep }) => {
  const formatTime = (type, time) => {
    if (type === 'upon-asset-window-closing') {
      return 'Upon asset window closing';
    }
    return formatDateTime(new Date(time));
  };

  const getAcquireWindowDuration = () => formatInterval(new Date(data.acquireWindowDuration));

  return (
    <section>
      <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
        <p className="font-bold text-2xl">
          Acquire
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
                Acquirer whitelist
              </p>
              <div className="space-y-2">
                {data.acquirersWhitelist?.length ? (
                  <>
                    {data.acquirersWhitelist.slice(0, 5).map((acquirer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[20px]">{acquirer.walletAddress || 'Not set'}</span>
                      </div>
                    ))}
                    {data.acquirersWhitelist.length > 5 && (
                      <p className="text-dark-100 text-sm mt-2">
                        +{formatNum(data.acquirersWhitelist.length - 5)} more acquirers
                      </p>
                    )}
                  </>
                ) : data.acquirersWhitelistCsv ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">CSV file uploaded</span>
                    <a
                      href={data.acquirersWhitelistCsv.url}
                      download={data.acquirersWhitelistCsv.fileName}
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
              Acquire Window Duration
            </p>
            <p className="text-[20px]">
              {data.acquireWindowDuration ? getAcquireWindowDuration() : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Acquire Window Open Time
            </p>
            <p className="text-[20px]">
              {formatTime(data.acquireOpenWindowType, data.acquireOpenWindowTime)}
            </p>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Assets Fractionalized (%)
            </p>
            <p className="text-[20px]">
              {data.tokensForAcquires ? `${formatNum(data.tokensForAcquires)}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Reserve (%)
            </p>
            <p className="text-[20px]">
              {data.acquireReserve ? `${formatNum(data.acquireReserve)}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Liquidity Pool (LP) Contribution (%)
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
