import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { VaultCountdown } from '@/components/vault-profile/VaultCountdown';
import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';
import { formatCompactNumber } from '@/utils/core.utils';
import { VaultShortResponse } from '@/utils/types';
import L4vaIcon from '@/icons/l4va.svg?react';

type VaultCardProps = {
  vault: VaultShortResponse;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const VaultCard = ({ vault }: VaultCardProps) => {
  const { id, name, description, privacy, vaultImage, ftTokenImg, socialLinks = [] } = vault;

  const shouldShowCountdown = useMemo(() => {
    if (!vault?.phaseEndTime || !vault?.phaseStartTime) return false;

    const phaseStart = new Date(vault.phaseStartTime).getTime();
    const phaseEnd = new Date(vault.phaseEndTime).getTime();
    const tenPercentThreshold = (phaseEnd - phaseStart) * 0.1;

    const isLessThanOneDay = vault.timeRemaining <= ONE_DAY_MS && vault.timeRemaining > 0;
    const isLessThanTenPercent = vault.timeRemaining <= tenPercentThreshold && vault.timeRemaining > 0;

    return isLessThanOneDay && isLessThanTenPercent;
  }, [vault.phaseStartTime, vault.phaseEndTime, vault.timeRemaining]);

  return (
    <div className="max-w-md rounded-xl bg-steel-950 overflow-hidden">
      <Link className="block" to={`/vaults/${id}`}>
        <div className="relative h-52">
          {vaultImage ? (
            <img alt="Vault avatar" className="h-full w-full object-cover" src={vaultImage} />
          ) : (
            <div className="h-full w-full bg-steel-850 flex items-center justify-center">
              <L4vaIcon className="h-8 w-8 text-white" />
            </div>
          )}
          {shouldShowCountdown && (
            <div className="absolute bottom-0 left-0 w-3/4">
              <VaultCountdown
                className="text-base font-normal"
                color="yellow"
                endTime={vault.phaseEndTime || ''}
                isLocked={vault.vaultStatus === 'locked' || vault.vaultStatus === 'governance'}
              />
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {ftTokenImg ? (
              <img alt="Token icon" className="h-16 w-16 rounded-xl object-cover" src={ftTokenImg} />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-primary-background flex items-center justify-center flex-shrink-0">
                <L4vaIcon className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h2 className="font-bold">{name || 'No name'}</h2>
              <p className="text-sm text-dark-100">{description || 'No description'}</p>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-dark-100">TVL</p>
              <p className="font-bold">{vault.tvl ? formatCompactNumber(vault.tvl) : 'N/A'}</p>
            </div>
            <div className="border-x border-slate-800">
              <p className="text-sm text-dark-100">Privacy</p>
              <p className="capitalize font-bold">{privacy}</p>
            </div>
            <div>
              <p className="text-sm text-dark-100">Stage</p>
              <p className="capitalize font-bold">{vault.vaultStatus}</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-center gap-3 h-10 px-6 pb-6">
        {socialLinks.length > 0 ? (
          socialLinks.map((social, index) => (
            <a key={index} href={social.url} rel="noopener noreferrer" target="_blank">
              <SocialPlatformIcon className="text-white" platformId={social.name} />
            </a>
          ))
        ) : (
          <span className="text-dark-100 text-sm">No social links</span>
        )}
      </div>
    </div>
  );
};
