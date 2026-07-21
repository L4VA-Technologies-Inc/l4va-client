import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

import { fetchWalletTokens } from '@/lib/evm/blockscout';
import type { GroupedPolicy } from '@/hooks/useAssets';

const isNftType = (type: string): boolean => type === 'ERC-721' || type === 'ERC-1155';

/**
 * EVM counterpart to {@link useAssets}. Enumerates the connected wallet's tokens
 * via the Blockscout explorer (the wallet address comes from wagmi `useAccount`)
 * and exposes them through the SAME shape `useAssets` returns, so
 * `LavaWhitelistWithCaps` can consume either transparently.
 *
 * The EVM `policyId` is the token contract address, and every held asset is
 * treated as verified (there is no on-chain marketplace verification analogue).
 */
export const useEvmAssets = () => {
  const { address, isConnected } = useAccount();

  const {
    data: tokens,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['evm-wallet-tokens', address],
    queryFn: () => fetchWalletTokens(address as string),
    enabled: Boolean(address) && isConnected,
    staleTime: 1000 * 60, // 1 minute — wallet holdings change rarely mid-session
  });

  const heldPolicies = useMemo<GroupedPolicy[]>(() => {
    if (!tokens) return [];

    // Blockscout returns one row per token contract, but dedupe defensively.
    const byAddress = new Map<string, GroupedPolicy>();

    tokens.forEach(token => {
      const policyId = token.address.toLowerCase();
      if (byAddress.has(policyId)) return;

      const isNft = isNftType(token.type);
      let count = 1;
      try {
        count = isNft
          ? Math.max(1, Number(token.value))
          : Math.max(1, Math.floor(Number(formatUnits(BigInt(token.value), token.decimals ?? 18))));
      } catch {
        count = 1;
      }

      byAddress.set(policyId, {
        policyId,
        name: token.symbol || token.name || '',
        assetName: token.symbol || token.name || '',
        count,
        collectionName: token.name || token.symbol || null,
        isVerified: true,
        verificationPlatform: null,
        isLpToken: false,
      });
    });

    return Array.from(byAddress.values());
  }, [tokens]);

  const searchPolicies = useCallback(
    async (query: string): Promise<GroupedPolicy[]> => {
      if (!query) return [];
      const search = query.toLowerCase();
      return heldPolicies.filter(
        p =>
          p.policyId.toLowerCase().includes(search) ||
          p.assetName.toLowerCase().includes(search) ||
          Boolean(p.collectionName && p.collectionName.toLowerCase().includes(search))
      );
    },
    [heldPolicies]
  );

  // Unknown contract addresses (pasted manually) resolve to a verified stub so
  // they can still be whitelisted even when absent from the wallet's holdings.
  const lookupPolicies = useCallback(
    async (policyIds: string[]): Promise<GroupedPolicy[]> =>
      policyIds.map(id => {
        const match = heldPolicies.find(p => p.policyId.toLowerCase() === id.toLowerCase());
        return (
          match ?? {
            policyId: id,
            name: '',
            assetName: '',
            count: 1,
            collectionName: null,
            isVerified: true,
            verificationPlatform: null,
            isLpToken: false,
          }
        );
      }),
    [heldPolicies]
  );

  if (!isConnected) {
    return {
      data: { data: [] as GroupedPolicy[] },
      assets: [],
      allPolicies: [] as GroupedPolicy[],
      isBalanceLoaded: false,
      isLoading: false,
      hasMore: false,
      isLoadingMore: false,
      loadMore: () => {},
      searchPolicies: async () => [],
      lookupPolicies: async () => [],
    };
  }

  return {
    data: { data: heldPolicies },
    assets: [],
    allPolicies: heldPolicies,
    isBalanceLoaded: !isLoading,
    isLoading: isLoading || isFetching,
    // Blockscout pagination is fully resolved in the query, so there is nothing
    // left to lazily page through in the dropdown.
    hasMore: false,
    isLoadingMore: false,
    loadMore: () => {},
    searchPolicies,
    lookupPolicies,
  };
};
