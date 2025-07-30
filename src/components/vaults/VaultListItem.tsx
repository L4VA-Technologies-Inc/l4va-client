import { VaultSocialLinks } from '../vault-profile/VaultSocialLinks';

import { InfoRow } from '@/components/ui/InfoRow';
import { VaultShortResponse } from '@/utils/types';
import L4vaIcon from '@/icons/l4va.svg?react';
import { formatCompactNumber } from '@/utils/core.utils';

const VaultListItem = ({ vault }: { vault: VaultShortResponse }) => {
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
      <div className="grid grid-cols-4 md:grid-cols-5 gap-4 py-4 text-center border-[var(--color-steel-750)] border rounded-2xl bg-[var(--color-steel-950)] md:pl-[110px]">
        <div>
          <p className="text-sm text-dark-100">TVL</p>
          <p className="font-bold">{vault.tvl ? formatCompactNumber(vault.tvl) : 'N/A'}</p>
        </div>

        <div className="border-x border-slate-800">
          <p className="text-sm text-dark-100">Privacy</p>
          <p className="font-bold capitalize">{vault.privacy}</p>
        </div>
        <div className="hidden md:block">
          <p className="text-sm text-dark-100">Stage</p>
          <p className="font-bold capitalize">{vault.vaultStatus}</p>
        </div>

        <div className="flex items-center justify-center">
          <VaultSocialLinks socialLinks={vault.socialLinks as any} />
        </div>
      </div>
    </div>
  );
};

export default VaultListItem;
