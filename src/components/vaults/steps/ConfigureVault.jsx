import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaTextarea } from '@/components/shared/LavaTextarea';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { Chip } from '@/components/shared/Chip';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import {
  VAULT_PRIVACY_OPTIONS,
  VAULT_TAGS_OPTIONS,
  VAULT_PRIVACY_TYPES,
  PRIVACY_HINT,
} from '@/components/vaults/constants/vaults.constants';

export const ConfigureVault = ({
  data,
  errors = {},
  updateField,
  onImageUploadingChange,
  presetOptions = [],
  presetValue = '',
  onPresetChange,
  isPresetsLoading = false,
  onDeletePreset,
  deletingPresetId,
  onRemoveWhitelistItem,
}) => {
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
              label="*Vault Preset"
              name="preset"
              options={presetOptions}
              value={presetValue}
              onChange={onPresetChange}
              onDeleteOption={onDeletePreset}
              isOptionDeletable={option => option?.isCustom}
              deletingOptionId={deletingPresetId}
              hint="Choose a preset to auto-fill vault configuration fields."
            />
            {isPresetsLoading && <p className="text-dark-100 mt-2 text-sm">Loading presets…</p>}
            {errors.preset && <p className="text-red-600 mt-2 text-sm">{errors.preset}</p>}
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
            maxLength={9}
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

        <div>
          <LavaWhitelistWithCaps
            required
            label="Asset Whitelist"
            setWhitelist={assets => updateField('assetsWhitelist', assets)}
            whitelist={data.assetsWhitelist || []}
            errors={errors}
            vaultType={data.type}
            maxCapValue={1000000000}
          />
          {errors.assetsWhitelist && <p className="text-red-600 mt-2 text-sm">{errors.assetsWhitelist}</p>}
        </div>

        {data.privacy === VAULT_PRIVACY_TYPES.PRIVATE && data.valueMethod === 'lbe' && (
          <div>
            <LavaWhitelist
              required
              allowCsv
              itemPlaceholder="Enter Wallet Address"
              label="Contributor Whitelist"
              itemFieldName="walletAddress"
              whitelistFieldName="contributorWhitelist"
              scrollOnOverflow
              allowDeleteAll
              setWhitelist={assets => updateField('contributorWhitelist', assets)}
              whitelist={data.contributorWhitelist || []}
              maxItems={100}
              errors={errors}
              onRemove={index => onRemoveWhitelistItem('contributorWhitelist', index)}
            />
            {errors.contributorWhitelist && <p className="text-red-600 mt-2 text-sm">{errors.contributorWhitelist}</p>}
          </div>
        )}

        {data.privacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE && (
          <div>
            <LavaWhitelist
              required={false}
              allowCsv
              label="Contributor Whitelist"
              itemPlaceholder="Enter Wallet Address"
              itemFieldName="walletAddress"
              whitelistFieldName="contributorWhitelist"
              scrollOnOverflow
              allowDeleteAll
              setWhitelist={contributors => updateField('contributorWhitelist', contributors)}
              whitelist={data.contributorWhitelist || []}
              maxItems={100}
              errors={errors}
              onRemove={index => onRemoveWhitelistItem('contributorWhitelist', index)}
            />
            {errors.contributorWhitelist && <p className="text-red-600 mt-2 text-sm">{errors.contributorWhitelist}</p>}
          </div>
        )}

        {(data.privacy === VAULT_PRIVACY_TYPES.PRIVATE || data.privacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE) && (
          <div>
            <LavaWhitelist
              required={data.privacy === VAULT_PRIVACY_TYPES.PRIVATE}
              allowCsv
              itemFieldName="walletAddress"
              itemPlaceholder="Wallet address"
              label="Acquirer whitelist"
              whitelistFieldName="acquirerWhitelist"
              scrollOnOverflow
              allowDeleteAll
              setWhitelist={assets => updateField('acquirerWhitelist', assets)}
              whitelist={data.acquirerWhitelist || []}
              maxItems={100}
              errors={errors}
              onRemove={index => onRemoveWhitelistItem('acquirerWhitelist', index)}
            />
            {errors.acquirerWhitelist && <p className="text-red-600 mt-2 text-sm">{errors.acquirerWhitelist}</p>}
          </div>
        )}
      </div>

      <div className="space-y-12">
        <div>
          <UploadZone
            required
            image={data.vaultImage}
            label="Vault image"
            setImage={image => updateField('vaultImage', image)}
            hint="This is the image that will live on the Vault Profile page. For best results, upload a photo of 640×640 pixels — we will also crop it to these dimensions automatically."
            onUploadingChange={onImageUploadingChange}
            imageType="background"
          />
          {errors.vaultImage && <p className="text-red-600 mt-2 text-sm">{errors.vaultImage}</p>}
        </div>
        <div>
          <UploadZone
            required
            image={data.ftTokenImg}
            label="Vault Token Image"
            setImage={image => updateField('ftTokenImg', image)}
            onUploadingChange={onImageUploadingChange}
            hint="This is the image that will live on Vault Tocken. For best results, upload a photo of 256×256 pixels — we will also crop it to these dimensions automatically."
            imageType="ticker"
          />
          {errors.ftTokenImg && <p className="text-red-600 mt-2 text-sm">{errors.ftTokenImg}</p>}
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
                  <Chip
                    key={tag}
                    label={tagOption?.label || tag}
                    value={tag}
                    variant="removable"
                    onRemove={handleTagRemove}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
