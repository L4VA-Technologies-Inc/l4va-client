import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { formatUnits } from 'viem';
import { CheckCircle, Clock, ExternalLink, Lock, Send, XCircle } from 'lucide-react';

import { getAddressUrl, getTransactionUrl } from '@/utils/explorer.utils';
import { substringAddress } from '@/utils/core.utils';

const NATIVE_ASSET = '0x0000000000000000000000000000000000000000';

const formatAmount = (amount, asset) => {
  if (amount === null || amount === undefined) return '—';
  try {
    if (!asset || asset.toLowerCase() === NATIVE_ASSET) {
      return `${Number(formatUnits(BigInt(amount), 18)).toLocaleString('en-US', { maximumFractionDigits: 8 })} ETH`;
    }
    return `${BigInt(amount).toLocaleString('en-US')} units of ${substringAddress(asset)}`;
  } catch {
    return String(amount);
  }
};

const formatCountdown = ms => {
  if (ms <= 0) return 'any moment now';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
};

const useNow = (intervalMs = 30000) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

const TxLink = ({ hash, chainType }) =>
  hash ? (
    <a
      href={getTransactionUrl(hash, chainType)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-dark-100 hover:text-green-400"
    >
      {substringAddress(hash)}
      <ExternalLink className="w-3 h-3" />
    </a>
  ) : null;

/** One step of the stepper: done, current or upcoming. */
const Step = ({ icon: Icon, state, title, children, isLast }) => (
  <div className="relative flex gap-3">
    {!isLast && (
      <span
        className={clsx(
          'absolute left-4 top-9 bottom-0 w-px -translate-x-1/2',
          state === 'done' ? 'bg-green-500/50' : 'bg-steel-750'
        )}
      />
    )}
    <div
      className={clsx(
        'relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-1',
        state === 'done' && 'bg-green-500/15 text-green-400 ring-green-500/40',
        state === 'current' && 'bg-orange-500/15 text-orange-400 ring-orange-500/50',
        state === 'upcoming' && 'bg-steel-850 text-dark-100 ring-steel-750',
        state === 'failed' && 'bg-rose-500/15 text-rose-400 ring-rose-500/40'
      )}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className={clsx('flex-1 min-w-0 pt-1', isLast ? 'pb-0' : 'pb-5')}>
      <p className={clsx('text-sm font-medium', state === 'upcoming' ? 'text-dark-100' : 'text-white')}>{title}</p>
      {children && <div className="mt-1 text-xs text-dark-100 space-y-1">{children}</div>}
    </div>
  </div>
);

/**
 * Where an EVM distribution stands. Executing the proposal only reserves the pot inside the
 * vault; on V13 holders are paid after a safety window, by the backend, one transaction each.
 */
export const EvmDistributionStatus = ({ distribution, timing, chainType }) => {
  const now = useNow();
  if (!distribution) return null;

  const { asset, netPot, requestedAmount, openTxHash, payouts = [], paidOutAt } = distribution;
  const opened = Boolean(netPot || openTxHash);
  const cancelled = Boolean(timing?.cancelled);
  const activatesAtMs = timing?.activatesAt ? timing.activatesAt * 1000 : null;
  const inWindow = opened && !cancelled && Boolean(timing?.pending);
  const paying = opened && !cancelled && !inWindow && !paidOutAt;
  const done = opened && !cancelled && Boolean(paidOutAt);
  const paidTotal = payouts.reduce((sum, p) => {
    try {
      return sum + BigInt(p.amount);
    } catch {
      return sum;
    }
  }, 0n);

  const headline = cancelled
    ? 'Stopped — the pot went back to the vault'
    : done
      ? 'Paid out to holders'
      : paying
        ? 'Paying holders'
        : inWindow
          ? `Payouts open ${formatCountdown(activatesAtMs - now)}`
          : 'Waiting to reserve the pot';

  return (
    <div className="rounded-lg border border-steel-750 bg-steel-850 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-dark-100">Distribution</p>
          <p className="mt-1 text-2xl font-semibold text-white">{formatAmount(netPot ?? requestedAmount, asset)}</p>
          <p className="text-xs text-dark-100">
            {netPot ? 'to be shared by VT holders, after the protocol fee' : 'requested (before the protocol fee)'}
          </p>
        </div>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-semibold',
            cancelled && 'bg-rose-500/15 text-rose-400',
            done && 'bg-green-500/15 text-green-400',
            (paying || inWindow || !opened) && !cancelled && 'bg-orange-500/15 text-orange-400'
          )}
        >
          {headline}
        </span>
      </div>

      <div>
        <Step icon={Lock} state={opened ? 'done' : 'current'} title="Pot reserved in the vault">
          <p>
            The amount is locked inside the vault contract for VT holders. It stays there until each holder is paid.
          </p>
          {openTxHash && (
            <p>
              Transaction: <TxLink hash={openTxHash} chainType={chainType} />
            </p>
          )}
        </Step>

        {timing && (
          <Step
            icon={cancelled ? XCircle : Clock}
            state={cancelled ? 'failed' : inWindow ? 'current' : opened ? 'done' : 'upcoming'}
            title="Safety review window"
          >
            {cancelled ? (
              <p>The distribution was stopped during the review window. Nothing was paid out.</p>
            ) : (
              <p>
                Payouts can be stopped until {new Date(activatesAtMs).toLocaleString()}
                {inWindow ? ` (${formatCountdown(activatesAtMs - now)}).` : '.'}
              </p>
            )}
          </Step>
        )}

        {!cancelled && (
          <Step
            icon={Send}
            state={done ? 'done' : paying ? 'current' : 'upcoming'}
            title={`Holders paid${payouts.length ? ` — ${payouts.length}` : ''}`}
          >
            <p>
              {payouts.length
                ? `${formatAmount(String(paidTotal), asset)} sent so far, one transaction per holder.`
                : 'Each holder receives their share automatically, one transaction each. No action needed.'}
            </p>
            {payouts.length > 0 && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-steel-750 divide-y divide-steel-750">
                {payouts.map(p => (
                  <div key={p.txHash} className="flex items-center justify-between gap-3 px-3 py-2">
                    <a
                      href={getAddressUrl(p.holder, chainType)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-white hover:text-green-400"
                    >
                      {substringAddress(p.holder)}
                    </a>
                    <span className="text-white">{formatAmount(p.amount, asset)}</span>
                    <TxLink hash={p.txHash} chainType={chainType} />
                  </div>
                ))}
              </div>
            )}
          </Step>
        )}

        {!cancelled && (
          <Step icon={CheckCircle} state={done ? 'done' : 'upcoming'} title="Done" isLast>
            {done ? (
              <p>Everyone with a share has been paid ({new Date(paidOutAt).toLocaleString()}).</p>
            ) : (
              timing?.deadline && (
                <p>
                  Holders the automatic payout misses can claim themselves until{' '}
                  {new Date(timing.deadline * 1000).toLocaleString()}.
                </p>
              )
            )}
          </Step>
        )}
      </div>
    </div>
  );
};
