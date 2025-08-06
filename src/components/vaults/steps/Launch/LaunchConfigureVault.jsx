import { Edit } from 'lucide-react';

import { LavaSocialLinksPreview } from '@/components/shared/LavaSocialLinks';
import { VAULT_TYPE_OPTIONS, VAULT_PRIVACY_OPTIONS } from '@/components/vaults/constants/vaults.constants';

export const LaunchConfigureVault = ({ data, setCurrentStep }) => (
  <section>
    <div className="rounded-t-lg py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4">
      <p className="font-bold text-xl md:text-2xl">Configure Vault</p>
      <button
        className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500"
        type="button"
        onClick={() => setCurrentStep(1)}
      >
        <Edit size={20} className="w-6 h-6" />
        Edit
      </button>
    </div>
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg">
      <div className="space-y-12">
        <div>
          <p className="uppercase font-semibold text-dark-100">Vault name</p>
          <p>{data.name || 'No name'}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">Vault type</p>
          <p>{VAULT_TYPE_OPTIONS.find(option => option.name === data.type)?.label}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">Vault privacy</p>
          <p>{VAULT_PRIVACY_OPTIONS.find(option => option.name === data.privacy)?.label}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">VT Token Ticker</p>
          <p>{data.vaultTokenTicker || 'Not set'}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">Vault brief</p>
          <p>{data.description || 'No description'}</p>
        </div>
        <div>
          <p className="uppercase font-semibold text-dark-100">Social links</p>
          <LavaSocialLinksPreview socialLinks={data.socialLinks} />
        </div>
      </div>
      <div className="space-y-12">
        <div>
          <p className="uppercase font-semibold text-dark-100">Vault image</p>
          {data.vaultImage ? (
            <div className="mt-2 relative w-full md:w-64 h-32 overflow-hidden rounded-lg">
              <img alt="Vault Image" className="w-full h-full object-cover" src={data.vaultImage} />
            </div>
          ) : (
            <p>No image</p>
          )}
        </div>
      </div>
    </div>
  </section>
);
