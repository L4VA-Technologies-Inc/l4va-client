import { Edit } from 'lucide-react';

import {
  TERMINATION_TYPE_OPTIONS,
} from '@/components/vaults/constants/vaults.constants';

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
        <Edit size={24} />
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
            {data.ftTokenSupply || 'Not set'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Token Decimals
          </p>
          <p className="text-[20px]">
            {data.ftTokenDecimals || 'Not set'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Token image
          </p>
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
          <p className="uppercase font-semibold text-dark-100">
            Termination type
          </p>
          <p className="text-[20px]">
            {TERMINATION_TYPE_OPTIONS.find(option => option.name === data.terminationType)?.label || 'Not set'}
          </p>
        </div>
        {data.terminationType === 'programmed' && (
          <>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Time Elapsed
              </p>
              <p className="text-[20px]">
                {data.timeElapsedIsEqualToTime ? `${data.timeElapsedIsEqualToTime} days` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Vault Appreciation
              </p>
              <p className="text-[20px]">
                {data.vaultAppreciation ? `${data.vaultAppreciation}%` : 'Not set'}
              </p>
            </div>
          </>
        )}
        {data.terminationType === 'dao' && (
          <>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Creation Threshold %
              </p>
              <p className="text-[20px]">
                {data.creationThreshold ? `${data.creationThreshold}%` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Start Threshold %
              </p>
              <p className="text-[20px]">
                {data.startThreshold ? `${data.startThreshold}%` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Vote Threshold %
              </p>
              <p className="text-[20px]">
                {data.voteThreshold ? `${data.voteThreshold}%` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Execution Threshold %
              </p>
              <p className="text-[20px]">
                {data.executionThreshold ? `${data.executionThreshold}%` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">
                Cosigning Threshold %
              </p>
              <p className="text-[20px]">
                {data.cosigningThreshold ? `${data.cosigningThreshold}%` : 'Not set'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  </section>
);
