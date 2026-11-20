import { useCallback, useState } from 'react';
import type { Address, Hash, Hex } from 'viem';

import { useEvmTx, waitForSuccess } from '@/hooks/useEvmTx';
import { getEvmTxErrorMessage } from '@/utils/walletErrors';
import { REWARDS_DISTRIBUTOR_ABI } from '@/lib/evm/rewardsDistributor.abi';
import { robinhoodChain } from '@/lib/evm/wagmi.config';

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
/** GET /rewards/me/claims/evm-distributor */
export interface EvmClaimInfo {
  account: Address;
  distributor: Address;
  chainId: number;
  paused?: boolean;
  active?: { cumulativeAmount: string; proof: Hex[] } | null;
}

export const useEvmRewardsClaim = () => {
  const [status, setStatus] = useState<'idle' | 'switching' | 'signing' | 'confirming'>('idle');
  const { account: sender, ensureChain, simulateAndWrite } = useEvmTx();

  const claim = useCallback(
    async (claimInfo: EvmClaimInfo | null | undefined): Promise<Hash> => {
      if (!sender) throw new Error('Please connect your wallet');
      if (!claimInfo?.active) throw new Error('No rewards available to claim');
      if (claimInfo.paused) throw new Error('Reward claiming is paused at the moment. Please try again later.');
      if (claimInfo.chainId !== robinhoodChain.id) {
        throw new Error(`Rewards are on chain ${claimInfo.chainId}, but the app is set up for ${robinhoodChain.id}`);
      }

      try {
        setStatus('switching');
        await ensureChain();

        setStatus('signing');
        const hash = await simulateAndWrite({
          address: claimInfo.distributor,
          abi: REWARDS_DISTRIBUTOR_ABI,
          functionName: 'claim',
          args: [claimInfo.account, BigInt(claimInfo.active.cumulativeAmount), claimInfo.active.proof],
        });

        setStatus('confirming');
        await waitForSuccess(hash);
        return hash;
      } finally {
        setStatus('idle');
      }
    },
    [sender, ensureChain, simulateAndWrite]
  );

  return { claim, status, isProcessing: status !== 'idle' };
};

/** Human message for a failed claim (wallet rejection, contract revert, API error). */
export const evmClaimErrorMessage = (error: unknown): string =>
  getEvmTxErrorMessage(error, 'Failed to claim rewards', {
    contractMessages: { EnforcedPause: 'Reward claiming is paused at the moment. Please try again later.' },
  });
