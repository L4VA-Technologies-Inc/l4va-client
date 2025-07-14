import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { VAULT_STATUSES } from '../vaults/constants/vaults.constants';
import LavaProgressBar from '../shared/LavaProgressBar';

import { formatNum } from '@/utils/core.utils';
import { VaultSocialLinks } from '@/components/vault-profile/VaultSocialLinks';

export const VaultContribution = ({ vault }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const progress = (vault.assetsCount / vault.maxContributeAssets) * 100;

  return (
    <div className="space-y-4">
      <div className="relative">
        <h2 className="font-medium mb-2">Contribution:</h2>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-100">
            Total Raised: <span className="text-[#F97316]">{vault.assetsCount}</span>
          </span>
          <span className="text-dark-100">
            min {vault.minContributeAssets || 0} / max {vault.maxContributeAssets}
          </span>
        </div>
        <div className="flex flex-col items-center ">
          <LavaProgressBar
            className="h-2 rounded-full bg-steel-750 mb-2"
            segments={[
              {
                progress: 10,
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
                {vault.assetsWhitelist.map(asset => (
                  <div key={asset.id}>
                    <p className="mb-2 truncate text-dark-100">
                      <span className="text-white">Name</span> {asset.policyId}
                    </p>
                    <LavaProgressBar
                      className="h-2 rounded-full bg-steel-750"
                      minLabel="min"
                      maxLabel="max"
                      showLabel
                      maxValue={asset.countCapMax || '50%'}
                      minValue={asset.countCapMin || '50%'}
                      segments={[
                        {
                          progress: 10,
                        },
                      ]}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {vault.assetsWhitelist.lenght && (
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
                {
                  progress,
                  className: 'bg-gradient-to-r from-[#F9731600] to-[#F97316]',
                },
                {
                  progress: 50,
                  className: 'bg-gradient-to-r from-[#FB2C3600] to-[#FB2C36]',
                },
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
