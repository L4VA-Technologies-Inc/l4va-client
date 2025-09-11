import { Edit } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';
import { TERMINATION_TYPE_OPTIONS } from '@/components/vaults/constants/vaults.constants';
import { HoverHelp } from '@/components/shared/HoverHelp';

export const LaunchGovernance = ({ data, setCurrentStep }) => (
  <section>
    <div className="rounded-t-lg py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4">
      <p className="font-bold text-xl md:text-2xl">Governance</p>
      <button
        className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500"
        type="button"
        onClick={() => setCurrentStep(4)}
      >
        <Edit size={20} className="w-6 h-6" />
        Edit
      </button>
    </div>
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg">
      <div className="space-y-12">
        <div>
          <p className="uppercase font-semibold text-dark-100">VT TOKEN SUPPLY</p>
          <p>{data.ftTokenSupply ? formatNum(data.ftTokenSupply) : 'Not set'}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">VT Token image</p>
          {data.ftTokenImg ? (
            <div className="mt-2 relative w-full h-32 overflow-hidden rounded-lg">
              <img alt="VT Token Image" className="w-full md:w-1/2 h-full object-cover" src={data.ftTokenImg} />
            </div>
          ) : (
            <p>No image</p>
          )}
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <p className="uppercase font-semibold text-dark-100">Termination type</p>
          <p>{TERMINATION_TYPE_OPTIONS.find(option => option.name === data.terminationType)?.label || 'Not set'}</p>
        </div>
        {data.terminationType === 'programmed' && (
          <>
            <div>
              <p className="uppercase font-semibold text-dark-100">Time Elapsed</p>
              <p>{data.timeElapsedIsEqualToTime ? `${formatNum(data.timeElapsedIsEqualToTime)} days` : 'Not set'}</p>
            </div>
            <div>
              <p className="uppercase font-semibold text-dark-100">Vault Appreciation</p>
              <p>{data.vaultAppreciation ? `${formatNum(data.vaultAppreciation)}%` : 'Not set'}</p>
            </div>
          </>
        )}
        <div>
          <p className="uppercase font-semibold text-dark-100 text-lg mb-6">Governance Proposal Rules</p>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <p className="uppercase font-semibold text-dark-100">Creation Threshold %</p>
                <HoverHelp hint="Minimum VT held by user (as % of total supply) required to create a proposal" />
              </div>
              <p>{data.creationThreshold ? `${formatNum(data.creationThreshold)}%` : 'Not set'}</p>
            </div>
            {/*<div>*/}
            {/*  <p className="uppercase font-semibold text-dark-100">Start Threshold %</p>*/}
            {/*  <p>{data.startThreshold ? `${formatNum(data.startThreshold)}%` : 'Not set'}</p>*/}
            {/*</div>*/}
            <div>
              <div className="flex items-center gap-2">
                <p className="uppercase font-semibold text-dark-100">Vote Threshold %</p>
                <HoverHelp hint="Minimum VT used to vote in proposals (as % of total supply) required for vote to be valid. If less, the proposal automatically fails." />
              </div>
              <p>{data.voteThreshold ? `${formatNum(data.voteThreshold)}%` : 'Not set'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="uppercase font-semibold text-dark-100">Execution Threshold %</p>
                <HoverHelp hint="Minimum VT votes for a given proposal option (as % of total votes) for a proposal to be approved." />
              </div>
              <p>{data.executionThreshold ? `${formatNum(data.executionThreshold)}%` : 'Not set'}</p>
            </div>
            {/*<div>*/}
            {/*  <p className="uppercase font-semibold text-dark-100">Cosigning Threshold %</p>*/}
            {/*  <p>{data.cosigningThreshold ? `${formatNum(data.cosigningThreshold)}%` : 'Not set'}</p>*/}
            {/*</div>*/}
          </div>
        </div>
      </div>
    </div>
  </section>
);
