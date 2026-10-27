import { useWallet } from '@ada-anvil/weld/react';
import { useAccount } from 'wagmi';

import { useAssets } from '@/hooks/useAssets';
import { useEvmAssets } from '@/hooks/useEvmAssets';
import { useNetwork } from '@/hooks/useNetwork';

/**
 * The wallet/chain asset source behind the input: the connected wallet's
 * holdings plus whatever the chain indexes, with search and address lookup.
 *
 * Both hooks are called unconditionally (rules of hooks) and the inactive one
 * returns an empty stub, so only the active chain's wallet is queried. Each
 * call owns its own paging state and fires its own requests, so a screen with
 * many inputs resolves the source ONCE and hands it to every input.
 */
export const useAssetSource = () => {
  const { isRobinHood } = useNetwork();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'changeAddressBech32');
  const { isConnected: isEvmConnected } = useAccount();

  const cardanoAssets = useAssets();
  const evmAssets = useEvmAssets();
  const { data, hasMore, isLoadingMore, loadMore, searchPolicies, lookupPolicies } = isRobinHood
    ? evmAssets
    : cardanoAssets;

  return {
    isRobinHood,
    isWalletConnected: isRobinHood ? isEvmConnected : wallet.isConnected,
    policies: data?.data || [],
    hasMore,
    isLoadingMore,
    loadMore,
    searchPolicies,
    lookupPolicies,
  };
};
