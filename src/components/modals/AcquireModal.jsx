import { useState, useMemo } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, parseEther } from 'viem';
import toast from 'react-hot-toast';
import { ChevronUp, ChevronDown, ArrowLeftRight } from 'lucide-react';

import { robinhoodChain } from '@/lib/evm/wagmi.config';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { formatNum } from '@/utils/core.utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useEvmAcquireTransaction } from '@/hooks/useEvmAcquireTransaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAcquireTx, useBuildTransaction, useSubmitTransaction } from '@/services/api/queries';
import { Spinner } from '@/components/Spinner';

export const AcquireModal = ({ vault, onClose }) => {
  const { name, tokensForAcquires, liquidityPoolContribution, ftTokenSupply } = vault;
  const { currencySymbol, pickByCurrency } = useCurrency();
  const [acquireAmount, setAcquireAmount] = useState(0);
  const [inputCurrency, setInputCurrency] = useState('native'); // 'native' (ETH/ADA) or 'usd'
  const { mutateAsync: createAcquireTx } = useCreateAcquireTx();
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'isUpdatingUtxos');
  const [status, setStatus] = useState('idle');
  const buildTransaction = useBuildTransaction();
  const submitTransaction = useSubmitTransaction();
  const evmAcquire = useEvmAcquireTransaction();

  // ── Chain awareness ────────────────────────────────────────────────────
  // Robinhood vaults are acquired with ETH (EVM), everything else with ADA.
  const isEth = vault?.chainType === 'robinhood';
  const assetSymbol = isEth ? 'ETH' : 'ADA';
  // Chain-appropriate input ergonomics: ETH is fractional, ADA is coarse.
  const minAcquire = isEth ? 0.001 : 5;
  const stepAmount = isEth ? 0.01 : 1;
  const maxInputDecimals = isEth ? 6 : 2;

  // ── Price calculation for USD input mode ───────────────────────────────
  // Derive current prices from vault data (totalValueUsd / totalValueNative)
  // TODO: Replace with real-time price API endpoint for better accuracy
  const nativePrice = useMemo(() => {
    const totalUsd = vault.assetsPrices?.totalValueUsd || 0;
    const totalNative = isEth ? vault.assetsPrices?.totalValueEth || 0 : vault.assetsPrices?.totalValueAda || 0;

    if (totalUsd > 0 && totalNative > 0) {
      return totalUsd / totalNative;
    }

    // Fallback to approximate prices if vault data unavailable
    return isEth ? 3000 : 0.35; // Approximate ETH ~$3000, ADA ~$0.35
  }, [vault.assetsPrices, isEth]);

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
  const maxAcquireAmount = isEth ? 100 : vault.maxAcquireAmountAda || 10000000;
  // Keep ADA integer-floored (existing behaviour); ETH keeps its fractional precision.
  const cappedMax = Math.min(walletBalance, maxAcquireAmount);
  const maxValue = isEth ? cappedMax : Math.floor(cappedMax);

  const acquireAmountNum = parseFloat(acquireAmount) || 0;

  // ── Currency conversion ────────────────────────────────────────────────
  // Convert between USD and native (ETH/ADA) based on input mode
  const nativeAmount = inputCurrency === 'usd' ? acquireAmountNum / nativePrice : acquireAmountNum;
  const usdAmount = inputCurrency === 'native' ? acquireAmountNum * nativePrice : acquireAmountNum;

  // Use native amount for all calculations (TVL comparison, share calculation)
  const effectiveAmount = nativeAmount;

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
  if (effectiveAmount > 0 && fairValue > 0) {
    // Total that would be in the pool after this acquisition
    const totalAfterAcquisition = totalAcquired + effectiveAmount;

    if (totalAfterAcquisition >= fairValue) {
      // Total would exceed fair value - use actual amounts
      userShare = effectiveAmount / totalAfterAcquisition;
    } else {
      // Total below fair value - project as if fair value will be reached
      userShare = effectiveAmount / fairValue;
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
    if (!acquireAmount || parseFloat(acquireAmount) <= 0) return;

    // ── EVM (Robinhood) branch ─────────────────────────────────────────────
    // On the V3 vault, "acquire" is contributeNative() with value = ETH wei
    // during the AcquireWindow. Backend signs the authorization; wallet just
    // submits the payable call.
    if (isEth) {
      setStatus('building');
      // Use nativeAmount (converted from USD if needed) and convert to wei
      const weiAmount = parseEther(String(nativeAmount));
      const hash = await evmAcquire.sendTransaction({
        vaultId: vault.id,
        amountWei: weiAmount.toString(), // Send wei as string to preserve precision
      });
      setStatus('idle');
      if (hash) onClose();
      return;
    }

    // ── Cardano branch ─────────────────────────────────────────────────────
    setStatus('building');

    try {
      // Use nativeAmount (converted from USD if needed) and convert ADA to lovelace (1 ADA = 1,000,000 lovelace)
      const lovelaceAmount = Math.floor(nativeAmount * 1000000);

      const { data } = await createAcquireTx({
        vaultId: vault.id,
        assets: [
          {
            assetName: 'lovelace',
            policyId: 'lovelace',
            type: 'ADA',
            quantity: lovelaceAmount, // Send raw lovelace units
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
      // In USD mode, allow 2 decimals; in native mode, use chain-specific decimals
      const decimals = inputCurrency === 'usd' ? 2 : maxInputDecimals;
      value = int + '.' + dec.slice(0, decimals);
    }

    // Validate max value based on current input currency
    const numValue = Number(value);
    if (inputCurrency === 'native') {
      // Direct native input - check against maxValue
      if (numValue > maxValue) {
        value = maxValue.toString();
      }
    } else {
      // USD input - convert to native and check
      const nativeEquivalent = numValue / nativePrice;
      if (nativeEquivalent > maxValue) {
        value = (maxValue * nativePrice).toFixed(2);
      }
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Acquire</h3>
                <button
                  type="button"
                  onClick={() => {
                    // Toggle between native and USD input
                    const newMode = inputCurrency === 'native' ? 'usd' : 'native';
                    setInputCurrency(newMode);
                    // Convert the current input value to the new currency
                    if (acquireAmountNum > 0) {
                      const converted = newMode === 'usd' ? nativeAmount * nativePrice : usdAmount / nativePrice;
                      setAcquireAmount(converted.toFixed(newMode === 'usd' ? 2 : maxInputDecimals));
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-steel-700 rounded transition-colors"
                >
                  <ArrowLeftRight size={14} />
                  {inputCurrency === 'native' ? assetSymbol : 'USD'} →{' '}
                  {inputCurrency === 'native' ? 'USD' : assetSymbol}
                </button>
              </div>
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
                <span className="text-2xl font-bold">{inputCurrency === 'native' ? assetSymbol : 'USD'}</span>
              </div>
              {acquireAmountNum > 0 && (
                <div className="mt-2 text-sm text-zinc-400">
                  ≈{'  '}
                  {inputCurrency === 'native'
                    ? `$${usdAmount.toFixed(2)}`
                    : `${nativeAmount.toFixed(isEth ? 6 : 2)} ${assetSymbol}`}
                </div>
              )}
              {effectiveAmount > 0 && effectiveAmount < minAcquire && (
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
              {effectiveAmount > maxAcquireAmount && (
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
                  effectiveAmount < minAcquire ||
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
              {!isEth && (
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
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
