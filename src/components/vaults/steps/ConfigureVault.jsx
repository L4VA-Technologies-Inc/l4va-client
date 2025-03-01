import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';

export const ConfigureVault = ({
  data,
  setData,
}) => {
  const updateField = (fieldName, value) => {
    setData({
      ...data,
      [fieldName]: value,
    });
  };

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
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="name"
            placeholder="Enter the name of your Vault"
            style={{ fontSize: '20px' }}
            value={data.name || ''}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 mt-[60px]">
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
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="fractionToken">
            Fractional Token (FT) Ticker
          </Label>
          <Input
            className="rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4"
            id="fractionToken"
            placeholder="0.00"
            style={{ fontSize: '20px' }}
            value={data.fractionToken || ''}
            onChange={handleChange}
          />
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="description">
            Vault brief
          </Label>
          <Textarea
            className="
              resize-none rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4 min-h-32
            "
            id="description"
            placeholder="Add a description for your Vault"
            style={{ fontSize: '20px' }}
            value={data.description || ''}
            onChange={handleChange}
          />
        </div>

        <div className="mt-[60px]">
          <LavaSocialLinks
            setSocialLinks={(links) => updateField('socialLinks', links)}
            socialLinks={data.socialLinks || []}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[60px] px-[36px]">
        <UploadZone
          image={data.vaultImage}
          label="*Vault image"
          setImage={(image) => updateField('vaultImage', image)}
        />
        <UploadZone
          image={data.vaultBanner}
          label="Vault banner"
          setImage={(image) => updateField('vaultBanner', image)}
        />
      </div>
    </div>
  );
};
