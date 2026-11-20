import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import type { Abi, Address, ContractFunctionName, Hash } from 'viem';

import { useEvmGovernanceFee } from '@/hooks/useEvmGovernanceFee';
import {
  type ContractCall,
  normalizeAuthorization,
  type PreparedContributionCall,
  showEvmTxError,
  sendAtomicBatch,
  simulateCall,
  supportsAtomicBatch,
  toRawCall,
  useEvmTx,
} from '@/hooks/useEvmTx';
import { getEvmTxErrorMessage } from '@/utils/walletErrors';
import { CoreApiProvider } from '@/services/api/core';
import { useCreateContributionTx } from '@/services/api/queries';
import {
  ERC1155_APPROVAL_ABI,
  ERC20_APPROVE_ABI,
  ERC721_APPROVE_ABI,
  VAULT_CONTRIBUTION_ABI,
} from '@/lib/evm/vault.abi';

// Mirror of Solidity AssetKind enum.
const AssetKind = { Native: 0, ERC20: 1, ERC721: 2, ERC1155: 3 };

/** Asset picked in the contribute modal (shape shared with the Cardano flow). */
export interface SelectedEvmAsset {
  isNft?: boolean;
  quantity: string | number;
  name?: string;
  displayName?: string;
  priceAda?: number;
  priceUsd?: number;
  valueAda?: number;
  valueUsd?: number;
  // Asset metadata from the wallet/indexer; only a few fields are read here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
}

/** Anything that takes a typed contract call (simulate or write). */
type CallRunner = <const abi extends Abi, functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>>(
  call: ContractCall<abi, functionName>
) => Promise<unknown>;

/** Sends (or simulates) the token approval a contribution needs; no-op when none is required. */
const runApproval = async (
  approval: PreparedContributionCall['approval'],
  spender: Address,
  run: CallRunner
): Promise<unknown> => {
  if (!approval?.required) return null;
  switch (approval.standard) {
    case 'ERC1155':
      return run({
        address: approval.token,
        abi: ERC1155_APPROVAL_ABI,
        functionName: 'setApprovalForAll',
        args: [spender, true],
      });
    case 'ERC721':
      return run({
        address: approval.token,
        abi: ERC721_APPROVE_ABI,
        functionName: 'approve',
        args: [spender, BigInt(approval.amountOrTokenId)],
      });
    case 'ERC20':
      return run({
        address: approval.token,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [spender, BigInt(approval.amountOrTokenId)],
      });
    default:
      return null;
  }
};

/**
 * EVM (Robinhood) contribution flow — mirrors the Cardano `useTransaction` hook.
 *
 *  1. POST /contribute/:vaultId → creates one pending Transaction row with all
 *     assets in metadata (same behavior as Cardano).
 *  2. POST /blockchain/evm/contribution/prepare → if a protocol fee is due,
 *     backend returns `feePayment`; we send that native transfer and call
 *     prepare again with `feeTxHash`. Backend then signs one EIP-712
 *     ContributionAuthorization per asset and returns the list of approve/
 *     contribute calls the wallet must submit.
 *  3. For each asset: optional token `approve` (or `setApprovalForAll`), then
 *     `contributeNative/ERC20/ERC721/ERC1155` on the vault. All calls are sent
 *     sequentially so wallets like MetaMask can queue them cleanly.
 *  4. POST /blockchain/evm/contribution/confirm → backend stores tx hash and
 *     creates Asset rows via `TransactionsService.createAssets(txId)`. The
 *     final confirmation to `contributed` is later fired by the Alchemy webhook.
 */
type EvmTxStatus = 'idle' | 'building' | 'signing' | 'submitting';

export const useEvmContributeTransaction = () => {
  const [status, setStatus] = useState<EvmTxStatus>('idle');
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { account: contributor, ensureChain, writeAndWait } = useEvmTx();
  const createContributionTx = useCreateContributionTx();
  const { payFee } = useEvmGovernanceFee();

  const sendTransaction = useCallback(
    async ({ vaultId, selectedNFTs }: { vaultId: string; selectedNFTs: SelectedEvmAsset[] }): Promise<Hash | null> => {
      setError(null);
      setTxHash(null);

      if (!contributor) {
        const msg = 'Wallet not connected';
        setError(msg);
        toast.error(msg);
        return null;
      }

      let createdTxId = null;
      let useAtomic = false;
      let landedContributions = 0;
      let totalContributions = 0;

      try {
        setStatus('building');

        // ── Step 1: create the DB Transaction row ──────────────────────────
        const { data: created } = await createContributionTx.mutateAsync({
          vaultId,
          assets: selectedNFTs.map(nft => ({
            policyId: nft.metadata.policyId,
            type: nft.isNft ? 'nft' : 'ft',
            standard: nft.metadata?.standard || nft.metadata?.onchainMetadata?.tokenType,
            assetName: nft.metadata.assetName,
            quantity: nft.quantity,
            displayName: nft.displayName || nft.name,
            image: nft.metadata.image,
            priceAda: nft.priceAda,
            priceUsd: nft.priceUsd,
            valueAda: nft.valueAda,
            valueUsd: nft.valueUsd,
            description: nft.metadata.description,
            decimals: nft.metadata.decimals,
            metadata: nft.metadata,
          })),
        });
        createdTxId = created.txId;

        // ── Step 2: fetch signed authorizations ────────────────────────────
        // If a protocol fee is due the backend returns `feePayment` and no
        // calls; pay it, then ask again with the fee tx hash.
        let { data: prepared } = await CoreApiProvider.prepareEvmContribution({ txId: createdTxId });
        if (prepared.feePayment) {
          setStatus('signing');
          const feeTxHash = await payFee(prepared.feePayment, contributor);
          setStatus('building');
          ({ data: prepared } = await CoreApiProvider.prepareEvmContribution({ txId: createdTxId, feeTxHash }));
        }
        const { vaultAddress, calls } = prepared as { vaultAddress: Address; calls: PreparedContributionCall[] };

        if (!Array.isArray(calls) || calls.length === 0) {
          throw new Error('No contribution calls returned by the backend');
        }
        totalContributions = calls.length;

        const contributeRequest = (call: PreparedContributionCall) => {
          const authorization = normalizeAuthorization(call.authorization);
          return {
            address: vaultAddress,
            abi: VAULT_CONTRIBUTION_ABI,
            functionName: call.functionName,
            args: [authorization, call.signature] as const,
            value:
              Number(call.authorization.kind) === AssetKind.Native ? BigInt(call.value ?? authorization.amount) : 0n,
          };
        };

        // ── Step 3: ensure wallet is on the correct chain ──────────────────
        await ensureChain();

        // ── Step 4: pre-flight every call before anything is sent ──────────
        // A revert on asset N must not leave assets 1..N-1 already on-chain.
        // Calls that need an approval can only be dry-run after it lands, so
        // for those we pre-flight the approval itself and re-simulate the
        // contribute right before sending it.
        const simulate: CallRunner = call => simulateCall({ account: contributor, ...call });
        for (const call of calls) {
          if (call.approval?.required) {
            await runApproval(call.approval, vaultAddress, simulate);
          } else {
            await simulate(contributeRequest(call));
          }
        }

        // ── Step 5: submit ─────────────────────────────────────────────────
        setStatus('signing');
        let childTxHashes: Hash[] = [];
        let primaryHash: Hash | null = null;

        if (calls.length > 1 || calls.some(c => c.approval?.required)) {
          useAtomic = await supportsAtomicBatch(contributor);
        }

        if (useAtomic && contributor) {
          // EIP-5792: approvals + contributions in one all-or-nothing batch,
          // so a failing asset can never leave earlier ones half-done.
          const rawCalls: ReturnType<typeof toRawCall>[] = [];
          const collect: CallRunner = async call => {
            rawCalls.push(toRawCall(call));
          };
          for (const call of calls) {
            await runApproval(call.approval, vaultAddress, collect);
            await collect(contributeRequest(call));
          }
          childTxHashes = await sendAtomicBatch(contributor, rawCalls);
          primaryHash = childTxHashes[childTxHashes.length - 1];
          landedContributions = calls.length;
        } else {
          // Fallback: one wallet prompt per tx. Each contribute is re-simulated
          // (after its approval landed) right before it is sent.
          for (const call of calls) {
            const approvalHash = await runApproval(call.approval, vaultAddress, writeAndWait);
            if (approvalHash) childTxHashes.push(approvalHash as Hash);
            const hash = await writeAndWait(contributeRequest(call));
            childTxHashes.push(hash);
            primaryHash = hash;
            landedContributions += 1;
          }
        }

        // ── Step 6: confirm with backend ───────────────────────────────────
        setStatus('submitting');
        await CoreApiProvider.confirmEvmContribution({
          txId: createdTxId,
          txHash: primaryHash,
          childTxHashes,
        });

        setTxHash(primaryHash);
        toast.success('Contribution submitted successfully');
        setStatus('idle');
        return primaryHash;
      } catch (err) {
        let errorMessage: string;
        if (landedContributions > 0 && landedContributions < totalContributions) {
          // Some contributions are already on-chain. The vault event reconciler
          // binds them to this transaction from their ContributionMade events,
          // so they are not lost — tell the user exactly what happened.
          errorMessage =
            `${landedContributions} of ${totalContributions} assets were contributed; the rest failed ` +
            `(${getEvmTxErrorMessage(err, 'Transaction failed')}). The contributed assets will appear in the vault ` +
            'within ~15 minutes. You can contribute the remaining ones again.';
          console.error('Partial EVM contribution', err, {
            txId: createdTxId,
            landedContributions,
            totalContributions,
          });
          toast.error(errorMessage, { className: '!max-w-[700px]', duration: 15000 });
        } else {
          errorMessage = showEvmTxError(err, 'Transaction failed');
        }
        setError(errorMessage);
        setStatus('idle');
        return null;
      }
    },
    [contributor, ensureChain, writeAndWait, createContributionTx, payFee]
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
    sendTransaction,
    reset,
    isProcessing: ['building', 'signing', 'submitting'].includes(status),
  };
};
