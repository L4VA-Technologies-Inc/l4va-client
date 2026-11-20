import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import type { Address, Hash } from 'viem';

import { useEvmGovernanceFee } from '@/hooks/useEvmGovernanceFee';
import {
  normalizeAuthorization,
  type PreparedContributionCall,
  showEvmTxError,
  useEvmTx,
  waitForSuccess,
} from '@/hooks/useEvmTx';
import { CoreApiProvider } from '@/services/api/core';
import { useCreateAcquireTx } from '@/services/api/queries';
import { VAULT_CONTRIBUTION_ABI } from '@/lib/evm/vault.abi';

/**
 * EVM (Robinhood) acquire flow.
 *
 * On the V3 Solidity vault there is no separate `acquire` function — acquiring
 * is `contributeNative(auth, sig)` called during the AcquireWindow. So this
 * hook is a thin specialisation of `useEvmContributeTransaction` for a single
 * Native asset:
 *
 *  1. POST /acquire/:vaultId → creates the DB Transaction (type=acquire).
 *  2. POST /blockchain/evm/contribution/prepare → pays the protocol fee first
 *     if the backend returns `feePayment`, then backend signs one
 *     ContributionAuthorization (kind=Native).
 *  3. `contributeNative(auth, sig)` on the vault with `value = <wei>`.
 *  4. POST /blockchain/evm/contribution/confirm.
 */
type EvmTxStatus = 'idle' | 'building' | 'signing' | 'submitting';

export const useEvmAcquireTransaction = () => {
  const [status, setStatus] = useState<EvmTxStatus>('idle');
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { account: contributor, ensureChain, simulateAndWrite } = useEvmTx();
  const createAcquireTx = useCreateAcquireTx();
  const { payFee } = useEvmGovernanceFee();

  const sendTransaction = useCallback(
    async ({ vaultId, amountWei }: { vaultId: string; amountWei: string }): Promise<Hash | null> => {
      setError(null);
      setTxHash(null);

      if (!contributor) {
        const msg = 'Wallet not connected';
        setError(msg);
        toast.error(msg);
        return null;
      }

      try {
        setStatus('building');

        // ── Step 1: create the DB Transaction row (type=acquire) ────────────
        const { data: created } = await createAcquireTx.mutateAsync({
          vaultId,
          assets: [
            {
              assetName: 'eth',
              policyId: '0x0000000000000000000000000000000000000000',
              type: 'eth',
              quantity: amountWei, // Send as string to preserve precision for large wei values
              metadata: { rawWei: true },
            },
          ],
        });
        const createdTxId = created.txId;

        // ── Step 2: fetch the signed Native authorization ───────────────────
        // A due protocol fee comes back as `feePayment` with no calls; pay it,
        // then ask again with the fee tx hash.
        let { data: prepared } = await CoreApiProvider.prepareEvmContribution({ txId: createdTxId });
        if (prepared.feePayment) {
          setStatus('signing');
          const feeTxHash = await payFee(prepared.feePayment, contributor);
          setStatus('building');
          ({ data: prepared } = await CoreApiProvider.prepareEvmContribution({ txId: createdTxId, feeTxHash }));
        }
        const { vaultAddress, calls } = prepared as { vaultAddress: Address; calls: PreparedContributionCall[] };

        if (!Array.isArray(calls) || calls.length !== 1) {
          throw new Error('Expected exactly one Native contribution call from the backend');
        }
        const call = calls[0];
        if (call.functionName !== 'contributeNative') {
          throw new Error(`Unexpected function ${call.functionName} — expected contributeNative`);
        }

        // ── Step 3: ensure wallet is on the correct chain ───────────────────
        await ensureChain();

        // ── Step 4: contributeNative with value = <wei> ─────────────────────
        setStatus('signing');
        const authorization = normalizeAuthorization(call.authorization);

        // Frontend already converted ETH → wei; the signed authorization
        // carries the exact wei amount we must forward as `value`.
        // Use call.value from backend or the wei amount we sent.
        const value = call.value ? BigInt(call.value) : BigInt(amountWei);

        const hash = await simulateAndWrite({
          address: vaultAddress,
          abi: VAULT_CONTRIBUTION_ABI,
          functionName: 'contributeNative',
          args: [authorization, call.signature] as const,
          value,
        });

        setStatus('submitting');
        await waitForSuccess(hash);

        // ── Step 5: confirm with backend ────────────────────────────────────
        await CoreApiProvider.confirmEvmContribution({
          txId: createdTxId,
          txHash: hash,
          childTxHashes: [hash],
        });

        setTxHash(hash);
        toast.success('Acquisition submitted successfully');
        setStatus('idle');
        return hash;
      } catch (err) {
        const errorMessage = showEvmTxError(err, 'Acquisition failed');
        setError(errorMessage);
        setStatus('idle');
        return null;
      }
    },
    [contributor, ensureChain, simulateAndWrite, createAcquireTx, payFee]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setTxHash(null);
    setError(null);
  }, []);

  return {
    status,
    txHash,
    error,
    sendTransaction,
    reset,
    isProcessing: ['building', 'signing', 'submitting'].includes(status),
  };
};
