import { Check, X } from 'lucide-react';

import LavaProgressBar from '@/components/shared/LavaProgressBar';
import { HoverHelp } from '@/components/shared/HoverHelp';

const ALIGNMENT_HINT = `Track your progress toward protocol alignment bonuses. Unlock up to 20% bonus on protocol rewards by staking L4VA, VLRM, and holding ORACLE.`;

export const AlignmentTracker = ({ alignment }) => {
  const { currentBonus, maxBonus, bonuses } = alignment;
  const bonusPercent = Math.round((currentBonus / maxBonus) * 100);

  return (
    <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-steel-750 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">Alignment Bonus Tracker</h3>
          <HoverHelp hint={ALIGNMENT_HINT} />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-steel-400">Current bonus</span>
              <span className="text-orange-500 font-semibold">+{currentBonus}%</span>
            </div>
            <LavaProgressBar
              segments={[
                { progress: bonusPercent, className: 'bg-gradient-to-r from-orange-500 to-[#FFD012]' },
                { progress: 100 - bonusPercent, className: 'bg-steel-700' },
              ]}
              className="h-3 rounded-full overflow-hidden"
            />
            <p className="text-steel-500 text-xs mt-1">Maximum: {maxBonus}%</p>
          </div>
        </div>

        <div className="space-y-3">
          {bonuses.map((bonus, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-steel-750 bg-steel-900/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    bonus.unlocked ? 'bg-green-600' : 'bg-steel-700'
                  }`}
                >
                  {bonus.unlocked ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-steel-500" />}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{bonus.action}</p>
                  {bonus.target != null && !bonus.unlocked && (
                    <div className="mt-1">
                      <div className="h-1.5 w-24 rounded-full bg-steel-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-500/60"
                          style={{ width: `${Math.min(bonus.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-steel-500 text-xs mt-0.5">{Math.round(bonus.progress)}%</p>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-orange-500 font-medium text-sm">+{bonus.bonus}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
