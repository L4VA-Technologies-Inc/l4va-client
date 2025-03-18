import { Edit } from 'lucide-react';
import { getTimeDifference } from '@/utils/core.utils';

export const LaunchAssetContribution = ({ data, setCurrentStep }) => {
  const formatTime = time => {
    if(time === 'launch') {
      return 'Upon vault launch';
    }
    return getTimeDifference(time);
  };
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
          <Edit size={24}/>
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
              {data.valuationType}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Asset window
            </p>
            <p className="text-[20px]">
              {data.assetWindowDate ? formatTime(data.assetWindowDate) : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Contribution Window Open Time
            </p>
            <p className="text-[20px]">
              {formatTime(data.contributionOpenWindowType)}
            </p>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Asset whitelist
            </p>
            <p className="text-[20px]">
              Policy ID
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">
              Asset value cap
            </p>
            <p className="flex items-center gap-2 text-[20px]">
              <span>
                min: {data.minAssetCountCap}
              </span>
              <span>
                max: {data.maxAssetCountCap}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
