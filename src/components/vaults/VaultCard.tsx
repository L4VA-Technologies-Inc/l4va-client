import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { VaultCountdown } from '../vault-profile/VaultCountdown';

import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';
import { formatCompactNumber, formatNum } from '@/utils/core.utils';
import { VaultShortResponse } from '@/utils/types';

type VaultCardProps = {
  vault: VaultShortResponse;
};

const image = '/assets/vaults/space-man.webp';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export const VaultCard = ({ vault }: VaultCardProps) => {
  const { id, name, description, privacy, vaultImage, invested, socialLinks = [] } = vault;

  const shouldShowCountdown = useMemo(() => {
    if (!vault?.phaseEndTime) return false;

    // First condition: time must be less than 1 day
    const isLessThanOneDay = vault?.timeRemaining <= ONE_DAY_MS && vault?.timeRemaining > 0;

    // Second condition: time must be less than 10% of total duration
    let isLessThanTenPercent = false;
    if (vault.timeRemaining !== undefined) {
      const totalDuration = vault.timeRemaining;
      isLessThanTenPercent = vault?.timeRemaining <= totalDuration * 0.1;
    }

    return isLessThanOneDay && isLessThanTenPercent;
  }, [vault.phaseEndTime, vault.timeRemaining]);

  return (
    <div className="max-w-md rounded-xl bg-steel-950 overflow-hidden">
      <Link className="block" to={`/vaults/${id}`}>
        <div className="relative h-52">
          <img alt="Vault avatar" className="h-full w-full object-cover" src={vaultImage || image} />
          {shouldShowCountdown && (
            <div className="absolute bottom-0 left-0 w-3/4 ">
              <VaultCountdown
                className="text-base font-normal"
                color="yellow"
                endTime={new Date(vault?.phaseEndTime || '').getTime().toString()}
                isLocked={vault.vaultStatus === 'locked' || vault.vaultStatus === 'governance'}
              />
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <img alt="icon" className="h-16 w-16 rounded-xl" src="/assets/vault-logo.png" />
            <div>
              <h2 className="font-bold ">{name || 'No name'}</h2>
              <p className="text-sm text-dark-100">{description || 'No description'}</p>
            </div>
          </div>
          <div className="mb-6 text-sm font-russo">
            <div className="mb-2 flex justify-between ">
              <span>Total Raised:</span>
              <span className="text-gradient-orange">${formatNum(invested)}</span>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-dark-100">TVL</p>
              <p className="font-bold ">{vault.tvl ? formatCompactNumber(vault.tvl) : 'N/A'}</p>
            </div>
            <div className="border-x border-slate-800">
              <p className="text-sm text-dark-100">Privacy</p>
              <p className="font-bold ">{privacy}</p>
            </div>
            <div>
              <p className="text-sm text-dark-100">Base allo</p>
              <p className="font-bold ">{vault.baseAllocation ? formatCompactNumber(vault.baseAllocation) : 'N/A'}</p>
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
