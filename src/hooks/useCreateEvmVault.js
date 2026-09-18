import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useSwitchChain } from 'wagmi';

import { VaultsApiProvider } from '@/services/api/vaults';
import { VAULT_FACTORY_ABI } from '@/lib/evm/vaultFactory.abi';
import { evmChainByNetwork } from '@/lib/evm/wagmi.config';
import { useNetwork } from '@/hooks/useNetwork';

/** Fallback for older backends that don't return the factory with the signature. */
const FALLBACK_FACTORY_ADDRESS = import.meta.env.VITE_EVM_VAULT_FACTORY_ADDRESS;

/**
 * Two-step EVM vault creation, on whichever EVM chain is selected (Robinhood, Arc):
 *  1. POST /vaults (chainType) → admin EIP-712 signature + VaultConfig + the chain
 *     and factory that signature is bound to
 *  2. writeContract(VaultFactory.createVault) → creator pays gas on that chain
 *  3. Wait for receipt
 *  4. POST /vaults/publish (txHash) → backend marks vault published
 */
export const useCreateEvmVault = () => {
  const { address: creatorAddress, chainId: currentChainId } = useAccount();
  const { network } = useNetwork();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [isPreparing, setIsPreparing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const [receiptChainId, setReceiptChainId] = useState(undefined);

  const { isLoading: isWaitingReceipt, isSuccess: receiptSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: receiptChainId,
  });

  /**
   * @param {object} vaultData — the same vaultData object used for Cardano creation;
   *                             the chain comes from the selected network
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
          chainType: network,
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
        chainId: signedChainId,
        factoryAddress: signedFactoryAddress,
      } = prepareRes;

      if (!cfg || !adminSignature) {
        throw new Error('Backend did not return EVM vault config or signature');
      }

      // bigint conversion — values come as strings from JSON
      const cfgForContract = normalizeBigInts(cfg);

      // The admin signature's EIP-712 domain carries the chain id and factory, so the
      // transaction has to go to exactly those — a Robinhood signature is invalid on Arc.
      // VITE_EVM_VAULT_FACTORY_ADDRESS is the Robinhood factory; never use it as an Arc fallback.
      const targetChainId = signedChainId ?? evmChainByNetwork[network]?.id;
      const factoryAddress = signedFactoryAddress ?? (network === 'robinhood' ? FALLBACK_FACTORY_ADDRESS : undefined);
      if (!targetChainId || !factoryAddress) {
        throw new Error(`No VaultFactory configured for ${network}`);
      }
      setReceiptChainId(targetChainId);

      // ── Step 2: ensure wallet is on the correct chain, then submit ───────
      if (currentChainId !== targetChainId) {
        await switchChainAsync({ chainId: targetChainId });
      }

      const hash = await writeContractAsync({
        address: factoryAddress,
        abi: VAULT_FACTORY_ABI,
        functionName: 'createVault',
        args: [cfgForContract, BigInt(adminNonce), BigInt(deadline), adminSignature],
        chainId: targetChainId,
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
          txId: transactionId,
          txHash: hash,
          chainType: network,
        });
      } finally {
        setIsConfirming(false);
      }

      return { dbVaultId, onChainTxHash: hash };
    },
    [creatorAddress, currentChainId, network, switchChainAsync, writeContractAsync]
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
