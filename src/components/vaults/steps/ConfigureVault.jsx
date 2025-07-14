import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaTextarea } from '@/components/shared/LavaTextarea';
import { LavaSelect } from '@/components/shared/LavaSelect';
import {
  VAULT_TYPE_OPTIONS,
  VAULT_PRIVACY_OPTIONS,
  VAULT_TAGS_OPTIONS,
  PRIVACY_HINT,
} from '@/components/vaults/constants/vaults.constants';

export const ConfigureVault = ({ data, errors = {}, updateField }) => {
  const handleChange = e => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleTagAdd = tagValue => {
    const currentTags = data.tags || [];
    if (!currentTags.includes(tagValue)) {
      updateField('tags', [...currentTags, tagValue]);
    }
  };

  const handleTagRemove = tagToRemove => {
    const currentTags = data.tags || [];
    updateField(
      'tags',
      currentTags.filter(tag => tag !== tagToRemove)
    );
  };

  return (
    <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-16">
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
        <div>
          <LavaSelect
            label="Add vault tags"
            options={VAULT_TAGS_OPTIONS}
            value=""
            onChange={handleTagAdd}
            placeholder="Select tags for your vault"
            error={errors.tags}
          />
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {data.tags.map(tag => {
                const tagOption = VAULT_TAGS_OPTIONS.find(option => option.value === tag);
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-steel-850 text-white border border-steel-750"
                  >
                    {tagOption?.label || tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-steel-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
