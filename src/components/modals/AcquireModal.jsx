import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { formatNum, formatCompactNumber } from '@/utils/core.utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAcquireTx, useBuildTransaction, useSubmitTransaction } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';

export const AcquireModal = ({ vault, onClose }) => {
  const { vaultName } = vault;
  const [acquireAmount, setAcquireAmount] = useState(0);
  const { mutateAsync: createAcquireTx } = useCreateAcquireTx();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded');
  const [status, setStatus] = useState('idle');
  const buildTransaction = useBuildTransaction();
  const submitTransaction = useSubmitTransaction();

  const totalAcquired = 13025.0;
  const assetsOffered = 50;
  const currentVaultTVL = 16050.0;
  const estimatedValue = acquireAmount ? parseFloat(acquireAmount) * 3.5 : 0;
  const estimatedTickerVal = acquireAmount ? parseFloat(acquireAmount) * 40.35 : 0;
  const vaultAllocation = acquireAmount ? '1%' : '0%';

  const handleAcquire = async () => {
    try {
      if (!acquireAmount || parseFloat(acquireAmount) <= 0) return;

      const { data } = await createAcquireTx({
        vaultId: vault.id,
        assets: [
          {
            assetName: 'lovelace',
            policyId: 'lovelace',
            quantity: Number(acquireAmount),
          },
        ],
      });

      const changeAddress = await wallet.handler.getChangeAddressBech32();

      setStatus('building');

      const buildResult = await buildTransaction.mutateAsync({
        changeAddress,
        vaultId: vault.id,
        txId: data.txId,
        outputs: [
          {
            assets: data.assets,
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
        vaultId: vault.id,
        txId: data.txId,
        signatures: [signature],
      });

      if (submitResult.data?.hash) {
        toast.success('Acquisition completed successfully');
        onClose();
      }
    } catch (err) {
      console.error('Acquisition error:', err);
      toast.error(err.message || 'Acquisition failed');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 bg-steel-950 text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Acquire {vaultName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col p-6 space-y-6 md:space-y-0 md:flex-row">
          <div className="md:w-1/2 pr-0 md:pr-6 space-y-6">
            <div className="flex justify-between items-center">
              <span>ADA in wallet</span>
              <span className="font-bold">{formatNum(wallet.balanceAda || 0)} ADA</span>
            </div>
            <div className="bg-steel-850 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Acquire</h3>
              <div className="flex items-center gap-4">
                <input
                  className="bg-transparent text-4xl w-full outline-none font-bold"
                  type="text"
                  value={acquireAmount}
                  onChange={e => setAcquireAmount(e.target.value)}
                />
                <span className="text-2xl font-bold">ADA</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-[#2f324c] pt-6">
              <div className="text-center">
                <p className="text-dark-100 text-sm">Total ADA Acquired</p>
                <p className="text-xl font-medium">{formatNum(totalAcquired)}</p>
              </div>
              <div className="text-center">
                <p className="text-dark-100 text-sm">% Assets Offered</p>
                <p className="text-xl font-medium">{assetsOffered}%</p>
              </div>
              <div className="text-center">
                <p className="text-dark-100 text-sm">Current Vault TVL</p>
                <p className="text-xl font-medium">{formatCompactNumber(currentVaultTVL)}</p>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 md:pl-6 md:border-l border-[#2f324c]">
            <div className="bg-slate-950 p-6 rounded-[10px]">
              <h2 className="text-xl text-center font-medium mb-8">Acquire</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Total ADA Acquired</p>
                  <p className="text-2xl font-medium">{formatNum(totalAcquired)}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Vault Allocation</p>
                  <p className="text-2xl font-medium">{vaultAllocation}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Estimated Value</p>
                  <p className="text-2xl font-medium">${formatNum(estimatedValue)}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Estimated TICKER VAL ($VLRM)</p>
                  <p className="text-2xl font-medium">{formatNum(estimatedTickerVal)}</p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <PrimaryButton
                  className="uppercase"
                  disabled={status !== 'idle'}
                  onClick={handleAcquire}
                  icon={status !== 'idle' ? Spinner : null}
                >
                  {status === 'idle' ? 'ACQUIRE' : status.toUpperCase()}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
