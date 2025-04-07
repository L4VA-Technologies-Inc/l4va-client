import { formatNum } from '@/utils/core.utils';
import { VaultSocialLinks } from '@/components/vault-profile/VaultSocialLinks';

export const VaultContribution = ({ totalRaised, target, socialLinks = [] }) => {
  const progress = (totalRaised / target) * 100;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[20px] font-medium mb-2">
          Contribution:
        </h2>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-100">Total Raised: <span className="text-[#F97316]">95%</span></span>
          <span className="text-dark-100">max 225</span>
        </div>
        <div className="h-2 rounded-full bg-steel-750 mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F97316] via-[#F97316] to-[#FFD012]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div>
          <h2 className="text-[20px] font-medium mb-2">
            Investment:
          </h2>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-100">Reserve</span>
            <span className="text-dark-100">${formatNum(50000)}</span>
          </div>
          <div className="h-2 rounded-full bg-steel-750 opacity-50" />
        </div>
      </div>
      <VaultSocialLinks socialLinks={socialLinks} />
    </div>
  );
}; 