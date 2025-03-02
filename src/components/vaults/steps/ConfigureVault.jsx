import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';

export const ConfigureVault = ({
  data,
  errors = {},
  updateField,
}) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateField(id, value);
  };

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <div>
          <Label className="uppercase text-[20px] font-bold" htmlFor="name">
            * Vault name
          </Label>
          <Input
            className={`rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4 ${
              errors.name ? 'border-red-500' : ''
            }`}
            id="name"
            placeholder="Enter the name of your Vault"
            style={{ fontSize: '20px' }}
            value={data.name || ''}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 mt-[60px]">
          <div>
            <LavaRadioGroup
              label="*Vault type"
              name="type"
              options={[
                { id: 'single', label: 'Single NFT' },
                { id: 'multi', label: 'Multi NFT' },
                { id: 'cnt', label: 'Any CNT' },
              ]}
              value={data.type || ''}
              onChange={(value) => updateField('type', value)}
            />
            {errors.type && (
              <p className="text-red-500 mt-1">{errors.type}</p>
            )}
          </div>

          <div>
            <LavaRadioGroup
              label="*Vault privacy"
              name="privacy"
              options={[
                { id: 'private', label: 'Private Vault' },
                { id: 'public', label: 'Public Vault' },
                { id: 'semi-private', label: 'Semi-Private Vault' },
              ]}
              value={data.privacy || ''}
              onChange={(value) => updateField('privacy', value)}
            />
            {errors.privacy && (
              <p className="text-red-500 mt-1">{errors.privacy}</p>
            )}
          </div>
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="fractionToken">
            Fractional Token (FT) Ticker
          </Label>
          <Input
            className={`rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4 ${
              errors.fractionToken ? 'border-red-500' : ''
            }`}
            id="fractionToken"
            placeholder="0.00"
            style={{ fontSize: '20px' }}
            value={data.fractionToken || ''}
            onChange={handleChange}
          />
          {errors.fractionToken && (
            <p className="text-red-500 mt-1">{errors.fractionToken}</p>
          )}
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="description">
            Vault brief
          </Label>
          <Textarea
            className={`
              resize-none rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4 min-h-32
              ${errors.description ? 'border-red-500' : ''}
            `}
            id="description"
            placeholder="Add a description for your Vault"
            style={{ fontSize: '20px' }}
            value={data.description || ''}
            onChange={handleChange}
          />
          {errors.description && (
            <p className="text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div className="mt-[60px]">
          <LavaSocialLinks
            setSocialLinks={(links) => updateField('socialLinks', links)}
            socialLinks={data.socialLinks || []}
          />
          {errors.socialLinks && (
            <p className="text-red-500 mt-1">{errors.socialLinks}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-[60px] px-[36px]">
        <div>
          <UploadZone
            image={data.vaultImage}
            label="*Vault image"
            setImage={(image) => updateField('vaultImage', image)}
          />
          {errors.vaultImage && (
            <p className="text-red-500 mt-1">{errors.vaultImage}</p>
          )}
        </div>
        <div>
          <UploadZone
            image={data.backgroundBanner}
            label="*Background banner"
            setImage={(image) => updateField('backgroundBanner', image)}
          />
          {errors.backgroundBanner && (
            <p className="text-red-500 mt-1">{errors.backgroundBanner}</p>
          )}
        </div>
      </div>
    </div>
  );
};
