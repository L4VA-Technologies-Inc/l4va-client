import { VAULT_STATUSES } from '../vaults/constants/vaults.constants';

import { formatNum } from '@/utils/core.utils';
import { VaultSocialLinks } from '@/components/vault-profile/VaultSocialLinks';

export const VaultContribution = ({ vault, phase }) => {
  const progress = (vault.assetsCount / vault.maxContributeAssets) * 100;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-medium mb-2">Contribution:</h2>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-100">
            Total Raised: <span className="text-[#F97316]">{vault.assetsCount}</span>
          </span>
          <span className="text-dark-100">
            min {vault.minContributeAssets || 0} / max {vault.maxContributeAssets}
          </span>
        </div>
        <div className="h-2 rounded-full bg-steel-750 mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F97316] via-[#F97316] to-[#FFD012]"
            style={{ width: `${progress}%`, maxWidth: '100%' }}
          />
        </div>
        {phase === VAULT_STATUSES.ACQUIRE && (
          <div>
            <h2 className="font-medium mb-2">Acquire:</h2>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-100">Reserve</span>
              <span className="text-dark-100">${formatNum(50000)}</span>
            </div>
            <div className="h-2 rounded-full bg-steel-750 opacity-50" />
          </div>
        )}
      </div>
      <VaultSocialLinks socialLinks={vault.socialLinks} />
    </div>
  );
};
