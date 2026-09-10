import { useCallback, useState } from 'react';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';

/**
 * Pays an EVM (Robinhood) governance fee.
 *
 * Unlike the Cardano flow there is no presigned transaction to sign — the
 * backend only quotes `{ to, value, chainId }` and the wallet broadcasts a
 * plain native transfer itself. The resulting hash is the proof of payment the
 * backend verifies (recipient, sender, value, and that the hash is unused).
 *
 * Returns the confirmed transaction hash, so callers must await the receipt
 * before posting it back — the backend rejects a hash it cannot see yet.
 */
export const useEvmGovernanceFee = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const { address, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  const payFee = useCallback(
    async (payment, expectedFrom) => {
      setError(null);

      if (!payment) {
        throw new Error('No governance fee payment parameters provided');
      }
      if (!address) {
        throw new Error('Robinhood wallet is not connected');
      }
      // The backend verifies the payment came from the acting address. Catch a
      // mismatch here rather than after the user has spent the fee on a
      // transfer that would then be rejected.
      if (expectedFrom && address.toLowerCase() !== expectedFrom.toLowerCase()) {
        throw new Error(
          `Connected wallet ${address} does not match the account for this action (${expectedFrom}). ` +
            'Switch accounts and try again.'
        );
      }

      const targetChainId = payment.chainId ?? robinhoodChain.id;

      try {
        if (currentChainId !== targetChainId) {
          await switchChainAsync({ chainId: targetChainId });
        }

        setStatus('signing');
        const hash = await sendTransactionAsync({
          to: payment.to,
          value: BigInt(payment.value),
          account: address,
          chainId: targetChainId,
        });

        // The backend verifies against a mined receipt, so wait here rather
        // than letting it reject a hash that is merely too fresh.
        setStatus('submitting');
        await waitForTransactionReceipt(wagmiConfig, { hash, chainId: targetChainId });

        setStatus('idle');
        return hash;
      } catch (err) {
        setStatus('idle');
        setError(err);
        throw err;
      }
    },
    [address, currentChainId, switchChainAsync, sendTransactionAsync]
  );

  return { payFee, status, error };
};
