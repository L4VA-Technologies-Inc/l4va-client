import { initialVaultState, vaultSchema } from '@/components/vaults/constants/vaults.constants';

export const AI_VAULT_STORAGE_META_KEY = 'storageVaultAiMeta';
export const AI_VAULT_CHAT_SESSION_KEY = 'aiVaultChat';

/**
 * The vault draft is shared between the manual create form and the AI chat: both read and write
 * this one key so an edit in either place is visible in the other on the next mount. The AI chat
 * keeps only its transcript (messages/status/aiFields) in its own session snapshot.
 */
export const VAULT_DRAFT_STORAGE_KEY = 'storageVault';

export const readStoredVaultDraft = () => {
  try {
    const stored = localStorage.getItem(VAULT_DRAFT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const writeStoredVaultDraft = vault => {
  try {
    localStorage.setItem(VAULT_DRAFT_STORAGE_KEY, JSON.stringify(vault));
  } catch {
    // Best-effort: a full/unavailable localStorage should not break the flow.
  }
};

export const clearStoredVaultDraft = () => {
  try {
    localStorage.removeItem(VAULT_DRAFT_STORAGE_KEY);
  } catch {
    // Best-effort.
  }
};

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

/**
 * Fields of the merged vault that are still missing or invalid, according to the live form schema.
 *
 * The assistant also reports what it thinks is missing, but that is its view of its own draft one
 * turn ago — it goes stale as soon as a value is set, and it never sees fields it cannot edit. The
 * schema is the same validator the manual form and launch use, so it is always consistent with the
 * vault actually on screen.
 */
export const collectIncompleteFields = async vault => {
  try {
    await vaultSchema.validate(vault, { abortEarly: false });
    return [];
  } catch (err) {
    const paths = (err?.inner ?? []).map(issue => issue.path).filter(Boolean);
    return [...new Set(paths)];
  }
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
