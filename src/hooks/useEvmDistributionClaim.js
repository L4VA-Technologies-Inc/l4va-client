import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { VAULT_DISTRIBUTION_ABI } from '@/lib/evm/vault.abi';
import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';

/**
 * Claim one open distribution on an EVM vault.
 *
 * A passed Distribution proposal only reserves the pot inside the vault
 * contract — nothing is pushed to holders. Each holder pulls their own share
 * with `claimDistribution(id, recipient)`. Unlike `redeem`, this does NOT burn
 * VT: the same holder keeps claiming every later distribution.
 *
 * Pays strictly to the connected wallet, as the redeem path does.
 */
export const useEvmDistributionClaim = () => {
  const [status, setStatus] = useState('idle');
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState(null);

  const { address: holder, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const claim = useCallback(
    async ({ vaultAddress, chainId, distributionId }) => {
      setError(null);

      if (!holder) {
        toast.error('Wallet not connected');
        return null;
      }
      if (!vaultAddress) {
        toast.error('Vault contract address unavailable');
        return null;
      }

      try {
        // The vault decides the chain; the wallet is switched to it before signing.
        const targetChainId = chainId ?? robinhoodChain.id;
        if (currentChainId !== targetChainId) {
          await switchChainAsync({ chainId: targetChainId });
        }

        setClaimingId(String(distributionId));
        setStatus('signing');
        const hash = await writeContractAsync({
          address: vaultAddress,
          abi: VAULT_DISTRIBUTION_ABI,
          functionName: 'claimDistribution',
          args: [BigInt(distributionId), holder],
          account: holder,
          chainId: targetChainId,
        });

        setStatus('submitting');
        await waitForTransactionReceipt(wagmiConfig, { hash, chainId: targetChainId });

        toast.success('Distribution claimed — your share is in your wallet');
        setStatus('idle');
        setClaimingId(null);
        return hash;
      } catch (err) {
        const errorMessage = err?.shortMessage || err?.message || 'Claim failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px]', duration: 10000 });
        setStatus('idle');
        setClaimingId(null);
        return null;
      }
    },
    [holder, currentChainId, switchChainAsync, writeContractAsync]
  );

  return {
    claim,
    claimingId,
    error,
    isProcessing: ['signing', 'submitting'].includes(status),
  };
};
