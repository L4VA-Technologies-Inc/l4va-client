import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { BUTTON_DISABLE_THRESHOLD_MS } from '../vaults/constants/vaults.constants';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { formatNum } from '@/utils/core.utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAcquireTx, useBuildTransaction, useSubmitTransaction } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';

export const AcquireModal = ({ vault, onClose }) => {
  const { name } = vault;
  const [acquireAmount, setAcquireAmount] = useState(0);
  const { mutateAsync: createAcquireTx } = useCreateAcquireTx();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'isUpdatingUtxos');
  const [status, setStatus] = useState('idle');
  const buildTransaction = useBuildTransaction();
  const submitTransaction = useSubmitTransaction();

  const maxValue = Math.min(wallet.balanceAda || 0, 10000000);

  const acquireAmountNum = parseFloat(acquireAmount) || 0;

  // Est Vault Token (%) = Token for Acquirers % * (1-(LP % contribution/2))
  const estVaultTokenPercent = vault.tokensForAcquires * (1 - vault.liquidityPoolContribution / 100 / 2);

  // Est Vault Token Amount = Est Vault Token (%) x Token Supply
  const estVaultTokenAmount = Math.floor((estVaultTokenPercent / 100) * vault.ftTokenSupply);

  // Reserve ADA Amount calculation (based on vault's required reserve)
  const reserveAdaAmount = vault.requireReservedCostAda || 0;

  // Vault Allocation = Est Vault Token (%) above x [ADA Amount / Reserve ADA Amount]
  let vaultAllocation = 0;
  if (reserveAdaAmount > 0 && acquireAmountNum > 0) {
    vaultAllocation = (estVaultTokenPercent * (acquireAmountNum / reserveAdaAmount)).toFixed(2);
  }

  // Est. Vault Token Acquired = Vault Allocation x Token Supply
  const estimatedTickerVal = formatNum(Math.floor((vaultAllocation / 100) * vault.ftTokenSupply));

  const handleAcquire = async () => {
    try {
      if (!acquireAmount || parseFloat(acquireAmount) <= 0) return;

      const { data } = await createAcquireTx({
        vaultId: vault.id,
        assets: [
          {
            assetName: 'lovelace',
            policyId: 'lovelace',
            type: 'ADA',
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

      if (submitResult.data?.txHash) {
        toast.success('Acquisition completed successfully');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Acquisition failed');
    } finally {
      setStatus('idle');
    }
  };

  const handleAmountChange = e => {
    let value = e.target.value;

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');

    if (value.includes('.')) {
      const [int, dec] = value.split('.');
      value = int + '.' + dec.slice(0, 2);
    }

    if (Number(value) > maxValue) {
      value = maxValue.toFixed(2);
    }

    setAcquireAmount(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 bg-steel-950 text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Acquire {name}</DialogTitle>
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
                  onChange={handleAmountChange}
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.min(parseFloat(acquireAmount || 0) + 1, maxValue);
                      setAcquireAmount(newValue.toString());
                    }}
                    className="p-1 hover:bg-steel-700 rounded transition-colors"
                  >
                    <ChevronUp className="transition-transform duration-200" size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.max(parseFloat(acquireAmount || 0) - 1, 0);
                      setAcquireAmount(newValue.toString());
                    }}
                    className="p-1 hover:bg-steel-700 rounded transition-colors"
                  >
                    <ChevronDown className="transition-transform duration-200" size={20} />
                  </button>
                </div>
                <span className="text-2xl font-bold">ADA</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-[#2f324c] pt-6">
              <div className="text-center">
                {/* Total ADA Sent by Vault Token Acquirers up until now */}
                <p className="text-dark-100 text-sm">Total ADA Sent</p>
                <p className="text-xl font-medium">{formatNum(vault.assetsPrices.totalAcquiredAda)}</p>
              </div>
              <div className="text-center">
                {/* Total Vault Token % of supply available to Acquirers */}
                <p className="text-dark-100 text-sm">Est. Vault Token (%)</p>
                <p className="text-xl font-medium">{estVaultTokenPercent.toFixed(2)}%</p>
              </div>
              <div className="text-center">
                {/* Total Vault Token quantity available to Acquirers */}
                <p className="text-dark-100 text-sm">Est. Vault Token Amount</p>
                <p className="text-xl font-medium">{estVaultTokenAmount}</p>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 md:pl-6 md:border-l border-[#2f324c]">
            <div className="bg-slate-950 p-6 rounded-[10px]">
              <h2 className="text-xl text-center font-medium mb-8">Acquire</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 text-center">
                  {/* ADA Amount to send to acquire Vault Tokens */}
                  <p className="text-dark-100 text-sm">ADA Amount</p>
                  <p className="text-2xl font-medium">{formatNum(acquireAmountNum)}</p>
                </div>
                <div className="space-y-1 text-center ">
                  {/* 
                    Estimated % of total Vault Token to be acquired, assuming the total ADA sent is equal to the reseve.
                    Note: If more than the reserve amount is sent, the % of vault token received will reduce.
                  */}
                  <p className="text-dark-100 text-sm">Est. Vault Token Allocation (%)</p>
                  <p className="text-2xl font-medium">{vaultAllocation}%</p>
                </div>
                <div className="space-y-1 text-center">
                  {/*  /!* */}
                  {/*    Estimated quantity of total Vault Token to be acquired, assuming the total ADA sent is equal to the reseve.*/}
                  {/*    Note: If more than the reserve amount is sent, the quantity of vault token received will reduce.*/}
                  {/* *!/*/}
                  <p className="text-dark-100 text-sm">Est. Vault Token Acquired</p>
                  <p className="text-2xl font-medium truncate">{estimatedTickerVal}</p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <PrimaryButton
                  className="uppercase"
                  disabled={
                    status !== 'idle' ||
                    wallet.isUpdatingUtxos ||
                    new Date(vault.acquirePhaseStart).getTime() + vault.acquireWindowDuration <
                      Date.now() + BUTTON_DISABLE_THRESHOLD_MS
                  }
                  onClick={handleAcquire}
                  icon={status !== 'idle' ? Spinner : null}
                >
                  {wallet.isUpdatingUtxos ? 'Updating UTXOs...' : status === 'idle' ? 'ACQUIRE' : status.toUpperCase()}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
