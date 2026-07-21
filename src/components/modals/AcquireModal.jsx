import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { robinhoodChain } from '@/lib/evm/wagmi.config';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { formatNum } from '@/utils/core.utils';
import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAcquireTx, useBuildTransaction, useSubmitTransaction } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';

export const AcquireModal = ({ vault, onClose }) => {
  const { name, tokensForAcquires, liquidityPoolContribution, ftTokenSupply } = vault;
  const { currencySymbol, pickByCurrency } = useCurrency();
  const [acquireAmount, setAcquireAmount] = useState(0);
  const { mutateAsync: createAcquireTx } = useCreateAcquireTx();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'isUpdatingUtxos');
  const [status, setStatus] = useState('idle');
  const buildTransaction = useBuildTransaction();
  const submitTransaction = useSubmitTransaction();

  // ── Chain awareness ────────────────────────────────────────────────────
  // Robinhood vaults are acquired with ETH (EVM), everything else with ADA.
  const isEth = vault?.chainType === 'robinhood';
  const assetSymbol = isEth ? 'ETH' : 'ADA';
  // Chain-appropriate input ergonomics: ETH is fractional, ADA is coarse.
  const minAcquire = isEth ? 0.001 : 5;
  const stepAmount = isEth ? 0.01 : 1;
  const maxInputDecimals = isEth ? 6 : 2;

  // ETH balance comes from the wagmi wallet; ADA from the weld wallet.
  const { address: evmAddress } = useAccount();
  const { data: ethBalance } = useBalance({
    address: evmAddress,
    chainId: robinhoodChain.id,
    query: { enabled: isEth && Boolean(evmAddress) },
  });
  // wagmi v3 dropped `data.formatted`; format the raw bigint `value` ourselves.
  const ethBalanceNum = ethBalance ? Number(formatUnits(ethBalance.value, ethBalance.decimals)) : 0;
  const walletBalance = isEth ? ethBalanceNum : wallet.balanceAda || 0;

  // Use vault-specific max acquire amount if available, otherwise no practical cap
  // for ETH / fallback to 10M ADA for Cardano.
  const maxAcquireAmount = isEth
    ? vault.maxAcquireAmountEth || Number.MAX_SAFE_INTEGER
    : vault.maxAcquireAmountAda || 10000000;
  // Keep ADA integer-floored (existing behaviour); ETH keeps its fractional precision.
  const cappedMax = Math.min(walletBalance, maxAcquireAmount);
  const maxValue = isEth ? cappedMax : Math.floor(cappedMax);

  const acquireAmountNum = parseFloat(acquireAmount) || 0;

  // TVL (Total Value Locked) - the value of contributed assets, in the chain's native unit
  const tvl = isEth ? vault.assetsPrices?.totalValueEth || 0 : vault.assetsPrices?.totalValueAda || 0;
  const totalAcquired = isEth ? vault.assetsPrices?.totalAcquiredEth || 0 : vault.assetsPrices?.totalAcquiredAda || 0;

  // Fair value = expected total if FDV equals TVL
  // e.g., if TVL = 10,000 and tokensForAcquires = 50%, fairValue = 5,000
  const fairValue = tvl * (tokensForAcquires / 100);

  // Calculate user share based on fair value projection or actual total acquired
  // - Before fair value is reached: project based on fair value (more intuitive estimate)
  // - After fair value exceeded: use actual total (reflects real dilution)
  let userShare = 0;
  if (acquireAmountNum > 0 && fairValue > 0) {
    // Total that would be in the pool after this acquisition
    const totalAfterAcquisition = totalAcquired + acquireAmountNum;

    if (totalAfterAcquisition >= fairValue) {
      // Total would exceed fair value - use actual amounts
      userShare = acquireAmountNum / totalAfterAcquisition;
    } else {
      // Total below fair value - project as if fair value will be reached
      userShare = acquireAmountNum / fairValue;
    }
  }

  // Net % available for acquirers (after LP contribution)
  const totalAvailableTokenPercent = tokensForAcquires * (1 - liquidityPoolContribution / 100 / 2);
  const totalAvailableTokenAmount = Math.floor((totalAvailableTokenPercent / 100) * ftTokenSupply);

  // Est Vault Token (%) = user's share of the acquirer pool
  const estVaultTokenPercent = totalAvailableTokenPercent * userShare;
  // Est Vault Token Amount = estimated token amount user will receive
  const estVaultTokenAmount = Math.floor(totalAvailableTokenAmount * userShare);

  const handleAcquire = async () => {
    setStatus('building');

    try {
      if (!acquireAmount || parseFloat(acquireAmount) <= 0) return;

      const { data } = await createAcquireTx({
        vaultId: vault.id,
        assets: [
          isEth
            ? {
                assetName: 'eth',
                policyId: 'eth',
                type: 'ETH',
                quantity: Number(acquireAmount),
              }
            : {
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
      value = int + '.' + dec.slice(0, maxInputDecimals);
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
              <span>{assetSymbol} in wallet</span>
              <span className="font-bold">
                {formatNum(walletBalance, isEth ? 6 : 2)} {assetSymbol}
              </span>
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
                      const newValue = Math.min(parseFloat(acquireAmount || 0) + stepAmount, maxValue);
                      setAcquireAmount(newValue.toString());
                    }}
                    className="p-1 hover:bg-steel-700 rounded transition-colors"
                  >
                    <ChevronUp className="transition-transform duration-200" size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.max(parseFloat(acquireAmount || 0) - stepAmount, 0);
                      setAcquireAmount(newValue.toString());
                    }}
                    className="p-1 hover:bg-steel-700 rounded transition-colors"
                  >
                    <ChevronDown className="transition-transform duration-200" size={20} />
                  </button>
                </div>
                <span className="text-2xl font-bold">{assetSymbol}</span>
              </div>
              {acquireAmountNum > 0 && acquireAmountNum < minAcquire && (
                <div className="mt-3 text-xs text-yellow-400">
                  Minimum {minAcquire} {assetSymbol} required to cover transaction fees and ensure meaningful vault
                  token allocation
                </div>
              )}
              {!isEth && maxAcquireAmount < 10000000 && (
                <div className="mt-3 text-xs text-zinc-400">
                  Maximum acquire limit for this vault: {formatNum(maxAcquireAmount)} {assetSymbol} per transaction
                </div>
              )}
              {acquireAmountNum > maxAcquireAmount && (
                <div className="mt-3 text-xs text-red-400">
                  Amount exceeds maximum limit of {formatNum(maxAcquireAmount)} {assetSymbol} per transaction
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-950 p-6 rounded-[10px]">
            <h2 className="text-xl text-center font-medium mb-8">Acquire</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-dark-100 text-sm flex items-center justify-center gap-1.5">
                  Est. Vault Token (%)
                  <HoverHelp
                    hint={`Your estimated share of vault tokens as a percentage, based on your ${assetSymbol} amount relative to total ${assetSymbol} from acquirers (or fair value).`}
                  />
                </p>
                <p className="text-xl font-medium">{estVaultTokenPercent.toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-dark-100 text-sm flex items-center justify-center gap-1.5">
                  Est. Vault Token Amount
                  <HoverHelp hint="Estimated number of vault tokens you will receive for this acquisition." />
                </p>
                <p className="text-xl font-medium">{formatNum(estVaultTokenAmount)}</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-dark-100 text-sm m-0 flex items-center justify-center gap-1.5">
                  Total % available for acquirers
                  <HoverHelp hint="Net percentage of vault token supply allocated to acquirers after the liquidity pool share is reserved." />
                </p>
                <p className="text-xl font-medium">{formatNum(totalAvailableTokenPercent)}%</p>
              </div>
              <div className="text-center">
                <p className="text-dark-100 text-sm flex items-center justify-center gap-1.5">
                  Total {assetSymbol} sent by acquirers
                  <HoverHelp hint="Total amount all acquirers have sent to this vault so far." />
                </p>
                <p className="text-xl font-medium">
                  {currencySymbol}
                  {formatNum(
                    pickByCurrency({
                      ada: vault.assetsPrices?.totalAcquiredAda,
                      usd: vault.assetsPrices?.totalAcquiredUsd,
                      eth: vault.assetsPrices?.totalAcquiredEth,
                    })
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center mt-8 gap-2">
              <PrimaryButton
                className="uppercase"
                disabled={
                  status !== 'idle' ||
                  (!isEth && wallet.isUpdatingUtxos) ||
                  acquireAmountNum < minAcquire ||
                  !vault.isAcquireWindowActive
                }
                onClick={handleAcquire}
                icon={status !== 'idle' ? Spinner : null}
              >
                {!isEth && wallet.isUpdatingUtxos
                  ? 'Updating UTXOs...'
                  : status === 'idle'
                    ? 'ACQUIRE'
                    : status.toUpperCase()}
              </PrimaryButton>
              {!isEth &&
                <div className="text-xs text-dark-100">
                  Transaction cost:{' '}
                  <span className="text-white font-medium">
                    ~{((vault.protocolAcquiresFeeAda || 0) + 1.72).toFixed(2)} ADA
                  </span>{' '}
                  (
                  {vault.protocolAcquiresFeeAda > 0
                    ? `${vault.protocolAcquiresFeeAda?.toFixed(2)} ADA Protocol fees + ~1.72 ADA Network fees`
                    : '~1.72 ADA Network fees'}
                  )
                </div>
              }
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
