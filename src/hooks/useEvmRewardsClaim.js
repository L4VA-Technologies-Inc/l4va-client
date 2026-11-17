import { useCallback, useState } from 'react';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { REWARDS_DISTRIBUTOR_ABI } from '@/lib/evm/rewardsDistributor.abi';
import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';

/**
 * Robinhood rewards claim from the L4VARewardsDistributor contract.
 *
 * The backend only provides the arguments (GET /rewards/me/claims/evm-distributor);
 * the connected wallet sends `claim(account, cumulativeAmount, proof)` and pays gas.
 * The contract pays `cumulativeAmount - claimed[account]` to `account`, so a repeated
 * or double-clicked claim can never pay twice — the second one reverts with
 * NothingToClaim.
 *
 * Returns the tx hash on success. Throws on failure (wallet rejection, revert), so
 * the caller decides how to report it.
 */
export const useEvmRewardsClaim = () => {
  const [status, setStatus] = useState('idle');
  const { address: sender, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const claim = useCallback(
    async claimInfo => {
      if (!sender) throw new Error('Please connect your wallet');
      if (!claimInfo?.active) throw new Error('No rewards available to claim');
      if (claimInfo.paused) throw new Error('Reward claiming is paused at the moment. Please try again later.');
      if (claimInfo.chainId !== robinhoodChain.id) {
        throw new Error(`Rewards are on chain ${claimInfo.chainId}, but the app is set up for ${robinhoodChain.id}`);
      }

      try {
        if (currentChainId !== robinhoodChain.id) {
          setStatus('switching');
          await switchChainAsync({ chainId: robinhoodChain.id });
        }

        setStatus('signing');
        const hash = await writeContractAsync({
          address: claimInfo.distributor,
          abi: REWARDS_DISTRIBUTOR_ABI,
          functionName: 'claim',
          args: [claimInfo.account, BigInt(claimInfo.active.cumulativeAmount), claimInfo.active.proof],
          account: sender,
          chainId: robinhoodChain.id,
        });

        setStatus('confirming');
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: robinhoodChain.id });
        if (receipt.status !== 'success') throw new Error('Claim transaction reverted');
        return hash;
      } finally {
        setStatus('idle');
      }
    },
    [sender, currentChainId, switchChainAsync, writeContractAsync]
  );

  return { claim, status, isProcessing: status !== 'idle' };
};

/** Human message for a failed claim (wallet rejection, contract revert, API error). */
export const evmClaimErrorMessage = error => {
  const name = error?.cause?.data?.errorName || error?.data?.errorName;
  if (name === 'NothingToClaim') return 'These rewards were already claimed.';
  if (name === 'InvalidProof') return 'Your rewards were just updated. Please refresh and try again.';
  if (name === 'EnforcedPause') return 'Reward claiming is paused at the moment. Please try again later.';
  if (error?.name === 'UserRejectedRequestError' || error?.cause?.name === 'UserRejectedRequestError') {
    return 'Transaction was cancelled';
  }
  return error?.response?.data?.message || error?.shortMessage || error?.message || 'Failed to claim rewards';
};
