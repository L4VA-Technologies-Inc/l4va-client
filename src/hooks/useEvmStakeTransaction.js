import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from 'wagmi/actions';

import { L4VA_STAKING_ABI } from '@/lib/evm/staking.abi';
import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';
import { StakeApiProvider } from '@/services/api/stake';

const errorMessageOf = (err, fallback) => {
  const raw = err?.response?.data?.message || err?.shortMessage || err?.message || fallback;
  if (/InsufficientRewardReserve/.test(raw)) {
    return 'The staking reward pool is temporarily short. Try again later — your deposit is safe.';
  }
  if (/EnforcedPause/.test(raw)) return 'Staking is paused right now.';
  if (/WrongStakeFee/.test(raw)) return 'The staking fee has changed. Reload the page and try again.';
  return raw;
};

/**
 * Robinhood (L4VAStaking) counterpart of useStakeTransaction.
 *
 * The wallet calls the contract directly — rewards are priced on-chain, so
 * there is no backend build / co-sign step. After the tx is mined the hash is
 * reported to the API, which mirrors the events into staking positions (a
 * background scan does the same if this call is missed).
 */
export const useEvmStakeTransaction = ({ stakingAddress } = {}) => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();
  const { address: account, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const run = useCallback(
    async (label, send) => {
      setError(null);
      setTxHash(null);

      if (!account) {
        toast.error('Wallet not connected');
        return null;
      }
      if (!stakingAddress) {
        toast.error('Staking contract is not configured');
        return null;
      }

      try {
        if (currentChainId !== robinhoodChain.id) {
          await switchChainAsync({ chainId: robinhoodChain.id });
        }

        const hash = await send();

        setStatus('submitting');
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: robinhoodChain.id });
        if (receipt.status !== 'success') throw new Error(`${label} transaction reverted`);

        await StakeApiProvider.confirmEvm({ txHash: hash }).catch(() => {});
        await queryClient.invalidateQueries({ queryKey: ['stake'] });

        setTxHash(hash);
        toast.success(`${label} completed successfully`);
        setStatus('idle');
        return hash;
      } catch (err) {
        const message = errorMessageOf(err, `${label} failed`);
        setError(message);
        toast.error(message, { className: '!max-w-[700px]', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [account, stakingAddress, currentChainId, switchChainAsync, queryClient]
  );

  const write = useCallback(
    (functionName, args, value) => {
      setStatus('signing');
      return writeContractAsync({
        address: stakingAddress,
        abi: L4VA_STAKING_ABI,
        functionName,
        args,
        ...(value ? { value } : {}),
        account,
        chainId: robinhoodChain.id,
      });
    },
    [writeContractAsync, stakingAddress, account]
  );

  /**
   * `amount` is in raw token units (bigint). Approves the exact amount first if
   * needed; `stakeFee` (wei, from /stake/evm/config) goes along as msg.value.
   */
  const stake = useCallback(
    ({ token, amount, stakeFee = 0n }) =>
      run('Stake', async () => {
        const allowance = await readContract(wagmiConfig, {
          address: token,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [account, stakingAddress],
          chainId: robinhoodChain.id,
        });
        if (allowance < amount) {
          setStatus('approving');
          const approveHash = await writeContractAsync({
            address: token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [stakingAddress, amount],
            account,
            chainId: robinhoodChain.id,
          });
          await waitForTransactionReceipt(wagmiConfig, { hash: approveHash, chainId: robinhoodChain.id });
        }
        return write('stake', [token, amount], stakeFee);
      }),
    [run, write, writeContractAsync, account, stakingAddress]
  );

  const toIds = positionIds => positionIds.map(id => BigInt(id));

  const unstake = useCallback(
    ({ positionIds }) => run('Unstake', () => write('unstake', [toIds(positionIds)])),
    [run, write]
  );
  const harvest = useCallback(
    ({ positionIds }) => run('Harvest', () => write('harvest', [toIds(positionIds)])),
    [run, write]
  );
  const compound = useCallback(
    ({ positionIds }) => run('Compound', () => write('compound', [toIds(positionIds)])),
    [run, write]
  );

  /** Deposit only, reward forfeited — the way out when the reward reserve is short. */
  const emergencyUnstake = useCallback(
    ({ positionIds }) => run('Emergency unstake', () => write('emergencyUnstake', [toIds(positionIds)])),
    [run, write]
  );

  return {
    status,
    txHash,
    error,
    stake,
    unstake,
    harvest,
    compound,
    emergencyUnstake,
    isProcessing: ['approving', 'signing', 'submitting'].includes(status),
  };
};
