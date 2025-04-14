import { useState, useCallback } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import { TransactionsApiProvider } from '@/services/api/transactions';
import { ContributeApiProvider } from '@/services/api/contribute';

export const useTransaction = () => {
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const wallet = useWallet();

  const sendTransaction = useCallback(async ({
    recipient,
    ada,
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

      if (!buildResult.data?.complete) {
        throw new Error('Failed to build transaction');
      }

      setStatus('signing');
      const signature = await wallet.handler.signTx(buildResult.data.complete);

      if (!signature) {
        throw new Error('Transaction signing was cancelled');
      }

      setStatus('submitting');
      const submitResult = await TransactionsApiProvider.submitTransaction({
        transaction: buildResult.data.complete,
        signatures: [signature],
      });

      setTxHash(submitResult.data?.hash);
      setStatus('success');
      return submitResult.data?.hash;
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setStatus('error');
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
