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
      <div className="rounded-t-[10px] py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4">
        <p className="font-bold text-xl md:text-2xl">Acquire</p>
        <button
          className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500"
          type="button"
          onClick={() => setCurrentStep(3)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg">
        <div className="space-y-12">
          {data.privacy !== 'public' && (
            <div>
              <p className="uppercase font-semibold text-dark-100">Acquirer whitelist</p>
              <div className="space-y-2">
                {data.acquirerWhitelist?.length ? (
                  <>
                    {data.acquirerWhitelist.slice(0, 5).map((acquirer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="max-w-[300px] truncate">{acquirer.walletAddress || 'Not set'}</span>
                      </div>
                    ))}
                    {data.acquirerWhitelist.length > 5 && (
                      <p className="text-dark-100 mt-2">
                        +{formatNum(data.acquirerWhitelist.length - 5)} more acquirers
                      </p>
                    )}
                  </>
                ) : data.acquirerWhitelistCsv ? (
                  <div className="flex items-center gap-2">
                    <span>CSV file uploaded</span>
                    <a
                      href={data.acquirerWhitelistCsv.url}
                      download={data.acquirerWhitelistCsv.fileName}
                      className="text-primary hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  <span>Not set</span>
                )}
              </div>
            </div>
          )}
          <div>
            <p className="uppercase font-semibold text-dark-100">Acquire Window Duration</p>
            <p>{data.acquireWindowDuration ? getAcquireWindowDuration() : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Acquire Window Open Time</p>
            <p>{formatTime(data.acquireOpenWindowType, data.acquireOpenWindowTime)}</p>
          </div>
        </div>
        <div className="space-y-12">
          <div>
            <p className="uppercase font-semibold text-dark-100">Assets Fractionalized (%)</p>
            <p>{data.tokensForAcquires ? `${formatNum(data.tokensForAcquires)}%` : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Reserve (%)</p>
            <p>{data.acquireReserve ? `${formatNum(data.acquireReserve)}%` : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Liquidity Pool (LP) Contribution (%)</p>
            <p>{data.liquidityPoolContribution ? `${formatNum(data.liquidityPoolContribution)}%` : 'Not set'}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
