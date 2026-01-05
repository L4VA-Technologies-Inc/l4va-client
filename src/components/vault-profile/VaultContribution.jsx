import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import LavaProgressBar from '@/components/shared/LavaProgressBar';
import { VAULT_STATUSES } from '@/components/vaults/constants/vaults.constants';
import { VaultSocialLinks } from '@/components/vault-profile/VaultSocialLinks';
import { formatNum } from '@/utils/core.utils';
import { useCurrency } from '@/hooks/useCurrency';

const calculateProgress = (current, target) => {
  if (!target || target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(progress, 100);
};

const findMinValue = (array, property) => {
  if (!array?.length) return 0;
  const min = array.reduce((min, item) => Math.min(min, item[property]), Infinity);
  return min === Infinity ? 0 : min;
};

const getAssetCountByPolicy = (assets, policyId) => {
  if (!assets || !assets.length) return 0;
  const matchingAssets = assets.filter(asset => asset.policyId === policyId);
  if (matchingAssets.length === 0) return 0;
  return matchingAssets.reduce((total, asset) => {
    return total + asset.quantity;
  }, 0);
};

const calculateAcquireProgress = (totalAcquiredUsd, requireReservedCostUsd) => {
  if (totalAcquiredUsd <= 0 || !requireReservedCostUsd || requireReservedCostUsd <= 0) return 0;
  return (totalAcquiredUsd / requireReservedCostUsd) * 100;
};

const calculateLpMinThresholdPosition = (lpMinLiquidityAda, projectedLpAdaAmount) => {
  if (!lpMinLiquidityAda || !projectedLpAdaAmount || projectedLpAdaAmount <= 0) return 0;
  return (lpMinLiquidityAda / projectedLpAdaAmount) * 100;
};

export const VaultContribution = ({ vault }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { currency } = useCurrency();

  const contributionProgress = calculateProgress(vault.assetsCount, vault.maxContributeAssets);
  const acquireProgress = calculateAcquireProgress(vault.assetsPrices.totalAcquiredUsd, vault.requireReservedCostUsd);
  const minContributeAssets = findMinValue(vault.assetsWhitelist, 'countCapMin');

  const reserveThresholdMet = acquireProgress >= 100;

  // Calculate LP minimum threshold position based on projected LP amount
  const lpMinThresholdPosition = calculateLpMinThresholdPosition(vault.lpMinLiquidityAda, vault.projectedLpAdaAmount);

  // Check if projected LP at 100% reserve can ever meet the minimum
  const canMeetLpMinimum = vault.projectedLpAdaAmount >= vault.lpMinLiquidityAda;

  // Only consider threshold met if we CAN meet it and current progress is sufficient
  const lpMinThresholdMet = canMeetLpMinimum && acquireProgress >= lpMinThresholdPosition;
  const lpProgressMultiplier = Math.min(acquireProgress, 100) / 100;
  const currentLpAdaAmount = vault.projectedLpAdaAmount * lpProgressMultiplier;
  const currentLpUsdAmount = vault.projectedLpUsdAmount * lpProgressMultiplier;

  return (
    <div className="space-y-4">
      <div className="relative">
        <h2 className="font-medium mb-2">Contribution:</h2>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-100">
            Total Raised: <span className="text-[#F97316]">{vault.assetsCount}</span>
          </span>
          <span className="text-dark-100">
            min {minContributeAssets} / max {vault.maxContributeAssets}
          </span>
        </div>
        <div className="flex flex-col items-center ">
          <LavaProgressBar
            className="h-2 rounded-full bg-steel-750 mb-2"
            segments={[
              {
                progress: contributionProgress,
                className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
              },
            ]}
          />
          <AnimatePresence>
            {showMoreInfo && (
              <motion.div
                className="flex flex-col mt-3 gap-6 w-full overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.25,
                  ease: 'easeInOut',
                }}
              >
                {vault.assetsWhitelist.map(asset => {
                  const assetCount = getAssetCountByPolicy(vault.assetsPrices.assets, asset.policyId);
                  const assetProgress = asset.countCapMax > 0 ? (assetCount / asset.countCapMax) * 100 : 0;

                  return (
                    <div key={asset.id}>
                      <p className="mb-2 truncate text-dark-100">
                        <span className="text-white">Name</span> {asset.policyId}
                      </p>
                      <LavaProgressBar
                        className="h-2 rounded-full bg-steel-750"
                        minLabel="min"
                        maxLabel="max"
                        showLabel
                        maxValue={asset.countCapMax}
                        minValue={asset.countCapMin}
                        segments={[
                          {
                            progress: assetProgress,
                            className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
                          },
                        ]}
                      />
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          {vault.assetsWhitelist?.length > 0 && (
            <button onClick={() => setShowMoreInfo(!showMoreInfo)}>{showMoreInfo ? 'Less' : 'More'} info</button>
          )}
          {(vault.vaultStatus === VAULT_STATUSES.ACQUIRE || vault.vaultStatus === VAULT_STATUSES.LOCKED) && (
            <div className="absolute bg-[#181A2A] opacity-70 w-full h-full top-0 left-0 flex items-center justify-center">
              <LockIcon className="h-[20px]" />
            </div>
          )}
        </div>
      </div>
      <div className="relative">
        {(vault.vaultStatus === VAULT_STATUSES.ACQUIRE || vault.vaultStatus === VAULT_STATUSES.LOCKED) && (
          <div>
            <h2 className="font-medium mb-2">Acquire:</h2>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-100">
                Reserve:{' '}
                {currency === 'ada'
                  ? `₳${formatNum(vault.requireReservedCostAda)}`
                  : `$${formatNum(vault.requireReservedCostUsd)}`}
              </span>
              <span className="text-dark-100">{Math.floor(acquireProgress)}%</span>
            </div>
            <div className="relative">
              <LavaProgressBar
                className="h-2 rounded-full bg-steel-750 mb-4"
                segments={[
                  // Pre-threshold segment (orange gradient)
                  {
                    progress: Math.min(acquireProgress, 100),
                    className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
                  },
                  // Post-threshold segment (red gradient) - only show if threshold is met
                  ...(reserveThresholdMet
                    ? [
                        {
                          progress: acquireProgress - 100,
                          className: 'bg-gradient-to-r from-[#FB2C3600] to-[#FB2C36]',
                        },
                      ]
                    : []),
                ]}
              />
            </div>
            {vault.liquidityPoolContribution > 0 && (
              <div className="flex flex-col gap-1 text-xs mt-2">
                {/* Show different messages based on whether vault can meet minimum */}
                {!canMeetLpMinimum ? (
                  <div className="flex flex-col gap-1 p-2 border border-red-500/30 rounded mt-1">
                    <span className="text-red-400 text-xs">
                      LP will not be created - estimated LP ({formatNum(vault.projectedLpAdaAmount)} ADA) is below
                      minimum ({vault.lpMinLiquidityAda} ADA)
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-dark-100">Current LP amount:</span>
                      <span className="text-dark-100">
                        {currency === 'ada' ? `₳${formatNum(currentLpAdaAmount)}` : `$${formatNum(currentLpUsdAmount)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-100">LP Minimum ({vault.lpMinLiquidityAda} ADA):</span>
                      <span className={lpMinThresholdMet ? 'text-green-400' : 'text-yellow-400'}>
                        {lpMinThresholdMet ? '✓ Threshold met' : 'Not yet reached'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {vault.vaultStatus === VAULT_STATUSES.LOCKED && (
          <div className="absolute bg-[#181A2A] opacity-70 w-full h-full top-0 left-0 flex items-center justify-center">
            <LockIcon className="h-[20px]" />
          </div>
        )}
      </div>
      <VaultSocialLinks socialLinks={vault.socialLinks} />
    </div>
  );
};
