import { useCallback, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import type { Hash } from 'viem';

import { useEvmTx, waitForSuccess } from '@/hooks/useEvmTx';
import { VaultsApiProvider } from '@/services/api/vaults';
import { vaultFactoryAbiFor } from '@/lib/evm/vaultFactory.abi';
import { robinhoodChain } from '@/lib/evm/wagmi.config';

/**
 * Two-step EVM vault creation:
 *  1. POST /vaults  (chainType=robinhood) → get admin EIP-712 signature + VaultConfig
 *  2. writeContract(VaultFactory.createVault) → creator pays gas, tx submitted on-chain
 *  3. POST /vaults/publish (chainType=robinhood, txHash) right after sending
 *  4. Wait for the receipt (the backend confirms it independently)
 */
export const useCreateEvmVault = () => {
  const { ensureChain, simulateAndWrite } = useEvmTx();

  const [isPreparing, setIsPreparing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState<Hash | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const { isLoading: isWaitingReceipt, isSuccess: receiptSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: robinhoodChain.id,
  });

  /**
   * @param {object} vaultData — the same vaultData object used for Cardano creation,
   *                             augmented with chainType: 'robinhood'
   * @returns {Promise<{ dbVaultId: string, onChainTxHash: string }>}
   */
  const createEvmVault = useCallback(
    // The create-vault form payload; forwarded to the API as-is.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (vaultData: Record<string, any>): Promise<{ dbVaultId: string; onChainTxHash: Hash }> => {
      setError(null);
      setTxHash(undefined);

      // ── Step 1: backend signs the EIP-712 authorization ──────────────────
      setIsPreparing(true);
      let prepareRes;
      try {
        const { data } = await VaultsApiProvider.createVault({
          ...vaultData,
          chainType: 'robinhood',
        });
        prepareRes = data;
      } finally {
        setIsPreparing(false);
      }

      const {
        vaultId: dbVaultId,
        transactionId,
        evmVaultConfig: cfg,
        adminNonce,
        deadline,
        adminSignature,
        evmFactoryAddress,
        // 13 for a V13 factory: its VaultConfig carries the vault's economics.
        evmConfigVersion,
      } = prepareRes;

      // The signature is only valid on the factory it was issued for, so the address comes with it.
      if (!cfg || !adminSignature || !evmFactoryAddress) {
        throw new Error('Backend did not return EVM vault config, signature or factory address');
      }

      // bigint conversion — values come as strings from JSON
      const cfgForContract = normalizeBigInts(cfg);

      // ── Step 2: ensure wallet is on the correct chain, then submit ───────
      await ensureChain();

      // Simulated first: an expired deadline / bad signature fails here, before the wallet opens.
      const hash = await simulateAndWrite({
        address: evmFactoryAddress,
        abi: vaultFactoryAbiFor(evmConfigVersion),
        functionName: 'createVault',
        args: [cfgForContract, BigInt(adminNonce), BigInt(deadline), adminSignature],
      });

      setTxHash(hash);

      // ── Step 3: hand the hash to the backend right away ──────────────────
      // Sent before the receipt on purpose: the backend reads the receipt itself
      // (inline poll, webhook, stuck-tx cron) and only takes the contract address
      // from a successful VaultCreated, while a tab closed during the wait would
      // otherwise leave a vault on-chain that the backend never hears about.
      setIsConfirming(true);
      try {
        await VaultsApiProvider.launchVault({
          vaultId: dbVaultId,
          txId: transactionId,
          txHash: hash,
          chainType: 'robinhood',
        });
      } finally {
        setIsConfirming(false);
      }

      // ── Step 4: wait for the receipt, so a revert is reported to the user ─
      await waitForSuccess(hash, robinhoodChain.id);

      return { dbVaultId, onChainTxHash: hash };
    },
    [ensureChain, simulateAndWrite]
  );

  return {
    createEvmVault,
    isPreparing,
    isWaitingReceipt,
    isConfirming,
    isPending: isPreparing || isWaitingReceipt || isConfirming,
    txHash,
    receiptSuccess,
    error,
  };
};

// ---------------------------------------------------------------------------
// Helper — recursively convert numeric strings and numbers to bigint for
// fields the contract ABI declares as uint256 / uint64 etc.
// Only converts values that look like integers in bigint-typed positions.
// ---------------------------------------------------------------------------
type BigIntified = bigint | string | boolean | null | undefined | BigIntified[] | { [k: string]: BigIntified };

function normalizeBigInts(obj: unknown): BigIntified {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeBigInts);
  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, normalizeBigInts(v)]));
  }
  // Convert string or number representations of integers to bigint
  if (typeof obj === 'string' && /^\d+$/.test(obj)) return BigInt(obj);
  if (typeof obj === 'number' && Number.isInteger(obj)) return BigInt(obj);
  return obj as BigIntified;
}
