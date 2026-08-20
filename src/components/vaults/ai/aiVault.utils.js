import { initialVaultState, vaultSchema } from '@/components/vaults/constants/vaults.constants';

export const AI_VAULT_STORAGE_META_KEY = 'storageVaultAiMeta';
export const AI_VAULT_CHAT_SESSION_KEY = 'aiVaultChat';

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
