import React from 'react';
import toast from 'react-hot-toast';

import { RewardsApiProvider } from '@/services/api/rewards';
import { Button } from '@/components/ui/button';

export const ClaimButton = ({
  walletAddress,
  claimableAmount = 0,
  onSuccess = null,
  disabled = false,
  className = '',
}) => {
  const [isPending, setIsPending] = React.useState(false);

  const handleClaim = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (claimableAmount <= 0) {
      toast.error('No rewards available to claim');
      return;
    }

    setIsPending(true);

    try {
      // Build, sign, and submit the claim transaction (all handled server-side)
      toast.loading('Processing claim transaction...', { id: 'claim-tx' });

      const result = await RewardsApiProvider.buildClaimTransaction(walletAddress, {
        claimImmediate: true,
        claimVested: true,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to process claim', { id: 'claim-tx' });
        setIsPending(false);
        return;
      }

      toast.success(`Successfully claimed ${result.claimedAmount || claimableAmount} $L4VA! TxHash: ${result.txHash}`, {
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
      toast.error(error?.response?.data?.message || error?.message || 'Failed to process claim', { id: 'claim-tx' });
    } finally {
      setIsPending(false);
    }
  };

  const isDisabled = disabled || isPending || claimableAmount <= 0;

  return (
    <Button
      onClick={handleClaim}
      disabled={isDisabled}
      className={`bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 ${className}`}
    >
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </>
      ) : (
        `Claim ${claimableAmount > 0 ? Number(claimableAmount).toLocaleString() : '0'} $L4VA`
      )}
    </Button>
  );
};
