import { useEffect } from 'react';

import {
  DEFAULT_INDEX_MAX_ASSETS,
  getNewVaultBasketCap,
  setNewVaultBasketCap,
} from '@/components/vaults/index/indexVault.utils';
import { useVaultCreationFlags } from '@/services/api/queries';

/**
 * Most ERC-20s a NEW Robinhood vault may hold (index basket / asset whitelist). It follows the
 * current factory's termination cap, so it comes from the API; 15 until that answers.
 * Also stores it for validators that run outside React (`validateIndexBasket`).
 */
export const useNewVaultBasketCap = () => {
  const { data } = useVaultCreationFlags();
  const cap = data?.data?.evm_max_basket_assets;
  useEffect(() => setNewVaultBasketCap(cap), [cap]);
  return Number.isInteger(cap) && cap > 0 ? cap : getNewVaultBasketCap();
};

/** Basket cap of an existing vault (its own contract version), else the new-vault cap. */
export const useVaultBasketCap = vault => {
  const newVaultCap = useNewVaultBasketCap();
  const own = vault?.maxBasketAssets;
  return Number.isInteger(own) && own > 0 ? own : vault ? DEFAULT_INDEX_MAX_ASSETS : newVaultCap;
};
