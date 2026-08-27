import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import {
  useAccount,
  useBalance,
  useReadContract,
  useSendTransaction,
  useSignTypedData,
  useSwitchChain,
} from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { Spinner } from '@/components/Spinner';
import { useModalControls } from '@/lib/modals/modal.context';
import { robinhoodUniswapChain, wagmiConfig } from '@/lib/evm/wagmi.config';
import { UniswapApiProvider } from '@/services/api/uniswap';

const NATIVE_ETH = '0x0000000000000000000000000000000000000000';
const AMM_ROUTINGS = new Set(['CLASSIC', 'WRAP', 'UNWRAP', 'BRIDGE']);
const UX_ROUTINGS = new Set(['DUTCH_V2', 'DUTCH_V3', 'PRIORITY']);

const SLIPPAGE_OPTIONS = [
  { label: '0.5%', value: 0.5 },
  { label: '1%', value: 1 },
  { label: '3%', value: 3 },
];

function truncateAddr(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmount(raw, decimals, maxFrac = 6) {
  if (raw == null) return '—';
  try {
    const n = Number(formatUnits(BigInt(raw), decimals));
    if (!Number.isFinite(n)) return '—';
    if (n === 0) return '0';
    if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return n.toLocaleString(undefined, { maximumFractionDigits: maxFrac });
  } catch {
    return '—';
  }
}

function apiErrorMessage(err) {
  const data = err?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.message?.message === 'string') return data.message.message;
  if (typeof data?.detail === 'string') return data.detail;
  return err?.message || 'Swap failed';
}

function toTxRequest(tx, chainId) {
  if (!tx?.to || !tx?.data) {
    throw new Error('Invalid transaction payload from Uniswap API');
  }
  if (tx.data === '0x' || tx.data === '') {
    throw new Error('Transaction data is empty');
  }
  return {
    to: tx.to,
    data: tx.data,
    value: tx.value != null ? BigInt(tx.value) : 0n,
    ...(tx.gasLimit ? { gas: BigInt(tx.gasLimit) } : {}),
    ...(tx.maxFeePerGas ? { maxFeePerGas: BigInt(tx.maxFeePerGas) } : {}),
    ...(tx.maxPriorityFeePerGas ? { maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas) } : {}),
    ...(tx.gasPrice && !tx.maxFeePerGas ? { gasPrice: BigInt(tx.gasPrice) } : {}),
    chainId: tx.chainId ?? chainId,
  };
}

/**
 * Robinhood retail swap panel via Uniswap Trading API
 * (quote → permit → /swap or /order → wallet broadcast).
 */
export function UniswapSwapPanel({
  tokenAddress,
  tokenSymbol = 'TOKEN',
  tokenDecimals: tokenDecimalsProp,
  tokenImage,
}) {
  const { openModal } = useModalControls();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { signTypedDataAsync } = useSignTypedData();

  const [side, setSide] = useState('buy'); // buy = ETH→token, sell = token→ETH
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [quotePreview, setQuotePreview] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState(null);

  const token = tokenAddress;
  const tokenIn = side === 'buy' ? NATIVE_ETH : token;
  const tokenOut = side === 'buy' ? token : NATIVE_ETH;
  const targetChainId = apiConfig?.chainId || robinhoodUniswapChain.id;

  const { data: tokenDecimalsOnchain } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: targetChainId,
    query: { enabled: Boolean(token) },
  });

  const decimalsIn = side === 'buy' ? 18 : Number(tokenDecimalsProp ?? tokenDecimalsOnchain ?? 18);
  const decimalsOut = side === 'buy' ? Number(tokenDecimalsProp ?? tokenDecimalsOnchain ?? 18) : 18;

  const { data: ethBalance } = useBalance({
    address,
    chainId: targetChainId,
    query: { enabled: Boolean(address) },
  });

  const { data: tokenBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: targetChainId,
    query: { enabled: Boolean(address && token) },
  });

  const balanceRaw = side === 'buy' ? ethBalance?.value : tokenBalance;
  const balanceLabel = formatAmount(balanceRaw?.toString(), decimalsIn, 4);

  useEffect(() => {
    let cancelled = false;
    UniswapApiProvider.getConfig()
      .then(cfg => {
        if (!cancelled) setApiConfig(cfg);
      })
      .catch(() => {
        if (!cancelled) setApiConfig(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setQuotePreview(null);
    const trimmed = amountIn.trim();
    if (!trimmed || !address || !isConnected || Number(trimmed) <= 0) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const amount = parseUnits(trimmed, decimalsIn).toString();
        const data = await UniswapApiProvider.quote({
          tokenIn,
          tokenOut,
          amount,
          swapper: address,
          type: 'EXACT_INPUT',
          slippageTolerance: slippage,
        });
        if (cancelled) return;
        const outAmount = data?.quote?.output?.amount;
        const feeOut = (data?.quote?.aggregatedOutputs || []).find(o => o.fee === 'INTEGRATOR');
        setQuotePreview({
          routing: data.routing,
          amountOut: outAmount,
          feeAmount: feeOut?.amount,
          requestId: data.requestId,
        });
      } catch (err) {
        if (!cancelled) {
          setQuotePreview(null);
          // Quiet during typing; only surface on submit
          console.warn('Uniswap quote preview failed', apiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountIn, address, isConnected, tokenIn, tokenOut, decimalsIn, slippage]);

  const ensureChain = useCallback(async () => {
    if (chainId === targetChainId) return;
    await switchChainAsync({ chainId: targetChainId });
  }, [chainId, switchChainAsync, targetChainId]);

  const onMax = () => {
    if (balanceRaw == null) return;
    // Leave a little ETH for gas when buying
    if (side === 'buy') {
      const leave = parseUnits('0.0005', 18);
      const usable = balanceRaw > leave ? balanceRaw - leave : 0n;
      setAmountIn(formatUnits(usable, 18));
      return;
    }
    setAmountIn(formatUnits(balanceRaw, decimalsIn));
  };

  const executeSwap = useCallback(async () => {
    if (!isConnected || !address) {
      openModal('LoginModal');
      return;
    }

    const trimmed = amountIn.trim();
    if (!trimmed || Number(trimmed) <= 0) {
      toast.error('Enter an amount');
      return;
    }

    setBusy(true);
    try {
      await ensureChain();

      const amount = parseUnits(trimmed, decimalsIn).toString();
      const isNativeIn = tokenIn.toLowerCase() === NATIVE_ETH.toLowerCase();

      if (!isNativeIn) {
        const approval = await UniswapApiProvider.checkApproval({
          walletAddress: address,
          token: tokenIn,
          amount,
          tokenOut,
        });
        if (approval?.approval) {
          toast('Approve token spending…');
          const hash = await sendTransactionAsync(toTxRequest(approval.approval, targetChainId));
          await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 });
        }
      }

      toast('Fetching Uniswap quote…');
      const quoteResponse = await UniswapApiProvider.quote({
        tokenIn,
        tokenOut,
        amount,
        swapper: address,
        type: 'EXACT_INPUT',
        slippageTolerance: slippage,
      });

      const { quote, permitData, routing } = quoteResponse;
      if (!quote || !routing) {
        throw new Error(quoteResponse?.detail || 'No quotes available');
      }

      let signature;
      if (permitData) {
        toast('Sign Permit2…');
        signature = await signTypedDataAsync({
          domain: permitData.domain,
          types: permitData.types,
          primaryType: Object.keys(permitData.types).find(k => k !== 'EIP712Domain') || 'PermitSingle',
          message: permitData.values,
        });
      }

      if (AMM_ROUTINGS.has(routing)) {
        toast('Building swap…');
        const swapBody = { quote, refreshGasPrice: true };
        if (permitData) {
          swapBody.permitData = permitData;
          swapBody.signature = signature;
        }
        const { swap } = await UniswapApiProvider.swap(swapBody);
        toast('Confirm swap in wallet…');
        const hash = await sendTransactionAsync(toTxRequest(swap, targetChainId));
        await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 });
        toast.success(`Swap confirmed · ${truncateAddr(hash)}`);
      } else if (UX_ROUTINGS.has(routing)) {
        if (!signature) {
          throw new Error('UniswapX route requires a signature but none was returned');
        }
        toast('Submitting UniswapX order…');
        const order = await UniswapApiProvider.order({ quote, signature, routing });
        toast.success(`UniswapX order submitted · ${truncateAddr(order.orderId || '')}`);
      } else if (routing === 'CHAINED') {
        throw new Error('Cross-chain / chained swaps are not supported in this panel yet');
      } else {
        throw new Error(`Unsupported routing: ${routing}`);
      }

      setAmountIn('');
      setQuotePreview(null);
    } catch (err) {
      console.error(err);
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [
    address,
    amountIn,
    decimalsIn,
    ensureChain,
    isConnected,
    openModal,
    sendTransactionAsync,
    signTypedDataAsync,
    slippage,
    targetChainId,
    tokenIn,
    tokenOut,
  ]);

  const feeHint = useMemo(() => {
    if (apiConfig?.integratorFeeBips) {
      return `Includes ${(apiConfig.integratorFeeBips / 100).toFixed(2)}% L4VA fee`;
    }
    return null;
  }, [apiConfig]);

  const chainMismatch =
    isConnected && targetChainId && chainId != null && Number(chainId) !== Number(targetChainId);

  return (
    <div className="bg-steel-850 border border-steel-750 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-white">Swap</h2>
        <span className="text-[11px] text-dark-100">Uniswap · RH</span>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-steel-900/60 border border-steel-750">
        {['buy', 'sell'].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSide(s);
              setAmountIn('');
              setQuotePreview(null);
            }}
            className={clsx(
              'py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
              side === s ? 'bg-steel-750 text-orange-400' : 'text-dark-100 hover:text-white'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-steel-900/50 border border-steel-750 p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-dark-100">
          <span>You pay</span>
          <button type="button" onClick={onMax} className="hover:text-white transition-colors">
            Bal {balanceLabel} {side === 'buy' ? 'ETH' : tokenSymbol}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0.0"
            value={amountIn}
            onChange={e => setAmountIn(e.target.value)}
            className="flex-1 bg-transparent text-xl text-white font-medium outline-none tabular-nums min-w-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
          <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-steel-750 bg-steel-850 px-2.5 py-1 text-xs text-white">
            {side === 'sell' && tokenImage ? (
              <img src={tokenImage} alt="" className="w-4 h-4 rounded-full" />
            ) : null}
            {side === 'buy' ? 'ETH' : tokenSymbol}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-steel-900/50 border border-steel-750 p-3 space-y-2">
        <div className="text-[11px] text-dark-100">You receive (est.)</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xl text-white font-medium tabular-nums min-w-0">
            {quoteLoading ? (
              <div className="scale-50 origin-left">
                <Spinner />
              </div>
            ) : (
              formatAmount(quotePreview?.amountOut, decimalsOut)
            )}
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-steel-750 bg-steel-850 px-2.5 py-1 text-xs text-white">
            {side === 'buy' && tokenImage ? (
              <img src={tokenImage} alt="" className="w-4 h-4 rounded-full" />
            ) : null}
            {side === 'buy' ? tokenSymbol : 'ETH'}
          </div>
        </div>
        {quotePreview?.routing && (
          <div className="text-[11px] text-dark-100">
            Route · {quotePreview.routing}
            {feeHint ? ` · ${feeHint}` : ''}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-dark-100 mr-1">Slippage</span>
        {SLIPPAGE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSlippage(opt.value)}
            className={clsx(
              'px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors',
              slippage === opt.value
                ? 'bg-steel-750 text-orange-400'
                : 'text-dark-100 hover:text-white'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {chainMismatch && (
        <p className="text-[11px] text-amber-400">
          Wallet is on chain {chainId}. Swap targets Robinhood {targetChainId} — you will be prompted
          to switch.
        </p>
      )}

      {!apiConfig?.apiConfigured && apiConfig != null && (
        <p className="text-[11px] text-rose-400">Uniswap API key is not configured on the server.</p>
      )}

      <button
        type="button"
        disabled={busy || (isConnected && (!amountIn || Number(amountIn) <= 0))}
        onClick={executeSwap}
        className={clsx(
          'w-full rounded-xl py-2.5 text-sm font-medium transition-colors',
          'bg-orange-500 text-steel-950 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {busy ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <span className="scale-75">
              <Spinner />
            </span>
            Swapping…
          </span>
        ) : !isConnected ? (
          'Connect wallet'
        ) : side === 'buy' ? (
          `Buy ${tokenSymbol}`
        ) : (
          `Sell ${tokenSymbol}`
        )}
      </button>
    </div>
  );
}
