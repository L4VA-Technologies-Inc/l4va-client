import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { CoreApiProvider } from '@/services/api/core';
import { useCreateAcquireTx } from '@/services/api/queries';
import { VAULT_CONTRIBUTION_ABI } from '@/lib/evm/vault.abi';
import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';

const normalizeAuthorization = auth => ({
  cycleId: BigInt(auth.cycleId),
  contributor: auth.contributor,
  kind: Number(auth.kind),
  asset: auth.asset,
  tokenId: BigInt(auth.tokenId),
  amount: BigInt(auth.amount),
  nonce: BigInt(auth.nonce),
  deadline: BigInt(auth.deadline),
});

/**
 * EVM (Robinhood) acquire flow.
 *
 * On the V3 Solidity vault there is no separate `acquire` function — acquiring
 * is `contributeNative(auth, sig)` called during the AcquireWindow. So this
 * hook is a thin specialisation of `useEvmContributeTransaction` for a single
 * Native asset:
 *
 *  1. POST /acquire/:vaultId → creates the DB Transaction (type=acquire).
 *  2. POST /blockchain/evm/contribution/prepare → backend signs one
 *     ContributionAuthorization (kind=Native).
 *  3. `contributeNative(auth, sig)` on the vault with `value = <wei>`.
 *  4. POST /blockchain/evm/contribution/confirm.
 */
export const useEvmAcquireTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const { address: contributor, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const createAcquireTx = useCreateAcquireTx();

  const sendTransaction = useCallback(
    async ({ vaultId, amountWei }) => {
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
        const { data: prepared } = await CoreApiProvider.prepareEvmContribution({ txId: createdTxId });
        const { vaultAddress, calls } = prepared;

        if (!Array.isArray(calls) || calls.length !== 1) {
          throw new Error('Expected exactly one Native contribution call from the backend');
        }
        const call = calls[0];
        if (call.functionName !== 'contributeNative') {
          throw new Error(`Unexpected function ${call.functionName} — expected contributeNative`);
        }

        // ── Step 3: ensure wallet is on the correct chain ───────────────────
        if (currentChainId !== robinhoodChain.id) {
          await switchChainAsync({ chainId: robinhoodChain.id });
        }

        // ── Step 4: contributeNative with value = <wei> ─────────────────────
        setStatus('signing');
        const authorization = normalizeAuthorization(call.authorization);

        // Frontend already converted ETH → wei; the signed authorization
        // carries the exact wei amount we must forward as `value`.
        // Use call.value from backend or the wei amount we sent.
        const value = call.value ? BigInt(call.value) : BigInt(amountWei);

        const hash = await writeContractAsync({
          address: vaultAddress,
          abi: VAULT_CONTRIBUTION_ABI,
          functionName: 'contributeNative',
          args: [authorization, call.signature],
          account: contributor,
          chainId: robinhoodChain.id,
          value,
        });

        setStatus('submitting');
        await waitForTransactionReceipt(wagmiConfig, {
          hash,
          chainId: robinhoodChain.id,
        });

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
        const errorMessage = err?.response?.data?.message || err?.shortMessage || err?.message || 'Acquisition failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px]', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [contributor, currentChainId, switchChainAsync, writeContractAsync, createAcquireTx]
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
