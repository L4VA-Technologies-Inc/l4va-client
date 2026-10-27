import { hasNoAcquirePhase } from '@/components/vaults/constants/vaults.constants';
import {
  VAULT_ARCHETYPES,
  basketToAssetsWhitelist,
  toIndexBasketPayload,
} from '@/components/vaults/index/indexVault.utils';

/** Robinhood refuses acquire thresholds below this (ETH). */
export const MIN_EVM_THRESHOLD_ETH = 0.01;

/**
 * Converts a USD reserve amount to the ETH the API stores, rounded to 1e-6 ETH.
 * Returns null for an empty or invalid amount.
 */
export const usdToEthThreshold = (usd, ethUsd) => {
  const amount = Number(String(usd ?? '').replace(',', '.'));
  if (!ethUsd || !Number.isFinite(amount) || amount <= 0) return null;
  return Math.round((amount / ethUsd) * 1e6) / 1e6;
};

export const formatVaultData = (vaultData, isRobinHood = false) => {
  const formattedData = { ...vaultData };
  // The USD figure is only what the creator typed; the API takes the ETH value.
  delete formattedData.minAcquireThresholdUsd;
  const isIndexVault = isRobinHood && formattedData.vaultArchetype === VAULT_ARCHETYPES.INDEX_WEIGHTED;

  // Index vaults are acquire-only with every token for acquirers — the API rejects
  // anything else, whatever preset the draft carried in.
  if (isIndexVault) {
    formattedData.isAcquireOnly = true;
    formattedData.tokensForAcquires = 100;
  }

  if (formattedData.socialLinks.length > 0) {
    // eslint-disable-next-line no-unused-vars
    formattedData.socialLinks = formattedData.socialLinks.map(({ id, ...rest }) => rest);
  }

  // Cardano sends minAcquireThreshold in lovelace; Robinhood (EVM) sends it in ETH as entered.
  if (formattedData.isAcquireOnly && formattedData.minAcquireThreshold != null) {
    formattedData.minAcquireThreshold = isRobinHood
      ? Number(formattedData.minAcquireThreshold)
      : Math.round(Number(formattedData.minAcquireThreshold) * 1000000);
  }

  if (hasNoAcquirePhase(formattedData.tokensForAcquires)) {
    formattedData.tokensForAcquires = 0;
    formattedData.acquireWindowDuration = null;
    formattedData.acquireOpenWindowTime = null;
  }

  if (isIndexVault) {
    formattedData.indexBasket = toIndexBasketPayload(formattedData.indexBasket);
    formattedData.assetsWhitelist = basketToAssetsWhitelist(formattedData.indexBasket);
  } else {
    formattedData.vaultArchetype = VAULT_ARCHETYPES.STANDARD;
    delete formattedData.indexBasket;
  }

  return formattedData;
};
