import toast from 'react-hot-toast';

import { useSubmitClaim } from '@/hooks/useRewardsClaims';
import { Button } from '@/components/ui/button';

export const ClaimButton = ({
  walletAddress,
  claimableAmount = 0,
  onSuccess = null,
  disabled = false,
  className = '',
}) => {
  const { mutate: submitClaim, isPending } = useSubmitClaim();

  const handleClaim = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (claimableAmount <= 0) {
      toast.error('No rewards available to claim');
      return;
    }

    submitClaim(
      { walletAddress, payload: {} },
      {
        onSuccess: data => {
          if (data.success) {
            toast.success(`Successfully claimed ${data.claimedAmount || claimableAmount} VLRM!`, { duration: 5000 });
            if (onSuccess) {
              onSuccess(data);
            }
          } else {
            toast.error(data.message || 'Claim failed');
          }
        },
        onError: error => {
          toast.error(error?.response?.data?.message || 'Failed to submit claim');
        },
      }
    );
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
        `Claim ${claimableAmount > 0 ? Number(claimableAmount).toLocaleString() : '0'} VLRM`
      )}
    </Button>
  );
};
