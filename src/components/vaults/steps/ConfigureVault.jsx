import { LavaRadio } from '@/components/shared/LavaRadio';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { LavaInput } from '@/components/shared/LavaInput';
import { LavaTextarea } from '@/components/shared/LavaTextarea';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { Chip } from '@/components/shared/Chip';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import {
  VAULT_PRIVACY_OPTIONS,
  VAULT_TAGS_OPTIONS,
  VAULT_PRIVACY_TYPES,
  PRIVACY_HINT,
} from '@/components/vaults/constants/vaults.constants';
import { useNetwork } from '@/hooks/useNetwork';
import { useCurrency } from '@/hooks/useCurrency';
import { useVaultArchetypes } from '@/hooks/useVaultArchetypes';
import {
  VAULT_ARCHETYPES,
  VAULT_ARCHETYPE_HINT,
  VAULT_ARCHETYPE_OPTIONS,
} from '@/components/vaults/index/indexVault.utils';

export const ConfigureVault = ({
  data,
  errors = {},
  updateField,
  onImageUploadingChange,
  presetOptions = [],
  presetValue = '',
  onPresetChange,
  onDeletePreset,
  deletingPresetId,
  onRemoveWhitelistItem,
  onArchetypeChange,
}) => {
  const { isCardano } = useNetwork();
  const archetypes = useVaultArchetypes();
  const isIndexVault = !isCardano && data.vaultArchetype === VAULT_ARCHETYPES.INDEX_WEIGHTED;
  const archetypeOptions = VAULT_ARCHETYPE_OPTIONS.filter(option => archetypes.isArchetypeAvailable(option.name));
  const { currencyLabel } = useCurrency();

  const handleChange = e => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const privacyOptions = isCardano
    ? VAULT_PRIVACY_OPTIONS
    : VAULT_PRIVACY_OPTIONS.filter(option => option.name === VAULT_PRIVACY_TYPES.PUBLIC);

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

  // Calculate combined unique whitelist addresses
  const getCombinedWhitelistCount = () => {
    const contributorAddresses = (data.contributorWhitelist || [])
      .map(item => item.walletAddress?.toLowerCase())
      .filter(Boolean);
    const acquirerAddresses = (data.acquirerWhitelist || [])
      .map(item => item.walletAddress?.toLowerCase())
      .filter(Boolean);
    const uniqueAddresses = new Set([...contributorAddresses, ...acquirerAddresses]);
    return uniqueAddresses.size;
  };

  const combinedWhitelistCount = getCombinedWhitelistCount();
  const isOverLimit = combinedWhitelistCount > 100;

  return (
    <div className="my-16 space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
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
          {/* A chain that offers one vault type has nothing to ask: the type is
              stated, not chosen. Reopening a type is a settings change. */}
          {!isCardano && archetypes.hasChoice && (
            <div>
              <LavaRadio
                label="*Vault type"
                name="vaultArchetype"
                options={archetypeOptions}
                value={data.vaultArchetype || VAULT_ARCHETYPES.STANDARD}
                onChange={onArchetypeChange}
                hint={VAULT_ARCHETYPE_HINT}
              />
              {isIndexVault && (
                <p className="mt-3 text-sm text-dark-100">
                  Index vaults use the Acquire-Only preset. You will set the basket and its weights in the Acquire step.
                </p>
              )}
            </div>
          )}
          {!isCardano && !archetypes.hasChoice && isIndexVault && (
            <div className="rounded-lg bg-steel-850 p-4">
              <p className="font-bold uppercase">Index Weighted Vault</p>
              <p className="mt-2 text-sm text-dark-100">
                Acquirers fund the vault, and when the acquire window locks it buys the basket you set in the Acquire
                step at your target weights. Holders can re-weight it later by proposal.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {presetOptions.length > 1 ? (
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
                {errors.preset && <p className="text-red-600 mt-2 text-sm">{errors.preset}</p>}
              </div>
            ) : (
              // One preset is not a choice — state it instead of rendering a
              // radio group the user cannot answer differently.
              <div>
                <span className="uppercase font-bold">Vault preset</span>
                <p className="mt-2 text-sm text-dark-100">{presetOptions[0]?.label || 'Loading…'}</p>
                {errors.preset && <p className="text-red-600 mt-2 text-sm">{errors.preset}</p>}
              </div>
            )}
            <div>
              <LavaRadio
                label="*Vault privacy"
                name="privacy"
                options={privacyOptions}
                value={data.privacy || ''}
                onChange={value => updateField('privacy', value)}
                hint={PRIVACY_HINT}
              />
              {errors.privacy && <p className="text-red-600 mt-2 text-sm">{errors.privacy}</p>}
            </div>
          </div>

          <div>
            <LavaCheckbox
              name="allowAcquireExpansion"
              checked={data.allowAcquireExpansion || false}
              onChange={e => updateField('allowAcquireExpansion', e.target.checked)}
              label="Allow Acquire Expansion"
              description={`If enabled, vault token holders can create governance proposals to open additional acquire windows (${currencyLabel} to Vault Token minting) after the vault is locked.`}
            />
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
              hint="This is the Vault description."
            />
          </div>

          <div>
            <LavaTextarea
              error={errors.tokenDescription}
              label="Vault token description"
              name="tokenDescription"
              placeholder="Add a description for your Vault token"
              value={data.tokenDescription || ''}
              onChange={handleChange}
              hint="This is the Vault Token description used when registering Vault metadata."
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
              hint="This is the image that will live on Vault Token. For best results, upload a photo of 256×256 pixels — we will also crop it to these dimensions automatically."
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

      <div className="space-y-12">
        {!isIndexVault && (
          <div>
            <LavaWhitelistWithCaps
              required
              label="Asset Whitelist"
              setWhitelist={assets => updateField('assetsWhitelist', assets)}
              whitelist={data.assetsWhitelist || []}
              errors={errors}
              vaultType={data.type}
              isExpandable={data.isExpandableAssetWhitelist}
              onExpandableChange={checked => updateField('isExpandableAssetWhitelist', checked)}
            />
            {errors.assetsWhitelist && <p className="text-red-600 mt-2 text-sm">{errors.assetsWhitelist}</p>}
          </div>
        )}

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

        {/* Combined whitelist warning - Over limit only */}
        {(data.privacy === VAULT_PRIVACY_TYPES.PRIVATE || data.privacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE) &&
          isOverLimit && (
            <div className="p-4 rounded-lg border border-red-700">
              <p className="text-sm font-medium text-white">
                ⚠️ Combined Whitelist: {combinedWhitelistCount} / 100 unique addresses
              </p>
              <p className="text-xs mt-1 text-white">
                {`You've exceeded the maximum limit! Please remove ${combinedWhitelistCount - 100} address${
                  combinedWhitelistCount - 100 > 1 ? 'es' : ''
                } to continue.`}
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
