import { Edit } from 'lucide-react';

import { LavaSocialLinksPreview } from '@/components/shared/LavaSocialLinks';
import {
  VAULT_TYPE_OPTIONS,
  VAULT_PRIVACY_OPTIONS,
} from '@/components/vaults/constants/vaults.constants';

export const LaunchConfigureVault = ({ data, setCurrentStep }) => (
  <section>
    <div className="rounded-t-[10px] py-4 px-8 flex justify-between bg-white/5">
      <p className="font-bold text-2xl">
        Configure Vault
      </p>
      <button
        className="flex items-center gap-2 text-dark-100"
        type="button"
        onClick={() => setCurrentStep(1)}
      >
        <Edit size={24} />
        Edit
      </button>
    </div>
    <div className="grid grid-cols-2 gap-8 rounded-b-[10px] bg-input-bg pt-4 pb-8 px-16">
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Vault name
          </p>
          <p className="text-[20px]">
            {data.name || 'No name'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Vault type
          </p>
          <p className="text-[20px]">
            {VAULT_TYPE_OPTIONS.find(option => option.name === data.type)?.label}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Vault privacy
          </p>
          <p className="text-[20px]">
            {VAULT_PRIVACY_OPTIONS.find(option => option.name === data.privacy)?.label}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            FT Token Ticker
          </p>
          <p className="text-[20px]">
            {data.vaultTokenTicker || 'Not set'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Vault brief
          </p>
          <p className="text-[20px]">
            {data.description || 'No description'}
          </p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Social links
          </p>
          <LavaSocialLinksPreview socialLinks={data.socialLinks} />
        </div>
      </div>
      <div className="space-y-10">
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Vault image
          </p>
          <div className="mt-2 relative w-64 h-32 overflow-hidden rounded-lg">
            <img
              alt="Vault Image"
              className="w-full h-full object-cover"
              src={data.vaultImage || '/assets/launch-vault.png'}
            />
          </div>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">
            Background banner
          </p>
          <div className="mt-2 relative w-full h-32 overflow-hidden rounded-lg">
            <img
              alt="Background Banner"
              className="w-full h-full object-cover"
              src={data.bannerImage || '/assets/launch-bg.png'}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);
