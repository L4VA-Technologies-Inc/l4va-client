import { Edit } from 'lucide-react';

export const LaunchInvestmentWindow = ({ data, setCurrentStep }) => (
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
        <Edit size={24}/>
        Edit
      </button>
    </div>
    <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Investor WL
          </p>
          <p className="text-[20px]">
            {data.investorWhitelist || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Investment Window Duration
          </p>
          <p className="text-[20px]">
            {data.investmentWindowDuration || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Investment Window Open Time
          </p>
          <p className="text-[20px]">
            {data.investmentWindowOpenTime || 'None'}
          </p>
        </div>
      </div>
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">
            % of Assets Fractionalized
          </p>
          <p className="text-[20px]">
            {data.offAssetsOffered ? `${data.offAssetsOffered}%` : 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Investment Window
          </p>
          <p className="text-[20px]">
            {data.ftInvestmentWindow || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Investment Reserve
          </p>
          <p className="text-[20px]">
            {data.ftInvestmentReserve || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            % Liquidity Pool Contribution
          </p>
          <p className="text-[20px]">
            {data.liquidityPoolContribution ? `${data.liquidityPoolContribution}%` : 'None'}
          </p>
        </div>
      </div>
    </div>
  </section>
);
