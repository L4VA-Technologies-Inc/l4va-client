import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import {
  estimateGas,
  getCapabilities,
  sendCalls,
  simulateContract,
  waitForCallsStatus,
  waitForTransactionReceipt,
} from 'wagmi/actions';
import { encodeFunctionData } from 'viem';
import type { Abi, Address, ContractFunctionArgs, ContractFunctionName, Hash, Hex, TransactionReceipt } from 'viem';

import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';
import { type EvmTxErrorOptions, getEvmTxErrorMessage } from '@/utils/walletErrors';

type Mutability = 'nonpayable' | 'payable';

/**
 * A state-changing contract call. Generic over the ABI, so `functionName` and
 * `args` are checked against the (`as const`) ABI at every call site.
 */
export type ContractCall<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, Mutability> = ContractFunctionName<abi, Mutability>,
> = {
  address: Address;
  abi: abi;
  functionName: functionName;
  args: ContractFunctionArgs<abi, Mutability, functionName>;
  value?: bigint;
  chainId?: number;
};

/** Backend-signed contribution authorization; numbers arrive as strings over JSON. */
export interface AuthorizationDto {
  cycleId: string | number;
  contributor: Address;
  kind: string | number;
  asset: Address;
  tokenId: string | number;
  amount: string | number;
  nonce: string | number;
  deadline: string | number;
}

/** One signed contribute* call returned by /blockchain/evm/contribution/prepare. */
export interface PreparedContributionCall {
  functionName: 'contributeNative' | 'contributeERC20' | 'contributeERC721' | 'contributeERC1155';
  authorization: AuthorizationDto;
  signature: Hex;
  value?: string;
  approval?: {
    required: boolean;
    standard: 'ERC20' | 'ERC721' | 'ERC1155';
    token: Address;
    amountOrTokenId: string;
  } | null;
}

export const normalizeAuthorization = (auth: AuthorizationDto) => ({
  cycleId: BigInt(auth.cycleId),
  contributor: auth.contributor,
  kind: Number(auth.kind),
  asset: auth.asset,
  tokenId: BigInt(auth.tokenId),
  amount: BigInt(auth.amount),
  nonce: BigInt(auth.nonce),
  deadline: BigInt(auth.deadline),
});

/** Waits for a mined receipt and throws if the transaction reverted. */
export const waitForSuccess = async (hash: Hash, chainId: number = robinhoodChain.id): Promise<TransactionReceipt> => {
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId });
  if (receipt.status !== 'success') {
    throw new Error(`Transaction ${hash.slice(0, 10)}… reverted on-chain`);
  }
  return receipt;
};

/** Dry-runs a contract call against the current chain state; throws the decoded revert. */
export const simulateCall = <const abi extends Abi, functionName extends ContractFunctionName<abi, Mutability>>(
  call: ContractCall<abi, functionName> & { account?: Address }
) =>
  // The generic call is fully checked at the call site; viem's own overloads
  // can't follow it through a second layer of generics.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateContract(wagmiConfig, { chainId: robinhoodChain.id, ...call } as any);

/**
 * Gas limit = estimate + 30%. Wallets often send the bare estimate; on Robinhood
 * (Arbitrum Orbit) state/L1-cost drift between estimate and inclusion then makes
 * the tx die with "out of gas: not enough gas for reentrancy sentry".
 * Returns undefined (let the wallet decide) if estimation fails.
 */
export const estimateGasWithBuffer = async <
  const abi extends Abi,
  functionName extends ContractFunctionName<abi, Mutability>,
>(
  call: ContractCall<abi, functionName> & { account?: Address }
): Promise<bigint | undefined> => {
  try {
    const { data, to, value } = toRawCall(call);
    const estimate = await estimateGas(wagmiConfig, {
      chainId: call.chainId ?? robinhoodChain.id,
      account: call.account,
      to,
      data,
      value,
    });
    return (estimate * 130n) / 100n;
  } catch {
    return undefined;
  }
};

export const showEvmTxError = (err: unknown, fallback: string, options?: EvmTxErrorOptions): string => {
  const message = getEvmTxErrorMessage(err, fallback, options);
  console.error(err);
  toast.error(message, { className: '!max-w-[700px]', duration: 10000 });
  return message;
};

/**
 * True when the wallet can execute a batch of calls atomically (EIP-5792 `atomic`
 * capability). Wallets without EIP-5792 throw on getCapabilities → false.
 */
export const supportsAtomicBatch = async (account: Address | undefined, chainId: number = robinhoodChain.id) => {
  if (!account) return false;
  try {
    const caps = await getCapabilities(wagmiConfig, { account, chainId });
    const status = (caps as { atomic?: { status?: string } })?.atomic?.status;
    return status === 'supported' || status === 'ready';
  } catch {
    return false;
  }
};

/** Encodes a typed contract call into a raw EIP-5792 call. */
export const toRawCall = <const abi extends Abi, functionName extends ContractFunctionName<abi, Mutability>>(
  call: ContractCall<abi, functionName>
) => ({
  to: call.address,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: encodeFunctionData({ abi: call.abi, functionName: call.functionName, args: call.args } as any),
  value: call.value ?? 0n,
});

/**
 * Sends the calls as one all-or-nothing batch and waits for it. Returns the
 * distinct transaction hashes in execution order (a 7702/smart-account wallet
 * typically lands the whole batch in a single tx).
 */
export const sendAtomicBatch = async (
  account: Address,
  calls: { to: Address; data: Hex; value: bigint }[],
  chainId: number = robinhoodChain.id
): Promise<Hash[]> => {
  const { id } = await sendCalls(wagmiConfig, { account, chainId, calls, forceAtomic: true });
  const result = await waitForCallsStatus(wagmiConfig, { id, timeout: 180_000 });
  if (result.status !== 'success') {
    throw new Error('The batched transaction failed — nothing was contributed');
  }
  const hashes = (result.receipts ?? []).map(r => r.transactionHash);
  if (hashes.length === 0) throw new Error('The wallet did not report a transaction hash for the batch');
  return Array.from(new Set(hashes));
};

/**
 * Shared plumbing for Robinhood contract writes: chain switch, simulate-then-send,
 * receipt check. Every write is simulated first so reverts (VaultFrozen, expired
 * deadline, …) surface with their real name before the wallet opens.
 */
export const useEvmTx = () => {
  const { address: account, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const ensureChain = useCallback(
    async (chainId: number = robinhoodChain.id) => {
      if (currentChainId !== chainId) {
        await switchChainAsync({ chainId });
      }
    },
    [currentChainId, switchChainAsync]
  );

  /** Simulate, then send the exact simulated request. Returns the tx hash. */
  const simulateAndWrite = useCallback(
    async <const abi extends Abi, functionName extends ContractFunctionName<abi, Mutability>>(
      call: ContractCall<abi, functionName>
    ): Promise<Hash> => {
      const { request } = await simulateCall({ account, ...call });
      return writeContractAsync({ ...request, gas: await estimateGasWithBuffer({ account, ...call }) });
    },
    [account, writeContractAsync]
  );

  /** simulateAndWrite + wait for a successful receipt. */
  const writeAndWait = useCallback(
    async <const abi extends Abi, functionName extends ContractFunctionName<abi, Mutability>>(
      call: ContractCall<abi, functionName>
    ): Promise<Hash> => {
      const hash = await simulateAndWrite(call);
      await waitForSuccess(hash, call.chainId ?? robinhoodChain.id);
      return hash;
    },
    [simulateAndWrite]
  );

  return { account, ensureChain, simulateAndWrite, writeAndWait };
};
