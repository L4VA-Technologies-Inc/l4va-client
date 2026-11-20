import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import type { Address, Hash } from 'viem';

import { showEvmTxError, useEvmTx, waitForSuccess } from '@/hooks/useEvmTx';
import { VAULT_TERMINATION_ABI } from '@/lib/evm/vault.abi';

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
  const [status, setStatus] = useState<'idle' | 'signing' | 'submitting'>('idle');
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { account: holder, ensureChain, simulateAndWrite } = useEvmTx();

  const redeem = useCallback(
    async ({ vaultAddress }: { vaultAddress?: Address | null }): Promise<Hash | null> => {
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
        await ensureChain();

        setStatus('signing');
        const hash = await simulateAndWrite({
          address: vaultAddress,
          abi: VAULT_TERMINATION_ABI,
          functionName: 'redeem',
          args: [holder],
        });

        setStatus('submitting');
        await waitForSuccess(hash);

        setTxHash(hash);
        toast.success('Redemption submitted — your VT was burned and your share paid out');
        setStatus('idle');
        return hash;
      } catch (err) {
        const errorMessage = showEvmTxError(err, 'Redemption failed');
        setError(errorMessage);
        setStatus('idle');
        return null;
      }
    },
    [holder, ensureChain, simulateAndWrite]
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
