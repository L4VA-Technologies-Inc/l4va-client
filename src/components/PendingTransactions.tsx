import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { useMyPendingTransactions, useGenerateUpdateTransaction, useSubmitTransaction } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';

type Transaction = {
  id: string;
  utxo_input: string | null;
  utxo_output: string | null;
  utxo_ref: string | null;
  type: 'update-vault';
  amount: number | null;
  fee: number | null;
  tx_hash: string;
  status: 'waiting_owner';
  metadata: {
    policyId: string | null;
    vaultName: string;
    adminKeyHash: string;
    contractType: number;
    allowedPolicies: string[];
    customerAddress: string;
    acquireMultiplier: Array<[string, string | null, number]>;
    adaPairMultiplier: string;
  };
  vault_id: string;
  user_id: string;
  vault: {
    name: string;
  };
};

export const PendingTransactions = () => {
  const [status, setStatus] = useState<'idle' | 'building' | 'signing' | 'submitting'>('idle');
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);

  const wallet = useWallet('handler', 'isConnected');

  const { data, isLoading, error, refetch } = useMyPendingTransactions();
  const generateUpdateTx = useGenerateUpdateTransaction();
  const submitTransaction = useSubmitTransaction();

  const waitingTransactions: Transaction[] = data?.data || [];

  const handleSignTransaction = async (tx: Transaction) => {
    try {
      if (!wallet.isConnected || !wallet.handler) {
        toast.error('Please connect your wallet first');
        return;
      }

      setStatus('building');
      setProcessingTxId(tx.id);

      // 1. Generate the transaction hex
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const generateResult = await generateUpdateTx.mutateAsync(tx.id);

      if (!generateResult?.data?.presignedTx) {
        throw new Error('Failed to generate transaction - no transaction hex returned');
      }

      setStatus('signing');

      // 2. Sign the transaction
      const signedTx = await wallet.handler.signTx(generateResult.data.presignedTx, true);

      if (!signedTx) {
        throw new Error('Transaction signing was cancelled');
      }

      setStatus('submitting');

      // 3. Submit the signed transaction
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const submitResult = await submitTransaction.mutateAsync({
        transaction: generateResult.data.presignedTx,
        vaultId: tx.vault_id,
        txId: tx.id,
        signatures: [signedTx],
      });

      if (submitResult?.data?.txHash) {
        toast.success('Vault update transaction submitted successfully!', { id: 'tx-toast' });
      } else {
        toast.error('Transaction submitted but no hash returned', { id: 'tx-toast' });
      }

      // Refresh the list of transactions
      refetch();
    } catch (err: any) {
      console.error('Transaction signing error:', err);
      toast.error(err.message || 'Failed to sign transaction', { id: 'tx-toast' });
    } finally {
      setProcessingTxId(null);
      setStatus('idle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error.message}</div>;
  }

  if (!waitingTransactions.length) {
    return <div className="text-center p-8 text-dark-100">No transactions waiting for your signature</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Transactions Waiting for Signature</h2>
      {waitingTransactions.map(tx => (
        <div key={tx.id} className="bg-steel-850 p-4 rounded-lg">
          <div className="flex justify-between items-center flex-wrap">
            <div className="w-full md:w-3/4">
              <h3 className="font-medium">Vault: {tx.vault.name || 'Unknown'}</h3>
              <p className="text-dark-100 text-sm">Type: {tx.type}</p>

              {/* Показати деталі транзакції */}
              <div className="mt-2 text-sm">
                <p>Transaction details:</p>
                <ul className="list-disc list-inside pl-4">
                  {tx.metadata?.vaultName && (
                    <li>
                      Vault Name: {tx.metadata.vaultName.substring(0, 10)}...
                      {tx.metadata.vaultName.substring(tx.metadata.vaultName.length - 10)}
                    </li>
                  )}
                  {tx.metadata?.customerAddress && (
                    <li>
                      Address: {tx.metadata.customerAddress.substring(0, 10)}...
                      {tx.metadata.customerAddress.substring(tx.metadata.customerAddress.length - 10)}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="w-full md:w-1/4 flex justify-end mt-4 md:mt-0">
              <PrimaryButton
                onClick={() => handleSignTransaction(tx)}
                disabled={status !== 'idle' || processingTxId !== null}
                className="w-full md:w-auto"
              >
                {processingTxId === tx.id ? status.toUpperCase() : 'Submit'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
