import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { showEvmTxError, useEvmTx, waitForSuccess } from '@/hooks/useEvmTx';
import { useAuth } from '@/lib/auth/auth';
import { CoreApiProvider } from '@/services/api/core';

// Contributor-only on the vault: takes an Active contribution back while its window is still open.
const CANCEL_CONTRIBUTION_ABI = [
  {
    type: 'function',
    name: 'cancelContribution',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'contributionId', type: 'uint256' }],
    outputs: [],
  },
];

const WITHDRAWABLE_STATUSES = ['contribution', 'acquire'];

/**
 * Robinhood: the signed-in wallet's contributions / acquires it can still take back on this vault,
 * keyed by asset row id so asset tables can put a Withdraw button on the caller's own rows.
 * The API lists only what the contract accepts (cycle Active, window open); `withdraw` calls
 * `cancelContribution` from the wallet and the API marks the row refunded from the event.
 */
export const useEvmSelfCancel = vault => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { account, ensureChain, simulateAndWrite } = useEvmTx();
  const [pendingId, setPendingId] = useState(null);

  const enabled =
    vault?.chainType === 'robinhood' &&
    WITHDRAWABLE_STATUSES.includes(vault?.vaultStatus) &&
    Boolean(isAuthenticated && account && vault?.id);

  const queryKey = useMemo(() => ['evm-my-contributions', vault?.id, account], [vault?.id, account]);
  const { data } = useQuery({
    queryKey,
    queryFn: () => CoreApiProvider.getMyEvmContributions(vault.id).then(res => res.data),
    enabled,
    refetchInterval: 30000,
  });

  const byAssetId = useMemo(() => {
    const map = new Map();
    if (!enabled) return map;
    (data?.contributions ?? []).forEach(c => {
      if (c.assetId) map.set(c.assetId, c);
    });
    return map;
  }, [data, enabled]);

  const withdraw = useCallback(
    async contribution => {
      if (pendingId || !data?.vaultAddress) return;
      setPendingId(contribution.contributionId);
      try {
        await ensureChain(data.chainId);
        const hash = await simulateAndWrite({
          address: data.vaultAddress,
          abi: CANCEL_CONTRIBUTION_ABI,
          functionName: 'cancelContribution',
          args: [BigInt(contribution.contributionId)],
        });
        await waitForSuccess(hash, data.chainId);
        toast.success('Withdrawn: the funds are back in your wallet');
        // Drop it right away; the API marks it refunded once it sees the on-chain event.
        queryClient.setQueryData(queryKey, prev =>
          prev
            ? {
                ...prev,
                contributions: prev.contributions.filter(c => c.contributionId !== contribution.contributionId),
              }
            : prev
        );
        setTimeout(() => queryClient.invalidateQueries(), 5000);
      } catch (error) {
        showEvmTxError(error, 'Withdrawal failed');
      } finally {
        setPendingId(null);
      }
    },
    [pendingId, data, ensureChain, simulateAndWrite, queryClient, queryKey]
  );

  return { byAssetId, withdraw, pendingId };
};
