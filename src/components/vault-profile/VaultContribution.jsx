import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';

import { formatNum } from '@/utils/core.utils';

export const VaultContribution = ({ totalRaised, target, socialLinks = [] }) => {
  const progress = (totalRaised / target) * 100;

  const renderSocialLinks = () => {
    if (socialLinks.length === 0) {
      return <p className="text-dark-100 text-sm">No social links</p>;
    }

    return (
      <div className="flex justify-center gap-4">
        {socialLinks.slice(0, 5).map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity border border-dark-100"
          >
            <SocialPlatformIcon
              className="text-dark-100"
              platformId={link.name}
              size={20}
            />
          </a>
        ))}
      </div>
    );
  };

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
        <div className="h-2 rounded-full bg-[#2D3049] mb-4">
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
          <div className="h-2 rounded-full bg-[#2D3049] opacity-50" />
        </div>
      </div>
      {renderSocialLinks()}
    </div>
  );
}; 