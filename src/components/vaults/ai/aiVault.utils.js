import { initialVaultState, vaultSchema } from '@/components/vaults/constants/vaults.constants';

export const AI_VAULT_STORAGE_META_KEY = 'storageVaultAiMeta';
export const AI_VAULT_CHAT_SESSION_KEY = 'aiVaultChat';

export const MAX_IMAGE_SIZE_MB = 5;

/** Returns an error message for an unusable image file, or null when the file is fine. */
export const validateImageFile = file => {
  if (!file) return 'Please choose an image file';
  if (!file.type.startsWith('image/')) return 'Please choose an image file';
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return `File size must be less than ${MAX_IMAGE_SIZE_MB}MB`;
  return null;
};

/**
 * Image prompt derived from the vault the assistant already built, so a one-click "Generate image"
 * needs no prompt from the user. The preview panel still accepts a written prompt.
 */
export const buildVaultImagePrompt = vault => {
  const parts = [];
  parts.push(
    vault?.name ? `Cover artwork for a crypto vault called "${vault.name}"` : 'Cover artwork for a crypto vault'
  );
  if (vault?.description) parts.push(vault.description);
  if (vault?.tags?.length) parts.push(`Themes: ${vault.tags.join(', ')}`);
  parts.push('Bold, modern, iconic, centered composition, no text.');
  return parts.join('. ');
};

/** User-facing labels for vault fields, used to translate raw field names in assistant hints. */
const FIELD_LABELS = {
  name: 'vault name',
  vaultTokenTicker: 'token ticker',
  preset_id: 'preset',
  privacy: 'privacy setting',
  type: 'asset type',
  tags: 'tags',
  description: 'description',
  tokenDescription: 'token description',
  // One image backs both the vault and its token, so both fields describe the same single need.
  vaultImage: 'vault image',
  ftTokenImg: 'vault image',
  isExpandableAssetWhitelist: 'expandable whitelist setting',
  allowAcquireExpansion: 'acquire expansion setting',
  valueMethod: 'valuation method',
  valuationCurrency: 'valuation currency',
  valuationAmount: 'valuation amount',
  contributionOpenWindowType: 'contribution window type',
  contributionOpenWindowTime: 'contribution window time',
  contributionDuration: 'contribution window length',
  acquireOpenWindowType: 'acquire window type',
  acquireOpenWindowTime: 'acquire window time',
  acquireWindowDuration: 'acquire window length',
  tokensForAcquires: 'tokens for acquirers',
  acquireReserve: 'acquire reserve',
  liquidityPoolContribution: 'liquidity pool contribution',
  isAcquireOnly: 'acquire-only setting',
  minAcquireThreshold: 'minimum acquire threshold',
  ftTokenSupply: 'token supply',
  terminationType: 'termination type',
  creationThreshold: 'proposal threshold',
  cosigningThreshold: 'quorum',
  executionThreshold: 'approval threshold',
};

/** Turns raw field names (e.g. "vaultTokenTicker") into short, user-friendly phrases. */
export const describeField = name => FIELD_LABELS[name] ?? name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

/** Formats a list of missing/invalid field names into a readable, comma-separated phrase. */
export const describeMissingFields = fields => [...new Set(fields.map(describeField))].join(', ');

/**
 * Validate only the fields the assistant just produced. Validating the whole draft would
 * surface errors for fields the user has not reached yet, which the assistant cannot fix.
 */
export const validateAiDraftFields = async (mergedVault, draftKeys) => {
  const errors = [];
  // Keys like preset_id/allowAcquireExpansion aren't part of the form schema — validateAt()
  // throws "schema does not contain the path" for them, which is not a real validation error.
  const schemaKeys = new Set(Object.keys(vaultSchema.fields));

  await Promise.all(
    draftKeys
      .filter(key => schemaKeys.has(key))
      .map(async key => {
        try {
          await vaultSchema.validateAt(key, mergedVault);
        } catch (err) {
          errors.push(`${key}: ${err?.message ?? 'invalid value'}`);
        }
      })
  );

  return errors;
};

/** Drop every field named in `errors` so an invalid value never reaches the form. */
export const dropInvalidFields = (draft, errors) => {
  const invalidKeys = new Set(errors.map(error => error.split(':')[0].trim()));
  return Object.fromEntries(Object.entries(draft).filter(([key]) => !invalidKeys.has(key)));
};

/** Preset config values the create-vault form also copies when a preset is selected. */
const PRESET_CONFIG_FIELDS = [
  'tokensForAcquires',
  'acquireReserve',
  'liquidityPoolContribution',
  'creationThreshold',
  'cosigningThreshold',
  'executionThreshold',
];

export const applyPresetToDraft = (vault, presets) => {
  const preset = presets.find(item => item?.id?.toString() === vault.preset_id?.toString());
  if (!preset) return vault;

  const config = preset.config || {};
  const next = { ...vault, preset: preset.type || 'advanced' };

  PRESET_CONFIG_FIELDS.forEach(field => {
    if (next[field] === null || next[field] === undefined) {
      next[field] = config[field] ?? next[field];
    }
  });

  if (preset.type?.toLowerCase() === 'acquire_only') {
    next.isAcquireOnly = true;
  }

  return next;
};

/** Keep the combinations the form itself enforces so the handoff lands on a valid draft. */
export const enforceVaultCoherence = vault => {
  const next = { ...vault };

  if (next.isAcquireOnly) {
    next.tokensForAcquires = 100;
  }
  if (Number(next.tokensForAcquires) === 0) {
    next.liquidityPoolContribution = 0;
  }
  if (next.privacy !== 'private') {
    next.valueMethod = 'lbe';
  }

  return next;
};

export const buildVaultFromAiDraft = (previousVault, aiDraft, presets) => {
  const merged = { ...(previousVault ?? initialVaultState), ...aiDraft };
  return enforceVaultCoherence(applyPresetToDraft(merged, presets));
};
