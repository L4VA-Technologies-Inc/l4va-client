import { useMemo } from 'react';
import { addWeeks, subWeeks, format, getISOWeek } from 'date-fns';

/**
 * Mock data hook for L4VA Rewards.
 * Replace with API call when backend is ready.
 *
 * Expected API shape:
 * - GET /api/v1/rewards/summary -> { totalEarned, activityBreakdown, alignment, baseStakingApr, nextRewardDate }
 * - GET /api/v1/rewards/epochs -> { weeklyEpochs }
 * - POST /api/v1/rewards/claim -> claim single or all epochs
 */

const ACTIVITY_CATEGORIES = [
  { id: 'asset_contribution', label: 'Asset contribution to vaults', weight: 'Very high', weightValue: 5 },
  { id: 'vault_creation', label: 'Vault creation', weight: 'High', weightValue: 4 },
  { id: 'acquire', label: 'Acquire phase participation', weight: 'Medium–High', weightValue: 3.5 },
  { id: 'expansion', label: 'Vault expansion participation', weight: 'Medium', weightValue: 3 },
  { id: 'governance', label: 'Governance participation', weight: 'Medium', weightValue: 3 },
  { id: 'protocol_usage', label: 'Protocol usage and testing', weight: 'Low–Medium', weightValue: 2 },
];

const ALIGNMENT_BONUSES = [
  { action: 'Stake ≥ 100,000 L4VA', bonus: 5, target: 100000, type: 'l4va' },
  { action: 'Stake ≥ 20,000 VLRM', bonus: 5, target: 20000, type: 'vlrm' },
  { action: 'Hold Oracle (ORACLE)', bonus: '0.5–5%', target: null, type: 'oracle' },
  { action: 'Full alignment (L4VA + VLRM + ORACLE)', bonus: 5, target: null, type: 'full' },
];

export function useL4VARewards() {
  return useMemo(() => {
    const now = new Date();

    // Generate 8 weeks: 3 past claimed, 1 claimable, 1 pending, 3 future
    const weeklyEpochs = [];
    for (let i = -4; i <= 3; i++) {
      const weekStart = subWeeks(now, -i);
      const weekEnd = addWeeks(weekStart, 1);
      const weekNumber = getISOWeek(weekStart);

      let status = 'future';
      if (i < -1) status = 'claimed';
      else if (i === -1) status = 'claimable';
      else if (i === 0) status = 'pending';

      const amount = status === 'future' ? 0 : Math.floor(500 + Math.random() * 1500);
      weeklyEpochs.push({
        id: `epoch-${i + 5}`,
        weekNumber: weekNumber,
        startDate: format(weekStart, 'MMM d'),
        endDate: format(weekEnd, 'MMM d'),
        fullStartDate: weekStart.toISOString(),
        fullEndDate: weekEnd.toISOString(),
        amount,
        status,
        claimableAt: status === 'pending' ? addWeeks(weekEnd, 0.5) : null,
      });
    }

    // Activity breakdown with mock values
    const activityBreakdown = ACTIVITY_CATEGORIES.map(cat => ({
      ...cat,
      amount: Math.floor(200 + Math.random() * 800),
    }));

    const claimedEpochTotal = weeklyEpochs.filter(e => e.status === 'claimed').reduce((s, e) => s + e.amount, 0);
    const totalEarned = Math.round(activityBreakdown.reduce((sum, a) => sum + a.amount, 0) + claimedEpochTotal);

    const l4vaStaked = 65000;
    const l4vaTarget = 100000;
    const vlrmStaked = 15000;
    const vlrmTarget = 20000;
    const hasOracle = false;
    const l4vaUnlocked = l4vaStaked >= l4vaTarget;
    const vlrmUnlocked = vlrmStaked >= vlrmTarget;
    const fullUnlocked = l4vaUnlocked && vlrmUnlocked && hasOracle;

    let currentBonus = 0;
    if (l4vaUnlocked) currentBonus += 5;
    if (vlrmUnlocked) currentBonus += 5;
    if (hasOracle) currentBonus += 2.5; // mid-range for oracle
    if (fullUnlocked) currentBonus += 5;
    currentBonus = Math.min(currentBonus, 20);

    const alignment = {
      l4vaStaked,
      l4vaTarget,
      vlrmStaked,
      vlrmTarget,
      hasOracle,
      hasFullAlignment: fullUnlocked,
      currentBonus,
      maxBonus: 20,
      bonuses: [
        { ...ALIGNMENT_BONUSES[0], unlocked: l4vaUnlocked, progress: Math.min(100, (l4vaStaked / l4vaTarget) * 100) },
        { ...ALIGNMENT_BONUSES[1], unlocked: vlrmUnlocked, progress: Math.min(100, (vlrmStaked / vlrmTarget) * 100) },
        { ...ALIGNMENT_BONUSES[2], unlocked: hasOracle, progress: hasOracle ? 100 : 0 },
        { ...ALIGNMENT_BONUSES[3], unlocked: fullUnlocked, progress: fullUnlocked ? 100 : 0 },
      ],
    };

    return {
      weeklyEpochs,
      totalEarned,
      activityBreakdown,
      alignment,
      baseStakingApr: 12.5,
      nextRewardDate: addWeeks(now, 1),
      isLoading: false,
      error: null,
    };
  }, []);
}
