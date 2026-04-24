import { Check, Sparkles, X } from 'lucide-react';

import { HoverHelp } from '@/components/shared/HoverHelp';

const ORACLE_TIERS = [
  { min: 50000, bonus: 5.0, label: 'Tier 8: 50,000+ ORACLE' },
  { min: 20000, bonus: 4.25, label: 'Tier 7: 20,000+ ORACLE' },
  { min: 10000, bonus: 3.5, label: 'Tier 6: 10,000+ ORACLE' },
  { min: 5000, bonus: 2.75, label: 'Tier 5: 5,000+ ORACLE' },
  { min: 2500, bonus: 2.0, label: 'Tier 4: 2,500+ ORACLE' },
  { min: 1000, bonus: 1.5, label: 'Tier 3: 1,000+ ORACLE' },
  { min: 500, bonus: 1.0, label: 'Tier 2: 500+ ORACLE' },
  { min: 100, bonus: 0.5, label: 'Tier 1: 100+ ORACLE' },
];

const ALIGNMENT_HINT = `Boost your protocol rewards by up to 20%. Stack multiple bonuses for maximum multiplier.`;

const getOracleTier = balance => {
  for (const tier of ORACLE_TIERS) {
    if (balance >= tier.min) return tier;
  }
  return null;
};

export const AlignmentBonusDisplay = ({ alignmentData, isLoading = false }) => {
  if (!alignmentData && !isLoading) return null;

  const bonuses = alignmentData?.bonuses || {};
  const l4vaBonus = bonuses.l4va || {};
  const vlrmBonus = bonuses.vlrm || {};
  const oracleBonus = bonuses.oracle || {};
  const alignmentFullBonus = bonuses.alignment || {};

  const totalBonusPercent = alignmentData?.multiplierPercent || 0;
  const maxBonusPercent = alignmentData?.maxMultiplierPercent || 20;

  const oracleTier = getOracleTier(oracleBonus.balance || 0);

  const bonusItems = [
    {
      label: 'L4VA Staking',
      requirement: `Stake at least ${l4vaBonus.requiredAmount?.toLocaleString() || '100,000'} L4VA`,
      bonus: l4vaBonus.bonusPercent || 5,
      achieved: l4vaBonus.achieved,
      progress: l4vaBonus.requiredAmount ? Math.min(100, (l4vaBonus.stakedAmount / l4vaBonus.requiredAmount) * 100) : 0,
      stakedAmount: l4vaBonus.stakedAmount || 0,
      requiredAmount: l4vaBonus.requiredAmount || 100000,
      iconUrl: '/favicon/favicon.png',
    },
    {
      label: 'VLRM Staking',
      requirement: `Stake at least ${vlrmBonus.requiredAmount?.toLocaleString() || '20,000'} VLRM`,
      bonus: vlrmBonus.bonusPercent || 5,
      achieved: vlrmBonus.achieved,
      progress: vlrmBonus.requiredAmount ? Math.min(100, (vlrmBonus.stakedAmount / vlrmBonus.requiredAmount) * 100) : 0,
      stakedAmount: vlrmBonus.stakedAmount || 0,
      requiredAmount: vlrmBonus.requiredAmount || 20000,
      iconUrl: 'https://app.l4va.org/api/v1/asset-image/QmdYu513Bu7nfKV5LKP6cmpZ8HHXifQLH6FTTzv3VbbqwP',
    },
    {
      label: 'ORACLE Holding',
      requirement: oracleTier ? oracleTier.label : 'Hold at least 100 ORACLE',
      bonus: oracleBonus.bonusPercent || 0,
      achieved: oracleBonus.achieved,
      progress: oracleBonus.achieved ? 100 : 0,
      balance: oracleBonus.balance || 0,
      isTiered: true,
      iconUrl: 'https://app.l4va.org/api/v1/image/d81c44b5-bf67-4945-8c9b-b76591716997',
    },
    {
      label: 'Full Alignment',
      requirement: 'All three conditions met (L4VA + VLRM + ORACLE)',
      bonus: alignmentFullBonus.bonusPercent || 5,
      achieved: alignmentFullBonus.achieved,
      progress: alignmentFullBonus.achieved ? 100 : 0,
      isFullAlignment: true,
      iconLucide: Sparkles,
    },
  ];

  return (
    <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-steel-750 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">Alignment Bonuses</h3>
          <HoverHelp hint={ALIGNMENT_HINT} />
        </div>
        <div className="hidden md:flex items-center text-sm gap-2">
          <span className="text-steel-400">Total Bonus:</span>
          <span className={`font-bold ${totalBonusPercent > 0 ? 'text-orange-500' : 'text-steel-400'}`}>
            {isLoading ? '...' : `+${totalBonusPercent}%`}
          </span>
          <span className="text-steel-500">/ {maxBonusPercent}%</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-steel-800 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-steel-800 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-steel-800 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          bonusItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-steel-800 overflow-hidden flex items-center justify-center">
                  {item.iconUrl ? (
                    <img src={item.iconUrl} alt={`${item.label} token`} className="w-full h-full object-cover" />
                  ) : (
                    <item.iconLucide className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-steel-900 flex items-center justify-center ${
                    item.achieved ? 'bg-green-500' : 'bg-steel-600'
                  }`}
                >
                  {item.achieved ? (
                    <Check className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <X className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-medium ${item.achieved ? 'text-white' : 'text-steel-400'}`}>{item.label}</span>
                  <span className={`text-sm font-semibold ${item.achieved ? 'text-orange-500' : 'text-steel-500'}`}>
                    {item.bonus > 0 ? `+${item.bonus}%` : item.isTiered ? '+0.5% to +5%' : `+${item.bonus}%`}
                  </span>
                </div>
                <p className="text-xs text-steel-400 mb-2">{item.requirement}</p>

                {!item.isFullAlignment && !item.isTiered && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-steel-500">
                        {item.stakedAmount.toLocaleString()} / {item.requiredAmount.toLocaleString()}
                      </span>
                      <span className="text-steel-500">{Math.round(item.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-steel-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.achieved
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-steel-600 to-steel-700'
                        }`}
                        style={{ width: `${Math.min(100, item.progress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.isTiered && (
                  <div className="text-xs text-steel-400">
                    Balance: {item.balance.toLocaleString()} ORACLE
                    {oracleTier && <span className="text-orange-500 ml-1">({oracleTier.label})</span>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Mobile total bonus display */}
        {!isLoading && (
          <div className="md:hidden pt-4 border-t border-steel-750 flex items-center justify-between">
            <span className="text-steel-400 text-sm">Total Bonus:</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${totalBonusPercent > 0 ? 'text-orange-500' : 'text-steel-400'}`}>
                +{totalBonusPercent}%
              </span>
              <span className="text-steel-500 text-sm">/ {maxBonusPercent}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
