import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import LavaProgressBar from '@/components/shared/LavaProgressBar';
import { VAULT_STATUSES } from '@/components/vaults/constants/vaults.constants';
import { VaultSocialLinks } from '@/components/vault-profile/VaultSocialLinks';
import { formatNum, formatNumber, formatPolicyId } from '@/utils/core.utils';
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

const getAssetCountByPolicy = (assetsByPolicy, policyId) => {
  if (!assetsByPolicy || !assetsByPolicy.length) return 0;
  const match = assetsByPolicy.find(asset => asset.policyId === policyId);
  return match ? match.quantity : 0;
};

const calculateAcquireProgress = (totalAcquiredUsd, requireReservedCostUsd) => {
  if (totalAcquiredUsd <= 0 || !requireReservedCostUsd || requireReservedCostUsd <= 0) return 0;
  return (totalAcquiredUsd / requireReservedCostUsd) * 100;
};

const calculateLpMinThresholdPosition = (lpMinLiquidityAda, requireReservedCostAda, liquidityPoolContribution) => {
  if (!lpMinLiquidityAda || !requireReservedCostAda || !liquidityPoolContribution || liquidityPoolContribution <= 0)
    return 0;
  // Calculate what percentage of reserve is needed to meet LP minimum
  const lpPercentage = liquidityPoolContribution / 100;
  const requiredAcquiredAda = lpMinLiquidityAda / lpPercentage;
  return (requiredAcquiredAda / requireReservedCostAda) * 100;
};

const ProgressBubble = ({ value, progress }) => {
  const displayValue = formatNumber(value);
  return (
    <div
      className="absolute -top-7.5 flex flex-col items-center z-10"
      style={{ left: `${Math.min(progress, 100)}%`, transform: 'translateX(-50%)' }}
    >
      <div className="flex px-2 py-1 bg-steel-850 border border-steel-750 rounded-md shadow-lg mb-1">
        <span className="text-xs text-white font-semibold whitespace-nowrap">{displayValue}</span>
      </div>
      <div className="w-3 h-3 rounded-full bg-steel-750 border-2 border-primary shadow-sm"></div>
    </div>
  );
};

const ContributionProgress = ({
  title,
  contributionProgress,
  minContributeAssets,
  maxContributeAssets,
  assetList,
  assetsCount,
  assetsByPolicy,
  showMoreInfo,
  setShowMoreInfo,
}) => {
  const hasMax = maxContributeAssets != null && maxContributeAssets > 0;

  return (
    <>
      <h2 className={clsx('font-medium', hasMax && assetsCount > 0 ? 'mb-10' : 'mb-2')}>{title}:</h2>
      <div className="flex flex-col items-center relative overflow-visible">
        {hasMax ? (
          <>
            <div className="relative w-full mb-2 overflow-visible">
              <LavaProgressBar
                className="h-3 rounded-full bg-steel-750"
                segments={[
                  {
                    progress: contributionProgress,
                    className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
                  },
                ]}
              />
              {assetsCount > 0 && <ProgressBubble value={assetsCount} progress={contributionProgress} />}
            </div>
            <div className="flex justify-between w-full text-xs text-dark-100">
              <span>min {minContributeAssets}</span>
              <span>max {maxContributeAssets}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full justify-start gap-1 text-sm text-dark-100 mb-2">
              Total Contributed: <span className="text-white font-medium">{assetsCount}</span>
            </div>
            <div className="text-sm text-dark-100 mb-2">
              No asset limit - contributions accepted until the current phase expires
            </div>
          </>
        )}
        <AnimatePresence>
          {showMoreInfo && (
            <motion.div
              className="flex flex-col mt-3 gap-6 w-full overflow-visible"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {assetList.map(asset => {
                const assetCount = getAssetCountByPolicy(assetsByPolicy, asset.policyId);
                const hasAssetMax = asset.countCapMax != null && asset.countCapMax > 0;
                const assetProgress = hasAssetMax ? (assetCount / asset.countCapMax) * 100 : 0;
                return (
                  <div key={asset.policyId} className="flex flex-col items-center relative">
                    <p
                      className={clsx(
                        'truncate text-dark-100 w-full',
                        hasAssetMax && assetCount > 0 ? 'mb-10' : 'mb-2'
                      )}
                    >
                      <span className="text-white" title={asset.collectionName || asset.policyId}>
                        {asset.collectionName || formatPolicyId(asset.policyId)}
                      </span>
                    </p>
                    {hasAssetMax ? (
                      <>
                        <div className="relative w-full mb-2">
                          <LavaProgressBar
                            className="h-3 rounded-full bg-steel-750"
                            segments={[
                              {
                                progress: assetProgress,
                                className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
                              },
                            ]}
                          />
                          {assetCount > 0 && <ProgressBubble value={assetCount} progress={assetProgress} />}
                        </div>
                        <div className="flex justify-between w-full text-xs text-dark-100">
                          <span>min {asset.countCapMin}</span>
                          <span>max {asset.countCapMax}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-dark-100 w-full">
                        Contributed: <span className="text-white font-medium">{assetCount}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        {assetList?.length > 0 && (
          <button onClick={() => setShowMoreInfo(!showMoreInfo)}>{showMoreInfo ? 'Less' : 'More'} info</button>
        )}
      </div>
    </>
  );
};

export const VaultContribution = ({ vault }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { currency } = useCurrency();

  const isContribution = vault.vaultStatus === VAULT_STATUSES.CONTRIBUTION;
  const isAcquire = vault.vaultStatus === VAULT_STATUSES.ACQUIRE;
  const isLocked = vault.vaultStatus === VAULT_STATUSES.LOCKED;
  const isExpansion = vault.vaultStatus === VAULT_STATUSES.EXPANSION;

  const contributionProgress = calculateProgress(vault.assetsCount, vault.maxContributeAssets);
  const acquireProgress = calculateAcquireProgress(vault.assetsPrices.totalAcquiredUsd, vault.requireReservedCostUsd);
  const minContributeAssets = findMinValue(vault.assetsWhitelist, 'countCapMin');

  const reserveThresholdMet = acquireProgress >= 100;

  const lpMinThresholdPosition = calculateLpMinThresholdPosition(
    vault.lpMinLiquidityAda,
    vault.requireReservedCostAda,
    vault.liquidityPoolContribution
  );
  const canMeetLpMinimum = vault.projectedLpAdaAmount >= vault.lpMinLiquidityAda;
  const lpMinThresholdMet = canMeetLpMinimum && acquireProgress >= lpMinThresholdPosition;

  return (
    <div className="space-y-4">
      <div className="relative overflow-visible">
        {isContribution && (
          <ContributionProgress
            title="Contribution"
            contributionProgress={contributionProgress}
            minContributeAssets={minContributeAssets}
            maxContributeAssets={vault.maxContributeAssets}
            assetList={vault.assetsWhitelist || []}
            assetsCount={vault.assetsCount}
            assetsByPolicy={vault.assetsPrices.assetsByPolicy}
            showMoreInfo={showMoreInfo}
            setShowMoreInfo={setShowMoreInfo}
          />
        )}
      </div>

      <div className="relative">
        {isContribution ? null : isAcquire ? (
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
                  {
                    progress: Math.min(acquireProgress, 100),
                    className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
                  },
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
                {!canMeetLpMinimum ? (
                  <div className="flex flex-col gap-1 p-2 border border-red-500/30 bg-red-500/5 rounded mt-1">
                    <span className="text-red-400 font-medium">Vault will FAIL at lock</span>
                    <span className="text-red-300 text-xs">
                      LP is required but estimated ADA portion of LP (₳{formatNum(vault.projectedLpAdaAmount)}) is below
                      minimum (₳{vault.lpMinLiquidityAda}). Vault needs more acquire contributions or will fail and
                      refund users.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-dark-100">Current ADA LP amount:</span>
                      <span className="text-dark-100">
                        {currency === 'ada'
                          ? `₳${formatNum(vault.projectedLpAdaAmount)}`
                          : `$${formatNum(vault.projectedLpUsdAmount)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-100">LP Minimum (₳{vault.lpMinLiquidityAda}):</span>
                      <span className={lpMinThresholdMet ? 'text-green-400' : 'text-yellow-400'}>
                        {lpMinThresholdMet ? '✓ LP Threshold met' : 'Not yet reached'}
                      </span>
                    </div>
                    {!lpMinThresholdMet && (
                      <div className="flex flex-col gap-1 p-2 border border-yellow-500/30 bg-yellow-500/5 rounded mt-1">
                        <span className="text-yellow-300 text-xs">
                          LP minimum not yet met. Vault will fail to lock if acquire contributions don't reach{' '}
                          {Math.ceil(lpMinThresholdPosition)}% reserve threshold.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : isLocked && vault.assetsPrices.totalAcquiredAda && vault.assetsPrices.totalAcquiredUsd ? (
          <div className="w-full">
            <div className="text-sm text-dark-100 font-medium">
              Total Acquired Amount:{' '}
              <span className="text-[#F97316]">
                {currency === 'ada'
                  ? `₳${formatNumber(vault.assetsPrices.totalAcquiredAda || 0)}`
                  : `$${formatNumber(vault.assetsPrices.totalAcquiredUsd || 0)}`}
              </span>
            </div>
          </div>
        ) : isExpansion ? (
          <ContributionProgress
            title="Expansion"
            contributionProgress={
              vault.expansionAssetMax > 0
                ? calculateProgress(vault.expansionAssetsCount || 0, vault.expansionAssetMax)
                : 0
            }
            minContributeAssets={0}
            maxContributeAssets={vault.expansionAssetMax}
            assetList={vault.expansionAssetsByPolicy || []}
            assetsCount={vault.expansionAssetsCount || 0}
            assetsByPolicy={vault.expansionAssetsByPolicy || []}
            showMoreInfo={showMoreInfo}
            setShowMoreInfo={setShowMoreInfo}
          />
        ) : null}
      </div>

      <VaultSocialLinks socialLinks={vault.socialLinks} />
    </div>
  );
};
