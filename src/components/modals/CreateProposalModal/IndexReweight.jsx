import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { ProposalOutcome } from '@/components/modals/CreateProposalModal/ProposalOutcome.jsx';
import { IndexBasketEditor } from '@/components/vaults/index/IndexBasketEditor';
import {
  formatBps,
  formatNativeWei,
  formatRebalanceSchedule,
  toIndexBasketPayload,
  validateIndexBasket,
} from '@/components/vaults/index/indexVault.utils';
import { useIndexSupportedAssets, useVaultIndex } from '@/services/api/queries';
import { VaultsApiProvider } from '@/services/api/vaults';

const sameBasket = (a, b) => {
  if (!a || !b) return false;
  if (Number(a.reserveBps) !== Number(b.reserveBps)) return false;
  if (a.targets.length !== b.targets.length) return false;
  const weights = new Map(a.targets.map(t => [t.assetAddress.toLowerCase(), Number(t.weightBps)]));
  return b.targets.every(t => weights.get(t.assetAddress.toLowerCase()) === Number(t.weightBps));
};

/** Configs created before auto-rebalance have no schedule fields and count as off. */
const scheduleOf = config => ({
  autoRebalance: config?.autoRebalance === true,
  rebalanceCadenceDays: config?.autoRebalance ? Number(config?.rebalanceCadenceDays) || null : null,
});

const sameSchedule = (a, b) => {
  const x = scheduleOf(a);
  const y = scheduleOf(b);
  return x.autoRebalance === y.autoRebalance && x.rebalanceCadenceDays === y.rebalanceCadenceDays;
};

/** Weight changes per asset, including assets added to or removed from the basket. */
const diffBaskets = (current, proposed) => {
  const rows = new Map();
  (current?.targets || []).forEach(t =>
    rows.set(t.assetAddress, { symbol: t.symbol, from: Number(t.weightBps), to: 0 })
  );
  (proposed?.targets || []).forEach(t => {
    const row = rows.get(t.assetAddress) || { symbol: t.symbol, from: 0 };
    rows.set(t.assetAddress, { ...row, symbol: row.symbol || t.symbol, to: Number(t.weightBps) });
  });
  return [...rows.entries()].map(([assetAddress, row]) => ({ assetAddress, ...row }));
};

const PREVIEW_DEBOUNCE_MS = 600;

/** Why a needed trade will not happen (from the API's `skipped` legs). */
const skipMessage = (leg, minTradeNative) => {
  const action = leg.side === 'sell' ? 'Sell' : 'Buy';
  if (leg.reason === 'below_min_trade') {
    return `${action} ≈ ${formatNativeWei(leg.valueNative)} ETH is below the ${formatNativeWei(minTradeNative)} ETH minimum trade`;
  }
  if (leg.reason === 'no_free_native') {
    return `${action} ≈ ${formatNativeWei(leg.valueNative)} ETH has no ETH above the cash reserve to fund it`;
  }
  return `Within the drift tolerance (≈ ${formatNativeWei(leg.valueNative)} ETH off target)`;
};

const IndexReweight = ({ vault, onDataChange, error }) => {
  const { data, isLoading, isFetching, refetch } = useVaultIndex(vault?.id);
  const current = data?.config || vault?.indexConfig;
  const [basket, setBasket] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewState, setPreviewState] = useState('idle');

  useEffect(() => {
    if (current && !basket) {
      setBasket({
        targets: current.targets.map(t => ({ ...t })),
        reserveBps: current.reserveBps,
        ...scheduleOf(current),
      });
    }
  }, [current, basket]);

  const { data: supported } = useIndexSupportedAssets();
  const problem = basket
    ? validateIndexBasket(basket, supported?.rebalance?.minCadenceDays)
    : 'Loading the current basket';
  const weightsUnchanged = sameBasket(current, basket);
  const scheduleUnchanged = sameSchedule(current, basket);
  const unchanged = weightsUnchanged && scheduleUnchanged;

  // A re-weight that would trade nothing for a blocking reason (below the minimum trade, or no
  // free ETH) only overwrites the stored weights — the API rejects it, so don't allow creating it.
  // Wait for the estimate before enabling Create; if the estimate itself fails, don't block.
  const estimating = previewState === 'loading';
  const blockedByTrades =
    !!preview &&
    preview.sells.length === 0 &&
    preview.buys.length === 0 &&
    (preview.skipped || []).some(s => s.reason !== 'within_tolerance');

  useEffect(() => {
    onDataChange({
      indexReweight: basket ? toIndexBasketPayload(basket) : null,
      isValid: !problem && !unchanged && !estimating && !blockedByTrades,
    });
  }, [basket, problem, unchanged, estimating, blockedByTrades, onDataChange]);

  const diff = useMemo(() => diffBaskets(current, basket), [current, basket]);
  const symbolOf = address =>
    basket?.targets.find(t => t.assetAddress === address)?.symbol ||
    current?.targets.find(t => t.assetAddress === address)?.symbol ||
    `${address.slice(0, 6)}…`;

  // Estimate automatically once the edited basket is valid and settles for a moment; a newer
  // basket supersedes any request still in flight, so a slow old answer never overwrites it.
  // A schedule-only change trades nothing, so there is nothing to estimate.
  const canPreview = !!basket && !weightsUnchanged && !problem && !!vault?.contractAddress;
  const payloadKey = canPreview ? JSON.stringify(toIndexBasketPayload(basket)) : null;
  useEffect(() => {
    if (!payloadKey) {
      setPreview(null);
      setPreviewState('idle');
      return undefined;
    }
    let cancelled = false;
    setPreviewState('loading');
    const timer = setTimeout(async () => {
      try {
        const result = await VaultsApiProvider.previewIndexReweight(vault.id, JSON.parse(payloadKey));
        if (cancelled) return;
        setPreview(result);
        setPreviewState('idle');
      } catch (err) {
        if (cancelled) return;
        setPreview(null);
        setPreviewState(err?.response?.data?.message || 'The trade preview is unavailable right now.');
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [payloadKey, vault?.id]);

  if (!basket) {
    // No basket and nothing in flight means the overview request failed and
    // `vault.indexConfig` was empty too — a spinner here would never resolve.
    if (isLoading || isFetching) {
      return (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-red-400">The current index basket could not be loaded.</p>
        <SecondaryButton size="sm" onClick={() => refetch()}>
          Try again
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-dark-100">
        Set the new target weights for the vault&apos;s basket and cash reserve, or change its auto-rebalance schedule.
      </p>

      <IndexBasketEditor
        steel
        value={basket}
        onChange={setBasket}
        error={
          error
            ? problem ||
              (unchanged ? 'Change a weight or the auto-rebalance schedule to create a re-weight proposal' : null)
            : null
        }
      />

      {!unchanged && !problem && (
        <div className="space-y-2 rounded-lg bg-steel-800 p-4">
          <h4 className="text-sm font-medium">Weight changes</h4>
          <ul className="space-y-1 text-sm">
            {diff
              .filter(row => row.from !== row.to)
              .map(row => (
                <li key={row.assetAddress} className="flex items-center justify-between gap-3">
                  <span>{row.symbol || row.assetAddress}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="text-dark-100">{formatBps(row.from)}</span>
                    <ArrowRight className="h-3 w-3 text-dark-100" />
                    <span className={row.to > row.from ? 'text-green-500' : 'text-red-400'}>{formatBps(row.to)}</span>
                  </span>
                </li>
              ))}
            {Number(current.reserveBps) !== Number(basket.reserveBps) && (
              <li className="flex items-center justify-between gap-3">
                <span>Cash reserve</span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className="text-dark-100">{formatBps(current.reserveBps)}</span>
                  <ArrowRight className="h-3 w-3 text-dark-100" />
                  <span>{formatBps(basket.reserveBps)}</span>
                </span>
              </li>
            )}
            {!scheduleUnchanged && (
              <li className="flex items-center justify-between gap-3">
                <span>Auto-rebalance</span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className="text-dark-100">{formatRebalanceSchedule(scheduleOf(current))}</span>
                  <ArrowRight className="h-3 w-3 text-dark-100" />
                  <span>{formatRebalanceSchedule(basket)}</span>
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {canPreview && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            Estimated trades at current prices
            {previewState === 'loading' && <Spinner size="sm" />}
          </h4>
          {previewState !== 'idle' && previewState !== 'loading' && (
            <p className="text-sm text-red-400">{previewState}</p>
          )}
          {preview && (
            <div
              className={`space-y-2 rounded-lg bg-steel-800 p-4 text-sm ${previewState === 'loading' ? 'opacity-60' : ''}`}
            >
              {preview.sells.length === 0 && preview.buys.length === 0 ? (
                (() => {
                  // An empty plan only means "on target" when nothing was held back for another reason.
                  const blocking = (preview.skipped || []).filter(s => s.reason !== 'within_tolerance');
                  if (blocking.length === 0) {
                    return (
                      <p className="text-dark-100">
                        All assets are within tolerance of the new weights — no trades needed.
                      </p>
                    );
                  }
                  const tooSmall = blocking.every(s => s.reason === 'below_min_trade');
                  return (
                    <div className="space-y-2">
                      <p className="text-amber-400">
                        {tooSmall
                          ? `No trades would run: the vault is too small to trade. Each trade must be at least ${formatNativeWei(preview.minTradeNative)} ETH (vault value ≈ ${formatNativeWei(preview.navNative)} ETH).`
                          : 'No trades would run with the vault as it is now:'}
                      </p>
                      <ul className="space-y-1 text-dark-100">
                        {blocking.map(leg => (
                          <li key={`${leg.side}-${leg.asset}`} className="flex justify-between gap-3">
                            <span>{symbolOf(leg.asset)}</span>
                            <span className="text-right">{skipMessage(leg, preview.minTradeNative)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-dark-100">
                        This proposal can&apos;t be created: it would only change the stored weights without making any
                        trade. Propose the re-weight once the vault is larger.
                      </p>
                    </div>
                  );
                })()
              ) : (
                <>
                  {preview.sells.map(sell => (
                    <p key={`sell-${sell.asset}`} className="flex justify-between gap-3">
                      <span>
                        Sell {sell.exit ? 'all ' : ''}
                        {symbolOf(sell.asset)}
                      </span>
                      <span className="tabular-nums text-red-400">≈ {formatNativeWei(sell.valueNative)} ETH</span>
                    </p>
                  ))}
                  {preview.buys.map(buy => (
                    <p key={`buy-${buy.asset}`} className="flex justify-between gap-3">
                      <span>Buy {symbolOf(buy.asset)}</span>
                      <span className="tabular-nums text-green-500">≈ {formatNativeWei(buy.nativeIn)} ETH</span>
                    </p>
                  ))}
                  {(preview.skipped || [])
                    .filter(s => s.reason !== 'within_tolerance')
                    .map(leg => (
                      <p key={`skip-${leg.side}-${leg.asset}`} className="flex justify-between gap-3 text-amber-400">
                        <span>{symbolOf(leg.asset)} skipped</span>
                        <span className="text-right">{skipMessage(leg, preview.minTradeNative)}</span>
                      </p>
                    ))}
                </>
              )}
              <p className="pt-1 text-xs text-dark-100">
                Estimate only. Trades are sized again from live prices when the proposal executes.
              </p>
            </div>
          )}
        </div>
      )}

      {!unchanged && !problem && weightsUnchanged && (
        <ProposalOutcome
          storageKey="index-reschedule"
          summary="Changes only the auto-rebalance schedule. No trades run when it passes."
          steps={[
            {
              title: 'The new schedule is saved.',
              detail: basket.autoRebalance
                ? `The vault rebalances to its current weights every ${basket.rebalanceCadenceDays} days, counted from when the proposal executes.`
                : 'The vault stops rebalancing automatically. Weights can still be changed through governance.',
            },
          ]}
        />
      )}

      {!unchanged && !problem && !weightsUnchanged && (
        <ProposalOutcome
          storageKey="index-reweight"
          summary="Saves the new weights, then sells over target and buys under target on Uniswap."
          steps={[
            {
              title: 'The new weights are saved.',
              detail: 'The vault adopts this basket and cash reserve as its targets.',
            },
            {
              title: 'The vault trades to them on Uniswap.',
              detail:
                'It sells what is over target first, then buys what is under target with the proceeds. Trades ' +
                'are sized from live prices at that moment, so they can differ from the estimate above.',
            },
            {
              title: 'Small differences are left alone.',
              detail: `Assets within ${formatBps(
                current?.driftToleranceBps ?? 200
              )} of their target, or trades under the minimum trade size, are not traded.`,
            },
            {
              title: 'Failed trades are retried.',
              detail:
                'Trades resume from where they stopped: the run is retried automatically, and an operator can ' +
                'retry it after that. Trades already made stay made.',
            },
          ]}
        />
      )}
    </div>
  );
};

export default IndexReweight;
