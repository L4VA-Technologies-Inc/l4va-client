import { formatUnits } from 'viem';

/** Mirrors `VaultArchetype` in l4va-api `src/types/index-vault.types.ts`. */
export const VAULT_ARCHETYPES = {
  STANDARD: 'standard',
  INDEX_WEIGHTED: 'index_weighted',
};

export const BPS = 10000;
/** Backend cap — every bought asset permanently takes one of the vault's 16 termination slots. */
export const INDEX_MAX_ASSETS = 10;
export const INDEX_MIN_WEIGHT_BPS = 100;
export const INDEX_DEFAULT_RESERVE_BPS = 1000;
export const INDEX_MAX_RESERVE_BPS = 5000;

export const VAULT_ARCHETYPE_OPTIONS = [
  { name: VAULT_ARCHETYPES.STANDARD, label: 'Standard Vault' },
  { name: VAULT_ARCHETYPES.INDEX_WEIGHTED, label: 'Index Weighted Vault' },
];

export const VAULT_ARCHETYPE_HINT = `Standard Vault: Contributors and acquirers fund the vault under the selected preset.\n
Index Weighted Vault: Acquirers send ETH. When the acquire window locks, the vault buys a basket of tokens at the target weights you set. Vault token holders can change the weights later through a governance proposal, and the vault trades to the new weights automatically.`;

export const VAULT_ARCHETYPE_META = {
  [VAULT_ARCHETYPES.INDEX_WEIGHTED]: {
    label: 'Index Weighted Vault',
    shortLabel: 'Index',
    description: 'Percentage weights, actively managed by governance',
  },
};

export const isIndexVault = vault => vault?.vaultArchetype === VAULT_ARCHETYPES.INDEX_WEIGHTED;

export const emptyIndexBasket = () => ({ targets: [], reserveBps: INDEX_DEFAULT_RESERVE_BPS });

export const bpsToPercent = bps => Number(bps || 0) / 100;

export const percentToBps = percent => Math.round(Number(percent || 0) * 100);

export const formatBps = (bps, digits = 1) => `${bpsToPercent(bps).toFixed(digits).replace(/\.0+$/, '')}%`;

export const totalWeightBps = targets => (targets || []).reduce((sum, t) => sum + Number(t.weightBps || 0), 0);

/**
 * Splits 100% across `count` assets in whole bps, handing the rounding
 * remainder to the first assets so the total is always exactly 10000.
 */
export const evenWeights = count => {
  if (count <= 0) return [];
  const base = Math.floor(BPS / count);
  const remainder = BPS - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
};

/** Returns a user-facing problem with the basket, or null when it can launch. */
export const validateIndexBasket = basket => {
  const targets = basket?.targets || [];
  if (targets.length === 0) return 'Add at least one asset to the basket';
  if (targets.length > INDEX_MAX_ASSETS) return `The basket can hold at most ${INDEX_MAX_ASSETS} assets`;
  if (targets.some(t => !/^0x[0-9a-fA-F]{40}$/.test(t.assetAddress || ''))) {
    return 'Every basket asset needs a valid token address';
  }
  const addresses = targets.map(t => t.assetAddress.toLowerCase());
  if (new Set(addresses).size !== addresses.length) return 'The same asset appears twice in the basket';
  if (targets.some(t => Number(t.weightBps) < INDEX_MIN_WEIGHT_BPS)) {
    return `Every asset needs a weight of at least ${formatBps(INDEX_MIN_WEIGHT_BPS)}`;
  }
  const total = totalWeightBps(targets);
  if (total !== BPS) return `Weights must add up to 100% (currently ${formatBps(total, 2)})`;
  const reserve = Number(basket?.reserveBps ?? 0);
  if (reserve < 0 || reserve > INDEX_MAX_RESERVE_BPS) return 'The cash reserve must be between 0% and 50%';
  return null;
};

/**
 * Index vaults are acquire-only, so the whitelist never gates contributions.
 * It is still sent (derived from the basket) so the vault record lists the
 * tokens it will hold. Item shape matches `createEmptyWhitelistAsset`, which is
 * not imported because vaults.constants imports this module.
 */
export const basketToAssetsWhitelist = basket =>
  (basket?.targets || []).map(t => ({
    assetName: '',
    count: 1,
    policyName: 'N/A',
    isVerified: null,
    verificationPlatform: null,
    valuationMethod: 'market',
    customPriceAda: null,
    // No contribution minimum: the vault buys these after lock, nobody contributes them.
    countCapMin: 0,
    countCapMax: 1000,
    policyId: t.assetAddress,
    name: t.symbol || '',
    collectionName: t.name || t.symbol || null,
    imageUrl: t.image || null,
    image: t.image || null,
    uniqueId: t.assetAddress,
  }));

/** Payload shape expected by the API (`IndexBasketReq`). */
export const toIndexBasketPayload = basket => ({
  reserveBps: Number(basket?.reserveBps ?? 0),
  targets: (basket?.targets || []).map(t => ({
    assetAddress: t.assetAddress,
    weightBps: Number(t.weightBps),
    ...(t.symbol ? { symbol: t.symbol } : {}),
    ...(t.name ? { name: t.name } : {}),
    ...(t.image ? { image: t.image } : {}),
  })),
});

export const formatNativeWei = (wei, maxDigits = 4) => {
  if (wei === null || wei === undefined) return '—';
  const value = Number(formatUnits(BigInt(wei), 18));
  return value.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
};

export const REBALANCE_TRIGGER_LABELS = {
  initial_buy: 'Initial basket buy',
  governance_reweight: 'Governance re-weight',
};

export const REBALANCE_STATUS_STYLES = {
  pending: 'text-dark-100',
  executing: 'text-yellow-400',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

// Categorical palette for basket segments; the reserve is always neutral steel.
const SEGMENT_COLORS = [
  '#F97316',
  '#38BDF8',
  '#A3E635',
  '#E879F9',
  '#FACC15',
  '#2DD4BF',
  '#FB7185',
  '#818CF8',
  '#F59E0B',
  '#34D399',
];

export const basketSegmentColor = index => SEGMENT_COLORS[index % SEGMENT_COLORS.length];
