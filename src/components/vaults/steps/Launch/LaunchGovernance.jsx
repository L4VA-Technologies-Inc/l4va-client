import { Edit } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';
import { TERMINATION_TYPE_OPTIONS } from '@/components/vaults/constants/vaults.constants';

export const LaunchGovernance = ({ data, setCurrentStep }) => (
  <section>
    <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
      <p className="font-bold text-2xl">Governance</p>
      <button className="flex items-center gap-2 text-dark-100" type="button" onClick={() => setCurrentStep(4)}>
        <Edit size={24} />
        Edit
      </button>
    </div>
    <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">FT TOKEN SUPPLY</p>
          <p className="text-[20px]">{data.ftTokenSupply ? formatNum(data.ftTokenSupply) : 'Not set'}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">FT Token image</p>
          <div className="mt-2 relative w-full h-32 overflow-hidden rounded-lg">
            <img
              alt="FT Token Image"
              className="w-1/2 h-full object-cover"
              src={data.ftTokenImg || '/assets/vault-token-image.png'}
            />
          </div>
        </div>
      </div>
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">Termination type</p>
          <p className="text-[20px]">
            {TERMINATION_TYPE_OPTIONS.find(option => option.name === data.terminationType)?.label || 'Not set'}
          </p>
        </div>
        {data.terminationType === 'programmed' && (
          <>
            <div>
              <p className="uppercase font-semibold text-dark-100">Time Elapsed</p>
              <p className="text-[20px]">
                {data.timeElapsedIsEqualToTime ? `${formatNum(data.timeElapsedIsEqualToTime)} days` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">Vault Appreciation</p>
              <p className="text-[20px]">
                {data.vaultAppreciation ? `${formatNum(data.vaultAppreciation)}%` : 'Not set'}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="uppercase font-semibold text-dark-100 text-xl mb-6">Governance Proposal Rules</p>
          <div>
            <p className="uppercase font-semibold text-dark-100">Creation Threshold %</p>
            <p className="text-[20px]">
              {data.creationThreshold ? `${formatNum(data.creationThreshold)}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Start Threshold %</p>
            <p className="text-[20px]">{data.startThreshold ? `${formatNum(data.startThreshold)}%` : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Vote Threshold %</p>
            <p className="text-[20px]">{data.voteThreshold ? `${formatNum(data.voteThreshold)}%` : 'Not set'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Execution Threshold %</p>
            <p className="text-[20px]">
              {data.executionThreshold ? `${formatNum(data.executionThreshold)}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Cosigning Threshold %</p>
            <p className="text-[20px]">
              {data.cosigningThreshold ? `${formatNum(data.cosigningThreshold)}%` : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
