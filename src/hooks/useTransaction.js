import { useState, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { TransactionsApiProvider } from '@/services/api/transactions';
import { ContributeApiProvider } from '@/services/api/contribute';

export const useTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const wallet = useWallet();

  const sendTransaction = useCallback(async ({
    recipient,
    vaultId,
    selectedNFTs,
  }) => {
    try {
      setError(null);
      setTxHash(null);

      if (!wallet.isConnected || !wallet.handler) {
        throw new Error('Wallet not connected');
      }

      const { data } = await ContributeApiProvider.createContributionTx({
        vaultId,
        assets: selectedNFTs.map(nft => ({
          policyId: nft.policyId,
          assetName: nft.assetName,
          quantity: nft.quantity,
        })),
      });

      const changeAddress = await wallet.handler.getChangeAddressBech32();

      setStatus('building');

      const buildResult = await TransactionsApiProvider.buildTransaction({
        changeAddress,
        vaultId,
        txId: data.txId,
        outputs: [{
          address: recipient,
          assets: selectedNFTs.map(nft => ({
            policyId: nft.policyId,
            assetName: nft.assetName,
            quantity: nft.quantity,
          })),
        }],
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
      const submitResult = await TransactionsApiProvider.submitTransaction({
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
      console.error('Transaction error:', err);
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setStatus('idle');
      return null;
    }
  }, [wallet]);

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
