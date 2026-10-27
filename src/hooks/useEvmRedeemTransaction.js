import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { VAULT_TERMINATION_ABI } from '@/lib/evm/vault.abi';
import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';

/**
 * EVM (Robinhood) termination redemption.
 *
 * When a vault is `terminating`, the V6 contract holds a fixed redemption rate
 * per distributable asset. `redeem(recipient)` burns the caller's ENTIRE VT
 * balance and pays their pro-rata share of every committed asset in one tx.
 * There is no backend prepare step — the contract computes everything.
 *
 * Pays strictly to the connected wallet (recipient = self); a holder who needs
 * a different recipient (e.g. a token that blacklists their address) can be
 * handled by the operator's `redeemFor` path.
 */
export const useEvmRedeemTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const { address: holder, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const redeem = useCallback(
    async ({ vaultAddress }) => {
      setError(null);
      setTxHash(null);

      if (!holder) {
        const msg = 'Wallet not connected';
        setError(msg);
        toast.error(msg);
        return null;
      }
      if (!vaultAddress) {
        const msg = 'Vault contract address unavailable';
        setError(msg);
        toast.error(msg);
        return null;
      }

      try {
        if (currentChainId !== robinhoodChain.id) {
          await switchChainAsync({ chainId: robinhoodChain.id });
        }

        setStatus('signing');
        const hash = await writeContractAsync({
          address: vaultAddress,
          abi: VAULT_TERMINATION_ABI,
          functionName: 'redeem',
          args: [holder],
          account: holder,
          chainId: robinhoodChain.id,
        });

        setStatus('submitting');
        await waitForTransactionReceipt(wagmiConfig, { hash, chainId: robinhoodChain.id });

        setTxHash(hash);
        toast.success('Redemption submitted — your VT was burned and your share paid out');
        setStatus('idle');
        return hash;
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.shortMessage || err?.message || 'Redemption failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px]', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [holder, currentChainId, switchChainAsync, writeContractAsync]
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
    redeem,
    reset,
    isProcessing: ['signing', 'submitting'].includes(status),
  };
};
