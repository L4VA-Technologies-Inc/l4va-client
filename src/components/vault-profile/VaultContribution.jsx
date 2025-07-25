import { LockIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { VAULT_STATUSES } from '../vaults/constants/vaults.constants';
import LavaProgressBar from '../shared/LavaProgressBar';

import { formatNum } from '@/utils/core.utils';
import { VaultSocialLinks } from '@/components/vault-profile/VaultSocialLinks';

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

export const VaultContribution = ({ vault }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const minContributeAssets = useMemo(
    () => findMinValue(vault.assetsWhitelist, 'countCapMin'),
    [vault.assetsWhitelist]
  );

  const acquireProgress = useMemo(
    () => calculateProgress(vault.assetsCount, vault.acquireReserve),
    [vault.assetsCount, vault.acquireReserve]
  );

  const contributionProgress = useMemo(
    () => calculateProgress(vault.assetsCount, vault.maxContributeAssets),
    [vault.assetsCount, vault.maxContributeAssets]
  );

  const reserveThresholdMet = acquireProgress >= 100;

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
                  // Calculate progress for each whitelisted asset
                  const assetProgress = asset.countCapMax > 0 ? (vault.assetsCount / asset.countCapMax) * 100 : 0;

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
          {vault.vaultStatus === VAULT_STATUSES.ACQUIRE && (
            <div className="absolute bg-[#181A2A] opacity-70 w-full h-full top-0 left-0 flex items-center justify-center">
              <LockIcon className="h-[20px]" />
            </div>
          )}
        </div>
      </div>
      <div className="relative">
        {vault.vaultStatus === VAULT_STATUSES.ACQUIRE && (
          <div>
            <h2 className="font-medium mb-2">Acquire:</h2>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-100">Reserve</span>
              <span className="text-dark-100">${formatNum(50000)}</span>
            </div>
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
                        progress: 0, // This would be the progress past reserve threshold
                        className: 'bg-gradient-to-r from-[#FB2C3600] to-[#FB2C36]',
                      },
                    ]
                  : []),
              ]}
            />
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
