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
  const { name, tokensForAcquires, liquidityPoolContribution, ftTokenSupply } = vault;
  const [acquireAmount, setAcquireAmount] = useState(0);
  const { mutateAsync: createAcquireTx } = useCreateAcquireTx();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'isUpdatingUtxos');
  const [status, setStatus] = useState('idle');
  const buildTransaction = useBuildTransaction();
  const submitTransaction = useSubmitTransaction();

  // Use vault-specific max acquire amount if available, otherwise fallback to 10M ADA
  const maxAcquireAmount = vault.maxAcquireAmountAda || 10000000;
  const maxValue = Math.floor(Math.min(wallet.balanceAda || 0, maxAcquireAmount));

  const acquireAmountNum = parseFloat(acquireAmount) || 0;

  const userShare =
    acquireAmountNum > 0 ? acquireAmountNum / (vault.assetsPrices.totalAcquiredAda + acquireAmountNum) : 0;

  const totalAvailableTokenPercent = tokensForAcquires * (1 - liquidityPoolContribution / 100 / 2);
  const totalAvailableTokenAmount = Math.floor((totalAvailableTokenPercent / 100) * ftTokenSupply);

  // Est Vault Token (%) = Token for Acquirers % * (1-(LP % contribution/2))
  const estVaultTokenPercent = totalAvailableTokenPercent * userShare;
  // Est Vault Token Amount = Est Vault Token (%) x Token Supply
  const estVaultTokenAmount = Math.floor(totalAvailableTokenAmount * userShare);

  const handleAcquire = async () => {
    setStatus('building');

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
      value = maxValue.toString();
    }

    setAcquireAmount(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 bg-steel-950 text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Acquire {name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col p-6 space-y-6">
          <div className="space-y-6">
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
              {acquireAmountNum > 0 && acquireAmountNum < 5 && (
                <div className="mt-3 text-xs text-yellow-400">
                  Minimum 5 ADA required to cover transaction fees and ensure meaningful vault token allocation
                </div>
              )}
              {maxAcquireAmount < 10000000 && (
                <div className="mt-3 text-xs text-zinc-400">
                  Maximum acquire limit for this vault: {formatNum(maxAcquireAmount)} ADA per transaction
                </div>
              )}
              {acquireAmountNum > maxAcquireAmount && (
                <div className="mt-3 text-xs text-red-400">
                  Amount exceeds maximum limit of {formatNum(maxAcquireAmount)} ADA per transaction
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-950 p-6 rounded-[10px]">
            <h2 className="text-xl text-center font-medium mb-8">Acquire</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1 text-center">
                {/* ADA Amount to send to acquire Vault Tokens */}
                <p className="text-dark-100 text-sm">ADA Amount</p>
                <p className="text-2xl font-medium">{formatNum(acquireAmountNum)}</p>
              </div>
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

            <div className="flex flex-col items-center mt-8 gap-2">
              <PrimaryButton
                className="uppercase"
                disabled={
                  status !== 'idle' ||
                  wallet.isUpdatingUtxos ||
                  acquireAmountNum < 5 ||
                  new Date(vault.acquirePhaseStart).getTime() + vault.acquireWindowDuration <
                    Date.now() + BUTTON_DISABLE_THRESHOLD_MS
                }
                onClick={handleAcquire}
                icon={status !== 'idle' ? Spinner : null}
              >
                {wallet.isUpdatingUtxos ? 'Updating UTXOs...' : status === 'idle' ? 'ACQUIRE' : status.toUpperCase()}
              </PrimaryButton>
              <div className="text-xs text-dark-100">
                Transaction cost:{' '}
                <span className="text-white font-medium">
                  ~{((vault.protocolContributorsFeeAda || 0) + 0.77).toFixed(2)} ADA
                </span>{' '}
                (
                {vault.protocolContributorsFeeAda > 0
                  ? `${vault.protocolContributorsFeeAda?.toFixed(2)} ADA Protocol fees + ~0.77 ADA Network fees`
                  : '~0.77 ADA Network fees'}
                )
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
