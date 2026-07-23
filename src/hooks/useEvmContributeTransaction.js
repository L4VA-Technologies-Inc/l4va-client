import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { CoreApiProvider } from '@/services/api/core';
import { useCreateContributionTx } from '@/services/api/queries';
import {
  ERC1155_APPROVAL_ABI,
  ERC20_APPROVE_ABI,
  ERC721_APPROVE_ABI,
  VAULT_CONTRIBUTION_ABI,
} from '@/lib/evm/vault.abi';
import { robinhoodChain, wagmiConfig } from '@/lib/evm/wagmi.config';

// Mirror of Solidity AssetKind enum.
const AssetKind = { Native: 0, ERC20: 1, ERC721: 2, ERC1155: 3 };

const APPROVAL_ABI_BY_STANDARD = {
  ERC20: ERC20_APPROVE_ABI,
  ERC721: ERC721_APPROVE_ABI,
  ERC1155: ERC1155_APPROVAL_ABI,
};

/**
 * Convert authorization + signature returned by the backend into args suitable
 * for `writeContractAsync`. All numeric fields come across the wire as strings
 * (the backend uses JSON.stringify with bigint-safe replacer).
 */
const normalizeAuthorization = auth => ({
  cycleId: BigInt(auth.cycleId),
  contributor: auth.contributor,
  kind: Number(auth.kind),
  asset: auth.asset,
  tokenId: BigInt(auth.tokenId),
  amount: BigInt(auth.amount),
  nonce: BigInt(auth.nonce),
  deadline: BigInt(auth.deadline),
});

const buildApprovalRequest = (approval, spender) => {
  if (!approval?.required) return null;
  const abi = APPROVAL_ABI_BY_STANDARD[approval.standard];
  if (!abi) return null;

  if (approval.standard === 'ERC1155') {
    return {
      address: approval.token,
      abi,
      functionName: 'setApprovalForAll',
      args: [spender, true],
    };
  }

  return {
    address: approval.token,
    abi,
    functionName: 'approve',
    args: [spender, BigInt(approval.amountOrTokenId)],
  };
};

/**
 * EVM (Robinhood) contribution flow — mirrors the Cardano `useTransaction` hook.
 *
 *  1. POST /contribute/:vaultId → creates one pending Transaction row with all
 *     assets in metadata (same behavior as Cardano).
 *  2. POST /blockchain/evm/contribution/prepare → backend signs one EIP-712
 *     ContributionAuthorization per asset and returns the list of approve/
 *     contribute calls the wallet must submit.
 *  3. For each asset: optional token `approve` (or `setApprovalForAll`), then
 *     `contributeNative/ERC20/ERC721/ERC1155` on the vault. All calls are sent
 *     sequentially so wallets like MetaMask can queue them cleanly.
 *  4. POST /blockchain/evm/contribution/confirm → backend stores tx hash and
 *     creates Asset rows via `TransactionsService.createAssets(txId)`. The
 *     final confirmation to `contributed` is later fired by the Alchemy webhook.
 */
export const useEvmContributeTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const { address: contributor, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const createContributionTx = useCreateContributionTx();

  const sendTransaction = useCallback(
    async ({ vaultId, selectedNFTs }) => {
      setError(null);
      setTxHash(null);

      if (!contributor) {
        const msg = 'Wallet not connected';
        setError(msg);
        toast.error(msg);
        return null;
      }

      let createdTxId = null;

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
        const { data: prepared } = await CoreApiProvider.prepareEvmContribution({ txId: createdTxId });
        const { vaultAddress, calls } = prepared;

        if (!Array.isArray(calls) || calls.length === 0) {
          throw new Error('No contribution calls returned by the backend');
        }

        // ── Step 3: ensure wallet is on the correct chain ──────────────────
        if (currentChainId !== robinhoodChain.id) {
          await switchChainAsync({ chainId: robinhoodChain.id });
        }

        // ── Step 4: submit approvals + contribute() one-by-one ─────────────
        setStatus('signing');
        const childTxHashes = [];
        let primaryHash = null;

        for (const call of calls) {
          const approvalReq = buildApprovalRequest(call.approval, vaultAddress);
          if (approvalReq) {
            const approvalHash = await writeContractAsync({
              ...approvalReq,
              account: contributor,
              chainId: robinhoodChain.id,
            });
            childTxHashes.push(approvalHash);
            await waitForTransactionReceipt(wagmiConfig, {
              hash: approvalHash,
              chainId: robinhoodChain.id,
            });
          }

          const authorization = normalizeAuthorization(call.authorization);
          const value = call.authorization.kind === AssetKind.Native ? BigInt(call.value ?? authorization.amount) : 0n;

          const hash = await writeContractAsync({
            address: vaultAddress,
            abi: VAULT_CONTRIBUTION_ABI,
            functionName: call.functionName,
            args: [authorization, call.signature],
            account: contributor,
            chainId: robinhoodChain.id,
            value,
          });
          childTxHashes.push(hash);
          primaryHash = hash;

          await waitForTransactionReceipt(wagmiConfig, {
            hash,
            chainId: robinhoodChain.id,
          });
        }

        // ── Step 5: confirm with backend ───────────────────────────────────
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
        const errorMessage = err?.response?.data?.message || err?.shortMessage || err?.message || 'Transaction failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px]', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [contributor, currentChainId, switchChainAsync, writeContractAsync, createContributionTx]
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
