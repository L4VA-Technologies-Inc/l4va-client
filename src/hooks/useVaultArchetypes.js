import { useMemo } from 'react';

import { VAULT_ARCHETYPES } from '@/components/vaults/index/indexVault.utils';
import { useNetwork } from '@/hooks/useNetwork';
import { useVaultCreationFlags } from '@/services/api/queries';

/**
 * Mirrors `vault_archetypes_enabled` in the backend's system settings. Used
 * until the flags load and if the request fails, so the flows never offer a
 * vault type the create endpoint would reject.
 */
const FALLBACK_ARCHETYPES = {
  cardano: [VAULT_ARCHETYPES.STANDARD],
  robinhood: [VAULT_ARCHETYPES.INDEX_WEIGHTED],
};

/**
 * Which vault types the active chain currently offers.
 *
 * Robinhood is index-only for now, so there is nothing to choose there and the
 * vault-type control is not rendered at all; the backend decides, and reopening
 * a chain is a settings change rather than a release.
 */
export const useVaultArchetypes = () => {
  const { isRobinHood } = useNetwork();
  const { data, isLoading } = useVaultCreationFlags();

  const chain = isRobinHood ? 'robinhood' : 'cardano';
  const configured = data?.data?.vault_archetypes_enabled?.[chain];

  return useMemo(() => {
    const available = Array.isArray(configured) && configured.length > 0 ? configured : FALLBACK_ARCHETYPES[chain];
    return {
      available,
      /** The type a new vault starts as — the only one, when the chain offers one. */
      defaultArchetype: available[0],
      /** False when the chain offers a single type, so the form asks nothing. */
      hasChoice: available.length > 1,
      isArchetypeAvailable: archetype => available.includes(archetype),
      isLoading,
    };
  }, [configured, chain, isLoading]);
};
