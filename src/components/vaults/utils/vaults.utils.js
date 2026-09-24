import { hasNoAcquirePhase } from '@/components/vaults/constants/vaults.constants';
import {
  VAULT_ARCHETYPES,
  basketToAssetsWhitelist,
  toIndexBasketPayload,
} from '@/components/vaults/index/indexVault.utils';

export const formatVaultData = (vaultData, isRobinHood = false) => {
  const formattedData = { ...vaultData };

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

  if (isRobinHood && formattedData.vaultArchetype === VAULT_ARCHETYPES.INDEX_WEIGHTED) {
    formattedData.indexBasket = toIndexBasketPayload(formattedData.indexBasket);
    formattedData.assetsWhitelist = basketToAssetsWhitelist(formattedData.indexBasket);
  } else {
    formattedData.vaultArchetype = VAULT_ARCHETYPES.STANDARD;
    delete formattedData.indexBasket;
  }

  return formattedData;
};
