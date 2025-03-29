import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaTextarea } from '@/components/shared/LavaTextarea';

import {
  VAULT_TYPE_OPTIONS,
  VAULT_PRIVACY_OPTIONS,
} from '@/components/vaults/constants/vaults.constants';

export const ConfigureVault = ({
  data,
  errors = {},
  updateField,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <LavaInput
          required
          error={errors.name}
          label="Vault name"
          name="name"
          placeholder="Add the name of your Vault"
          value={data.name || ''}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 mt-[60px]">
          <div>
            <LavaRadio
              label="*Vault type"
              name="type"
              options={VAULT_TYPE_OPTIONS}
              value={data.type || ''}
              onChange={(value) => updateField('type', value)}
            />
            {errors.type && (
              <p className="text-main-red mt-1">
                {errors.type}
              </p>
            )}
          </div>
          <div>
            <LavaRadio
              label="*Vault privacy"
              name="privacy"
              options={VAULT_PRIVACY_OPTIONS}
              value={data.privacy || ''}
              onChange={(value) => updateField('privacy', value)}
            />
            {errors.privacy && (
              <p className="text-main-red mt-1">
                {errors.privacy}
              </p>
            )}
          </div>
        </div>

        <div className="mt-[60px]">
          <LavaInput
            required
            error={errors.ftTokenTicker}
            label="Fractional Token (FT) Ticker"
            maxLength={6}
            name="ftTokenTicker"
            placeholder="Add ticker"
            value={data.ftTokenTicker || ''}
            onChange={handleChange}
          />
        </div>
        <div className="mt-[60px]">
          <LavaTextarea
            error={errors.description}
            label="Vault description"
            name="description"
            placeholder="Add a description for your Vault"
            value={data.description || ''}
            onChange={handleChange}
          />
        </div>

        <div className="mt-[60px]">
          <LavaSocialLinks
            errors={errors}
            setSocialLinks={(links) => updateField('socialLinks', links)}
            socialLinks={data.socialLinks || []}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[60px] px-[36px]">
        <div>
          <UploadZone
            required
            image={data.vaultImage}
            label="Vault image"
            setImage={(image) => updateField('vaultImage', image)}
          />
          {errors.vaultImage && (
            <p className="text-main-red mt-1">
              {errors.vaultImage}
            </p>
          )}
        </div>
        <div>
          <UploadZone
            image={data.bannerImage}
            label="Background banner"
            setImage={(image) => updateField('bannerImage', image)}
          />
          {errors.bannerImage && (
            <p className="text-main-red mt-1">
              {errors.bannerImage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
