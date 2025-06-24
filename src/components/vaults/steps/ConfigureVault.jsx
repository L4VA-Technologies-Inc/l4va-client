import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaTextarea } from '@/components/shared/LavaTextarea';
import {
  VAULT_TYPE_OPTIONS,
  VAULT_PRIVACY_OPTIONS,
  PRIVACY_HINT,
} from '@/components/vaults/constants/vaults.constants';

export const ConfigureVault = ({ data, errors = {}, updateField }) => {
  const handleChange = e => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-12">
        <div>
          <LavaInput
            required
            error={errors.name}
            label="Vault name"
            name="name"
            placeholder="Add the name of your Vault"
            value={data.name || ''}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <LavaRadio
              label="*Vault type"
              name="type"
              options={VAULT_TYPE_OPTIONS}
              value={data.type || ''}
              onChange={value => updateField('type', value)}
              hint="Type of assets that can be contributed to the Vault."
            />
            {errors.type && <p className="text-red-600 mt-2 text-sm">{errors.type}</p>}
          </div>
          <div>
            <LavaRadio
              label="*Vault privacy"
              name="privacy"
              options={VAULT_PRIVACY_OPTIONS}
              value={data.privacy || ''}
              onChange={value => updateField('privacy', value)}
              hint={PRIVACY_HINT}
            />
            {errors.privacy && <p className="text-red-600 mt-2 text-sm">{errors.privacy}</p>}
          </div>
        </div>

        <div>
          <LavaInput
            required
            error={errors.vaultTokenTicker}
            label="Vault Token Ticker"
            maxLength={6}
            name="vaultTokenTicker"
            placeholder="Add ticker"
            value={data.vaultTokenTicker || ''}
            onChange={handleChange}
            hint="This is the ticker that the Governance Token will have when minted."
          />
        </div>

        <div>
          <LavaTextarea
            error={errors.description}
            label="Vault description"
            name="description"
            placeholder="Add a description for your Vault"
            value={data.description || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-12">
        <div>
          <UploadZone
            required
            image={data.vaultImage}
            label="Vault image"
            setImage={image => updateField('vaultImage', image)}
            hint="This is the image that will live on the Vault Profile page."
          />
          {errors.vaultImage && <p className="text-red-600 mt-2 text-sm">{errors.vaultImage}</p>}
        </div>
        <div>
          <LavaSocialLinks
            errors={errors}
            setSocialLinks={links => updateField('socialLinks', links)}
            socialLinks={data.socialLinks || []}
          />
        </div>
      </div>
    </div>
  );
};
