import { Edit } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';
import { TERMINATION_TYPE_OPTIONS } from '@/components/vaults/constants/vaults.constants';
import { HoverHelp } from '@/components/shared/HoverHelp';

export const LaunchGovernance = ({ data, setCurrentStep }) => {
  const formatPercent = value => {
    if (!value && value !== 0) return 'Not set';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Not set';
    return `${num.toFixed(1)}%`;
  };

  return (
    <section className="min-w-0 overflow-x-hidden">
      <div className="rounded-t-lg py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4 min-w-0">
        <p className="font-bold text-xl md:text-2xl break-words min-w-0 flex-shrink">Governance</p>
        <button
          className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500 flex-shrink-0"
          type="button"
          onClick={() => setCurrentStep(4)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg min-w-0">
        <div className="space-y-12 min-w-0">
          <div>
            <p className="uppercase font-semibold text-dark-100">VAULT TOKENS SUPPLY</p>
            <p className="break-words">{data.ftTokenSupply ? formatNum(data.ftTokenSupply) : 'Not set'}</p>
          </div>
        </div>
        <div className="space-y-12 min-w-0">
          <div>
            <p className="uppercase font-semibold text-dark-100">Termination type</p>
            <p className="break-words">
              {TERMINATION_TYPE_OPTIONS.find(option => option.name === data.terminationType)?.label || 'Not set'}
            </p>
          </div>
          {data.terminationType === 'programmed' && (
            <>
              <div>
                <p className="uppercase font-semibold text-dark-100">Time Elapsed</p>
                <p className="break-words">
                  {data.timeElapsedIsEqualToTime ? `${formatNum(data.timeElapsedIsEqualToTime)} days` : 'Not set'}
                </p>
              </div>
              <div>
                <p className="uppercase font-semibold text-dark-100">Vault Appreciation</p>
                <p className="break-words">{formatPercent(data.vaultAppreciation)}</p>
              </div>
            </>
          )}
          <div>
            <p className="uppercase font-semibold text-dark-100 text-lg mb-6">Governance Proposal Rules</p>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Creation Threshold %</p>
                  <HoverHelp hint="Minimum Vault tokens held by user (as % of total supply) required to create a proposal" />
                </div>
                <p className="break-words">{formatPercent(data.creationThreshold)}</p>
              </div>
              {/*<div>*/}
              {/*  <p className="uppercase font-semibold text-dark-100">Start Threshold %</p>*/}
              {/*  <p>{data.startThreshold ? `${formatNum(data.startThreshold)}%` : 'Not set'}</p>*/}
              {/*</div>*/}
              <div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Vote Threshold %</p>
                  <HoverHelp hint="Minimum Vault tokens used to vote in proposals (as % of total supply) required for vote to be valid. If less, the proposal automatically fails." />
                </div>
                <p className="break-words">{formatPercent(data.voteThreshold)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Execution Threshold %</p>
                  <HoverHelp hint="Minimum Vault tokens votes for a given proposal option (as % of total votes) for a proposal to be approved." />
                </div>
                <p className="break-words">{formatPercent(data.executionThreshold)}</p>
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
};
