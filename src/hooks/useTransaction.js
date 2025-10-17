import { useState, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { useCreateContributionTx, useBuildTransaction, useSubmitTransaction } from '@/services/api/queries';

export const useTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const wallet = useWallet();
  const createContributionTx = useCreateContributionTx();
  const buildTransaction = useBuildTransaction();
  const submitTransaction = useSubmitTransaction();

  const sendTransaction = useCallback(
    async ({ recipient, vaultId, selectedNFTs }) => {
      try {
        setError(null);
        setTxHash(null);

        if (!wallet.isConnected || !wallet.handler) {
          throw new Error('Wallet not connected');
        }

        const { data } = await createContributionTx.mutateAsync({
          vaultId,
          assets: selectedNFTs.map(nft => ({
            policyId: nft.metadata.policyId,
            type: nft.isNft ? 'nft' : 'ft',
            assetName: nft.metadata.assetName,
            quantity: nft.quantity,
            metadata: nft.metadata,
          })),
        });

        const changeAddress = await wallet.handler.getChangeAddressBech32();

        setStatus('building');

        const buildResult = await buildTransaction.mutateAsync({
          changeAddress,
          vaultId,
          txId: data.txId,
          outputs: [
            {
              address: recipient,
              assets: selectedNFTs.map(nft => ({
                policyId: nft.metadata.policyId,
                assetName: nft.metadata.assetName,
                quantity: nft.quantity,
                metadata: nft.metadata,
              })),
            },
          ],
        });

        if (!buildResult.data?.presignedTx) {
          throw new Error('Failed to build transaction');
        }

        setStatus('signing');
        const signature = await wallet.handler.signTx(buildResult.data.presignedTx, true);

        if (!signature) {
          throw new Error('Transaction signing was cancelled');
        }

        setStatus('submitting');
        const submitResult = await submitTransaction.mutateAsync({
          transaction: buildResult.data.presignedTx,
          vaultId: vaultId,
          txId: data.txId,
          signatures: [signature],
        });

        const hash = submitResult.data?.hash;
        setTxHash(hash);
        toast.success('Transaction completed successfully');
        setStatus('idle');
        return hash;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Transaction failed';
        setError(errorMessage);
        toast.error(errorMessage, { className: '!max-w-[700px] ', duration: 10000 });
        setStatus('idle');
        return null;
      }
    },
    [wallet, createContributionTx, buildTransaction, submitTransaction]
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
