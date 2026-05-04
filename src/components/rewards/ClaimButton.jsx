import React from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import PrimaryButton from '../shared/PrimaryButton';

import { RewardsApiProvider } from '@/services/api/rewards';

export const ClaimButton = ({ claimableAmount = 0, onSuccess = null, disabled = false }) => {
  const [status, setStatus] = React.useState('idle');
  const wallet = useWallet('handler', 'isConnected');

  const handleClaim = async () => {
    if (!wallet.isConnected || !wallet.handler) {
      toast.error('Please connect your wallet');
      return;
    }

    if (claimableAmount <= 0) {
      toast.error('No rewards available to claim');
      return;
    }

    // Track reservationId outside try/catch so we can cancel on signing rejection
    let reservationId = null;

    try {
      setStatus('building');
      toast.loading('Preparing claim transaction...', { id: 'claim-tx' });

      const prepared = await RewardsApiProvider.prepareClaimTransaction({
        claimImmediate: true,
        claimVested: true,
      });

      reservationId = prepared.reservationId;

      // ── Step 2: Ask user to sign via CIP-30 wallet ─────────────────────────
      setStatus('signing');
      toast.loading('Please sign in your wallet...', { id: 'claim-tx' });

      let userWitness;
      try {
        userWitness = await wallet.handler.signTx(prepared.txCbor, true);
      } catch (signError) {
        console.error('Error during wallet signing:', signError);
        // User declined or closed the wallet popup — release the reservation immediately
        RewardsApiProvider.cancelClaimTransaction({ reservationId }).catch(() => {});
        reservationId = null;
        throw new Error('Transaction signing was cancelled');
      }

      if (!userWitness) {
        RewardsApiProvider.cancelClaimTransaction({ reservationId }).catch(() => {});
        reservationId = null;
        throw new Error('Transaction signing was cancelled');
      }

      // ── Step 3: Assemble + submit + confirm reservation ────────────────────
      setStatus('submitting');
      toast.loading('Submitting claim transaction...', { id: 'claim-tx' });

      const result = await RewardsApiProvider.submitClaimTransaction({
        reservationId: prepared.reservationId,
        txCbor: prepared.txCbor,
        userWitness,
      });

      toast.success(`Successfully claimed ${result.claimedAmount ?? claimableAmount} $L4VA!`, {
        id: 'claim-tx',
        duration: 7000,
      });

      if (onSuccess) {
        onSuccess({
          success: true,
          txHash: result.txHash,
          claimedAmount: result.claimedAmount,
        });
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to process claim';
      toast.error(message, { id: 'claim-tx' });
    } finally {
      setStatus('idle');
    }
  };

  const isPending = status !== 'idle';
  const isDisabled = disabled || isPending || claimableAmount <= 0;

  const idleLabel = `Claim ${claimableAmount > 0 ? Number(claimableAmount).toLocaleString() : '0'} $L4VA`;

  return (
    <PrimaryButton onClick={handleClaim} disabled={isDisabled}>
      {isPending ? status.charAt(0).toUpperCase() + status.slice(1) + '...' : idleLabel}
    </PrimaryButton>
  );
};
