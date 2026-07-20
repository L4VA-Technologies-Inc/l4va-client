import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useSwitchChain } from 'wagmi';

import { VaultsApiProvider } from '@/services/api/vaults';
import { VAULT_FACTORY_ABI } from '@/lib/evm/vaultFactory.abi';
import { robinhoodChain } from '@/lib/evm/wagmi.config';

const FACTORY_ADDRESS = import.meta.env.VITE_EVM_VAULT_FACTORY_ADDRESS;

/**
 * Two-step EVM vault creation:
 *  1. POST /vaults  (chainType=robinhood) → get admin EIP-712 signature + VaultConfig
 *  2. writeContract(VaultFactory.createVault) → creator pays gas, tx submitted on-chain
 *  3. Wait for receipt
 *  4. POST /vaults/publish (chainType=robinhood, txHash) → backend marks vault published
 */
export const useCreateEvmVault = () => {
  const { address: creatorAddress, chainId: currentChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [isPreparing, setIsPreparing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

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
    async vaultData => {
      setError(null);
      setTxHash(null);

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

      const { vaultId: dbVaultId, evmVaultConfig: cfg, adminNonce, deadline, adminSignature } = prepareRes;

      if (!cfg || !adminSignature) {
        throw new Error('Backend did not return EVM vault config or signature');
      }

      // bigint conversion — values come as strings from JSON
      const cfgForContract = normalizeBigInts(cfg);

      // ── Step 2: ensure wallet is on the correct chain, then submit ───────
      if (currentChainId !== robinhoodChain.id) {
        await switchChainAsync({ chainId: robinhoodChain.id });
      }

      const hash = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: VAULT_FACTORY_ABI,
        functionName: 'createVault',
        args: [cfgForContract, BigInt(adminNonce), BigInt(deadline), adminSignature],
        chainId: robinhoodChain.id,
        account: creatorAddress,
      });

      setTxHash(hash);

      // ── Step 3: wait for the receipt ─────────────────────────────────────
      // (handled by useWaitForTransactionReceipt above — caller can watch
      //  receiptSuccess to know when to proceed)

      // ── Step 4: tell the backend to mark the vault published ─────────────
      setIsConfirming(true);
      try {
        await VaultsApiProvider.launchVault({
          vaultId: dbVaultId,
          txHash: hash,
          chainType: 'robinhood',
        });
      } finally {
        setIsConfirming(false);
      }

      return { dbVaultId, onChainTxHash: hash };
    },
    [creatorAddress, writeContractAsync]
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
function normalizeBigInts(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeBigInts);
  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, normalizeBigInts(v)]));
  }
  // Convert string or number representations of integers to bigint
  if (typeof obj === 'string' && /^\d+$/.test(obj)) return BigInt(obj);
  if (typeof obj === 'number' && Number.isInteger(obj)) return BigInt(obj);
  return obj;
}
