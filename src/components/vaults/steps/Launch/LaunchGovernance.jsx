import { Edit } from 'lucide-react';

export const LaunchGovernance = ({ data, setCurrentStep }) => (
  <section>
    <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
      <p className="font-bold text-2xl">
        Governance
      </p>
      <button
        className="flex items-center gap-2 text-dark-100"
        type="button"
        onClick={() => setCurrentStep(4)}
      >
        <Edit size={24}/>
        Edit
      </button>
    </div>
    <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT TOKEN SUPPLY
          </p>
          <p className="text-[20px]">
            {data.ftTokenSupply || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Token Decimals
          </p>
          <p className="text-[20px]">
            {data.ftTokenDecimals || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Token image
          </p>
          <div className="mt-2 relative w-full h-32 overflow-hidden rounded-lg">
            <img
              alt="Background Banner"
              className="w-1/2 h-full object-cover"
              src={data.bannerImage || '/assets/vault-token-image.png'}
            />
          </div>
        </div>
      </div>
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Termination type
          </p>
          <p className="text-[20px]">
            {data.terminationType}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Creation Threshold %
          </p>
          <p className="text-[20px]">
            {data.creationThreshold || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Start threshold %
          </p>
          <p className="text-[20px]">
            {data.startThreshold || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Vote threshold %
          </p>
          <p className="text-[20px]">
            {data.voteThreshold || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Execution threshold %
          </p>
          <p className="text-[20px]">
            {data.executionThreshold || 'None'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Cosigning threshold %
          </p>
          <p className="text-[20px]">
            {data.cosigningThreshold || 'None'}
          </p>
        </div>
      </div>
    </div>
  </section>
);
