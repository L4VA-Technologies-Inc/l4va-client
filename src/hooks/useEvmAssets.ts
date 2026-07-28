import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

import { fetchTokenMetadata, fetchWalletTokens, searchTokens, type BlockscoutWalletToken } from '@/lib/evm/blockscout';
import type { GroupedPolicy } from '@/hooks/useAssets';

const isNftType = (type: string): boolean => type === 'ERC-721' || type === 'ERC-1155';

const toGroupedPolicy = (token: BlockscoutWalletToken, count: number): GroupedPolicy => ({
  policyId: token.address.toLowerCase(),
  name: token.symbol || token.name || '',
  assetName: token.symbol || token.name || '',
  count,
  collectionName: token.name || token.symbol || null,
  isVerified: token.isVerified,
  verificationPlatform: null,
  isLpToken: false,
});

const heldTokenCount = (token: BlockscoutWalletToken): number => {
  try {
    return isNftType(token.type)
      ? Math.max(1, Number(token.value))
      : Math.max(1, Math.floor(Number(formatUnits(BigInt(token.value), token.decimals ?? 18))));
  } catch {
    return 1;
  }
};

/**
 * EVM counterpart to {@link useAssets}. Enumerates the connected wallet's tokens
 * via the Blockscout explorer (the wallet address comes from wagmi `useAccount`)
 * and exposes them through the SAME shape `useAssets` returns, so
 * `LavaWhitelistWithCaps` can consume either transparently.
 *
 * The EVM `policyId` is the token contract address. Verification comes from
 * Blockscout's own reputation signal rather than an on-chain marketplace, since
 * no such registry exists for Robinhood Chain.
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

  // Chain-wide token list (not scoped to the wallet) so creators can whitelist
  // popular/verified assets they don't personally hold — mirrors what a wallet
  // holds with what's actually indexed on the chain, same as `getCollectionNames`
  // does for Cardano policies.
  const { data: chainTokens, isLoading: isLoadingChainTokens } = useQuery({
    queryKey: ['evm-chain-tokens'],
    queryFn: () => searchTokens(''),
    enabled: isConnected,
    staleTime: 1000 * 60 * 5,
  });

  const heldPolicies = useMemo<GroupedPolicy[]>(() => {
    if (!tokens) return [];

    // Blockscout returns one row per token contract, but dedupe defensively.
    const byAddress = new Map<string, GroupedPolicy>();
    tokens.forEach(token => {
      const policyId = token.address.toLowerCase();
      if (!byAddress.has(policyId)) {
        byAddress.set(policyId, toGroupedPolicy(token, heldTokenCount(token)));
      }
    });
    return Array.from(byAddress.values());
  }, [tokens]);

  // Browse list: held tokens (with real balances) plus chain-wide tokens the
  // wallet doesn't hold (count 0, still selectable for the whitelist).
  const browsePolicies = useMemo<GroupedPolicy[]>(() => {
    const byAddress = new Map<string, GroupedPolicy>(heldPolicies.map(p => [p.policyId, p]));
    (chainTokens || []).forEach(token => {
      const policyId = token.address.toLowerCase();
      if (!byAddress.has(policyId)) {
        byAddress.set(policyId, toGroupedPolicy(token, 0));
      }
    });
    return Array.from(byAddress.values());
  }, [heldPolicies, chainTokens]);

  const searchPolicies = useCallback(
    async (query: string): Promise<GroupedPolicy[]> => {
      if (!query) return [];
      const search = query.toLowerCase();
      const localMatches = browsePolicies.filter(
        p =>
          p.policyId.toLowerCase().includes(search) ||
          p.assetName.toLowerCase().includes(search) ||
          Boolean(p.collectionName && p.collectionName.toLowerCase().includes(search))
      );

      // Also search chain-wide, in case the query matches a token neither held
      // nor already present in the default chain-tokens listing.
      const byAddress = new Map(localMatches.map(p => [p.policyId, p]));
      try {
        const remoteMatches = await searchTokens(query);
        remoteMatches.forEach(token => {
          const policyId = token.address.toLowerCase();
          if (!byAddress.has(policyId)) {
            byAddress.set(policyId, toGroupedPolicy(token, 0));
          }
        });
      } catch (error) {
        console.error('Error searching chain-wide tokens:', error);
      }

      return Array.from(byAddress.values());
    },
    [browsePolicies]
  );

  // Unknown contract addresses (pasted manually) resolve to their real
  // verification status so they can still be whitelisted even when absent from
  // the wallet's holdings and the default chain-tokens listing.
  const lookupPolicies = useCallback(
    async (policyIds: string[]): Promise<GroupedPolicy[]> =>
      Promise.all(
        policyIds.map(async id => {
          const match = browsePolicies.find(p => p.policyId.toLowerCase() === id.toLowerCase());
          if (match) return match;

          const metadata = await fetchTokenMetadata(id);
          if (metadata) return toGroupedPolicy(metadata, 0);

          return {
            policyId: id,
            name: '',
            assetName: '',
            count: 1,
            collectionName: null,
            isVerified: false,
            verificationPlatform: null,
            isLpToken: false,
          };
        })
      ),
    [browsePolicies]
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
    data: { data: browsePolicies },
    assets: [],
    allPolicies: browsePolicies,
    isBalanceLoaded: !isLoading,
    isLoading: isLoading || isFetching || isLoadingChainTokens,
    // Blockscout pagination is fully resolved in the query, so there is nothing
    // left to lazily page through in the dropdown.
    hasMore: false,
    isLoadingMore: false,
    loadMore: () => {},
    searchPolicies,
    lookupPolicies,
  };
};
