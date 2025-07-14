import { useEffect, useState } from 'react';

import { InfoRow } from '../ui/InfoRow';
import { VaultSocialLinks } from '../vault-profile/VaultSocialLinks';

import { VaultShortResponse } from '@/utils/types';
import L4vaIcon from '@/icons/l4va.svg?react';
import { formatCompactNumber } from '@/utils/core.utils';

const VaultListItem = ({ vault }: { vault: VaultShortResponse }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: Math.floor(vault.timeRemaining / (1000 * 60 * 60 * 24)),
    hours: Math.floor((vault.timeRemaining / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((vault.timeRemaining / 1000 / 60) % 60),
    ms: vault.timeRemaining,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const totalMS = Math.max(0, prevTime.ms - 60000);
        return {
          days: Math.floor(totalMS / (1000 * 60 * 60 * 24)),
          hours: Math.floor((totalMS / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((totalMS / 1000 / 60) % 60),
          ms: totalMS,
        };
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [vault.timeRemaining]);

  const formatNumber = (num: number) => String(num);
  const countdownText =
    timeLeft.ms > 0
      ? `${formatNumber(timeLeft.days)}d ${formatNumber(timeLeft.hours)}h ${formatNumber(timeLeft.minutes)}m`
      : 'Ended';

  return (
    <div className="relative mb-6">
      {/* Vault Image */}
      <div className="hidden md:block absolute bottom-9 left-2.5 w-[98px] h-[98px] rounded-2xl overflow-hidden">
        {vault.vaultImage ? (
          <img alt={`${vault.name} vault avatar`} src={vault.vaultImage} className="object-cover w-full h-full" />
        ) : (
          <div className="h-full w-full bg-steel-850 flex items-center justify-center">
            <L4vaIcon className="h-12 w-12 text-white" />
          </div>
        )}
      </div>

      {/* Vault Header */}
      <div className="flex md:ml-[120px] items-center justify-between gap-4 mb-3">
        <h3 className="font-bold text-xl">{vault.name || 'Unnamed Vault'}</h3>
        <InfoRow copyable label={vault.id} value={vault.id} labelClassName="max-w-[120px] truncate" hideValue />
      </div>

      {/* Vault Stats */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-4 py-4 text-center border-[#2D3049] border rounded-2xl bg-[#181A2A] md:pl-[110px]">
        <div>
          <p className="text-sm text-dark-100">TVL</p>
          <p className="font-bold">{vault.tvl ? formatCompactNumber(vault.tvl) : 'N/A'}</p>
        </div>

        <div className="border-x border-slate-800">
          <p className="text-sm text-dark-100">Privacy</p>
          <p className="font-bold capitalize">{vault.privacy}</p>
        </div>

        <div>
          <p className="text-sm text-dark-100">Base Allocation</p>
          <p className="font-bold">{vault.baseAllocation ? formatCompactNumber(vault.baseAllocation) : 'N/A'}</p>
        </div>

        <div className="hidden md:block">
          <p className="text-sm text-dark-100">Time Remaining</p>
          <p className="font-bold">{vault.timeRemaining ? countdownText : 'N/A'}</p>
        </div>

        <div className="flex items-center justify-center">
          <VaultSocialLinks socialLinks={vault.socialLinks as any} />
        </div>
      </div>
    </div>
  );
};

export default VaultListItem;
