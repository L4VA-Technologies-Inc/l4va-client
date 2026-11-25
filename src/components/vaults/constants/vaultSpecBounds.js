import { useEffect, useState } from 'react';

import { environments } from '@/constants/core.constants.js';
import { AiApiProvider } from '@/services/api/ai';
import { getNetwork } from '@/hooks/useNetwork';

/**
 * Numeric field bounds come from the API's vault creation spec
 * (`GET /api/v1/ai/vault-creation-spec`). The API resolves that spec once, with system
 * settings and their env overrides (MIN_CONTRIBUTION_DURATION_MS, ...) applied, and uses the
 * same resolved spec for the AI assistant and for createVault. Validating the form against it
 * keeps all three in sync: change a limit on the API and the form follows, no client release.
 *
 * FALLBACK_BOUNDS is only used until the spec loads (or if the request fails). It is a safety
 * net, not the source of truth; in dev a mismatch with the loaded spec is logged.
 */
const DAY_MS = 86400000;
const isMainnet = import.meta.env.VITE_CARDANO_NETWORK === environments.MAINNET;

/** Positive ms from an env var; null when unset. Only shapes the fallback now. */
const envDuration = value => {
  const ms = Number(value);
  return Number.isFinite(ms) && ms > 0 ? ms : null;
};

const durationFallbacks = {
  contributionDuration: {
    min: envDuration(import.meta.env.VITE_MIN_CONTRIBUTION_DURATION_MS) ?? (isMainnet ? 5 * DAY_MS : 600000),
    max: 30 * DAY_MS,
  },
  acquireWindowDuration: {
    min: envDuration(import.meta.env.VITE_MIN_ACQUIRE_WINDOW_DURATION_MS) ?? (isMainnet ? DAY_MS : 300000),
    max: 7 * DAY_MS,
  },
};

const FALLBACK_BOUNDS = {
  robinhood: {
    ...durationFallbacks,
    liquidityPoolContribution: { min: 5, max: 20, default: 10 },
    creationThreshold: { min: 0.1, max: 100, default: 0.1 },
    cosigningThreshold: { min: 33, max: 100 },
    executionThreshold: { min: 50.1, max: 100 },
    minAcquireThreshold: { min: 0.1, max: 1000, requiredIf: [{ field: 'isAcquireOnly', equals: true }] },
    allowAcquireExpansion: { default: true },
  },
  cardano: {
    ...durationFallbacks,
    liquidityPoolContribution: { min: 0, max: 100 },
    creationThreshold: { min: 0.5, max: 100 },
    cosigningThreshold: { min: 33, max: 100 },
    executionThreshold: { min: 50.1, max: 100 },
  },
};

const loadedSpecs = {};
const pending = {};

// This tab's chain. localStorage is shared across tabs, so a Cardano tab elsewhere must not
// switch a Robinhood draft here onto Cardano bounds.
const currentChain = () => (getNetwork() === 'cardano' ? 'cardano' : 'robinhood');

const specNetwork = () =>
  import.meta.env.VITE_CARDANO_NETWORK === environments.MAINNET ? environments.MAINNET : environments.PREPROD;

/** Fetches the spec for a chain once per page load; later calls reuse it. */
export const loadVaultSpec = (chain = currentChain()) => {
  if (loadedSpecs[chain]) return Promise.resolve(loadedSpecs[chain]);
  if (pending[chain]) return pending[chain];
  pending[chain] = AiApiProvider.getVaultCreationSpec({ chain, network: specNetwork() })
    .then(({ data }) => {
      if (data?.fields) {
        loadedSpecs[chain] = data;
        if (import.meta.env.DEV) warnOnFallbackDrift(chain, data);
      }
      return loadedSpecs[chain] ?? null;
    })
    .catch(() => null)
    .finally(() => {
      delete pending[chain];
    });
  return pending[chain];
};

/**
 * Loads the spec for the selected chain on mount and whenever the chain changes, and re-renders
 * the caller once it arrives so pickers and hints switch from the fallback to the real bounds.
 */
export const useVaultSpec = chain => {
  const [spec, setSpec] = useState(() => loadedSpecs[chain] ?? null);
  useEffect(() => {
    let active = true;
    loadVaultSpec(chain).then(loaded => {
      if (active) setSpec(loaded);
    });
    return () => {
      active = false;
    };
  }, [chain]);
  return spec;
};

/** Dev-only: flags a fallback that no longer matches the API, so it gets updated. */
const warnOnFallbackDrift = (chain, spec) => {
  Object.entries(FALLBACK_BOUNDS[chain] ?? {}).forEach(([field, fallback]) => {
    const live = spec.fields[field];
    if (!live) return;
    ['min', 'max', 'default'].forEach(key => {
      if (fallback[key] !== undefined && fallback[key] !== live[key]) {
        console.warn(
          `[vault-spec] ${chain}.${field}.${key}: fallback ${fallback[key]} != API ${live[key]}. ` +
            'The API value is used; update FALLBACK_BOUNDS in vaultSpecBounds.js.'
        );
      }
    });
  });
};

/**
 * The whole resolved field spec on the selected chain: API spec first, fallback until it loads.
 * Carries min/max/default, required/requiredIf, disabled (feature off on this chain), label and hint.
 */
export const getFieldSpec = (field, chain = currentChain()) =>
  loadedSpecs[chain]?.fields?.[field] ?? FALLBACK_BOUNDS[chain]?.[field] ?? {};

/** `{ min, max, default }` for a field on the selected chain: API spec first, fallback until it loads. */
export const getFieldBounds = (field, chain = currentChain()) => {
  const { min, max, default: fallbackDefault } = getFieldSpec(field, chain);
  return { min, max, default: fallbackDefault };
};

/** Feature switched off on this chain by the spec or by config: hide the field, keep its default. */
export const isFieldDisabled = (field, chain = currentChain()) => getFieldSpec(field, chain).disabled === true;

/** UI name and tooltip from the spec, so the form, the AI preview and the assistant use one text. */
export const getFieldLabel = (field, fallback, chain = currentChain()) => getFieldSpec(field, chain).label ?? fallback;
export const getFieldHint = (field, fallback, chain = currentChain()) => getFieldSpec(field, chain).hint ?? fallback;

/** Tooltip for a UI label, looked up by the label the spec gives a field. */
export const getHintForLabel = (label, chain = currentChain()) => {
  const fields = loadedSpecs[chain]?.fields;
  if (!fields) return undefined;
  const match = Object.values(fields).find(f => f.label === label && f.hint);
  return match?.hint;
};

/** Fields the spec makes required for these values only by a condition (requiredIf). */
export const conditionallyRequiredFields = (values = {}, chain = currentChain()) => {
  const fields = loadedSpecs[chain]?.fields ?? FALLBACK_BOUNDS[chain] ?? {};
  return Object.entries(fields)
    .filter(([, spec]) => spec.requiredIf?.length && !spec.disabled)
    .filter(([name]) => isFieldRequired(name, values, chain))
    .map(([name]) => name);
};

/**
 * Whether the spec makes a field required for these form values (`required` or every `requiredIf`
 * condition holds). The AI, createVault and this form read the same flag.
 */
export const isFieldRequired = (field, values = {}, chain = currentChain()) => {
  const spec = getFieldSpec(field, chain);
  if (spec.disabled) return false;
  if (spec.required === true) return true;
  return !!spec.requiredIf?.length && spec.requiredIf.every(c => values[c.field] === c.equals);
};

export const getFieldDefault = (field, fallbackValue) => {
  const value = getFieldBounds(field).default;
  return typeof value === 'number' || typeof value === 'boolean' ? value : fallbackValue;
};

/** Min/max of a field on the selected chain, for pickers: `fieldMin('acquireWindowDuration')`. */
export const fieldMin = field => getFieldBounds(field).min;
export const fieldMax = field => getFieldBounds(field).max;

const formatBound = (value, unit) => {
  if (unit === 'ms') {
    if (value % DAY_MS === 0) return `${value / DAY_MS} day${value === DAY_MS ? '' : 's'}`;
    if (value % 3600000 === 0) return `${value / 3600000} hours`;
    return `${Math.round(value / 60000)} minutes`;
  }
  if (unit === '%') return `${value}%`;
  return unit ? `${value.toLocaleString('en-US')} ${unit}` : String(value);
};

/**
 * yup test enforcing the spec's min/max for a field. Usage:
 *   yup.number().test(specBoundsTest('liquidityPoolContribution', 'Liquidity pool contribution', '%'))
 */
export const specBoundsTest = (field, label, { unit = '%', skipIf } = {}) => ({
  name: `spec-bounds-${field}`,
  test(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return true;
    if (skipIf?.(this.parent)) return true;
    const { min, max } = getFieldBounds(field);
    const hasMin = typeof min === 'number';
    const hasMax = typeof max === 'number';
    if ((!hasMin || value >= min) && (!hasMax || value <= max)) return true;
    const message =
      hasMin && hasMax
        ? `${label} must be between ${formatBound(min, unit)} and ${formatBound(max, unit)}`
        : hasMin
          ? `${label} must be at least ${formatBound(min, unit)}`
          : `${label} cannot exceed ${formatBound(max, unit)}`;
    return this.createError({ message });
  },
});
