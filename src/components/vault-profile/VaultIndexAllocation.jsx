import { ExternalLink, PieChart, RefreshCcw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/Spinner';
import { useVaultIndex } from '@/services/api/queries';
import { BasketAllocationBar } from '@/components/vaults/index/IndexBasketEditor';
import {
  REBALANCE_STATUS_STYLES,
  REBALANCE_TRIGGER_LABELS,
  formatBps,
  formatNativeWei,
  basketSegmentColor,
} from '@/components/vaults/index/indexVault.utils';
import { getTransactionUrl } from '@/utils/explorer.utils';
import { ChainType } from '@/utils/types';
import { formatDateWithTime } from '@/utils/core.utils';

const TokenCell = ({ asset, color }) => (
  <div className="flex items-center gap-3 min-w-0">
    <span className="h-6 w-1 flex-shrink-0 rounded-full" style={{ background: color }} />
    {asset.image ? (
      <img src={asset.image} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
    ) : (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel-750 text-xs font-bold">
        {(asset.symbol || '?').slice(0, 2).toUpperCase()}
      </span>
    )}
    <div className="min-w-0">
      <p className="truncate font-medium">{asset.symbol}</p>
      {asset.name && <p className="truncate text-xs text-dark-100">{asset.name}</p>}
    </div>
  </div>
);

const DriftCell = ({ driftBps }) => {
  const abs = Math.abs(driftBps);
  const tone = abs < 200 ? 'text-dark-100' : abs < 500 ? 'text-yellow-400' : 'text-red-400';
  return (
    <span className={cn('tabular-nums', tone)}>
      {driftBps > 0 ? '+' : driftBps < 0 ? '−' : ''}
      {formatBps(abs)}
    </span>
  );
};

const TargetBasket = ({ config }) => (
  <div className="space-y-4">
    <BasketAllocationBar targets={config.targets} reserveBps={config.reserveBps} />
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {config.targets.map((t, i) => (
        <li key={t.assetAddress} className="flex items-center justify-between gap-3 rounded-lg bg-steel-850 px-3 py-2">
          <TokenCell asset={t} color={basketSegmentColor(i)} />
          <span className="font-bold tabular-nums">{formatBps(t.weightBps)}</span>
        </li>
      ))}
      {config.reserveBps > 0 && (
        <li className="flex items-center justify-between gap-3 rounded-lg bg-steel-850 px-3 py-2">
          <span className="text-dark-100">Cash reserve (ETH)</span>
          <span className="font-bold tabular-nums">{formatBps(config.reserveBps)}</span>
        </li>
      )}
    </ul>
  </div>
);

const RebalanceHistory = ({ rebalances }) => {
  if (!rebalances?.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 font-russo text-sm uppercase">
        <RefreshCcw className="h-4 w-4 text-orange-500" />
        Rebalance history
      </h4>
      <ul className="space-y-2">
        {rebalances.map(run => {
          const traded = run.legs.filter(l => l.status === 'confirmed');
          return (
            <li key={run.id} className="rounded-lg bg-steel-850 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{REBALANCE_TRIGGER_LABELS[run.trigger] || run.trigger}</span>
                <span className={cn('text-sm capitalize', REBALANCE_STATUS_STYLES[run.status])}>{run.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-100">
                <span>{formatDateWithTime(run.completedAt || run.createdAt)}</span>
                <span>
                  {traded.length} trade{traded.length === 1 ? '' : 's'}
                </span>
                {run.navNative && <span>NAV at start: {formatNativeWei(run.navNative)} ETH</span>}
              </div>
              {traded.some(l => l.txHash) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {traded
                    .filter(l => l.txHash)
                    .map(l => (
                      <a
                        key={l.operationId}
                        href={getTransactionUrl(l.txHash, ChainType.ROBINHOOD)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-steel-800 px-2 py-0.5 text-xs text-dark-100 hover:text-orange-500"
                      >
                        {l.side} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                </div>
              )}
              {run.status === 'failed' && (
                <p className="mt-2 text-xs text-red-400">
                  Trading paused before the basket was complete. It will be retried; funds stay in the vault.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Index-weighted vault basket: target weights before lock, live target vs
 * actual allocation after the vault has bought its basket.
 */
export const VaultIndexAllocation = ({ vault }) => {
  const { data, isLoading, error } = useVaultIndex(vault?.id);
  const config = data?.config || vault?.indexConfig;
  const portfolio = data?.portfolio;

  if (isLoading && !config) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!config?.targets?.length) {
    return error ? <p className="py-6 text-center text-dark-100">The index basket could not be loaded.</p> : null;
  }

  const hasHoldings = portfolio && !portfolio.error && portfolio.assets.length > 0;
  const actualTargets = hasHoldings
    ? portfolio.assets.map(a => ({ assetAddress: a.assetAddress, symbol: a.symbol, weightBps: a.actualBps }))
    : [];

  return (
    <section className="mb-8 space-y-6 rounded-xl border border-steel-800 p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-orange-500" />
          <h3 className="font-russo text-lg uppercase">Index basket</h3>
          {config.version > 1 && <span className="text-xs text-dark-100">v{config.version} · set by governance</span>}
        </div>
        {hasHoldings && (
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-100">Basket value</p>
            <p className="text-2xl font-bold tabular-nums">{formatNativeWei(portfolio.navNative)} ETH</p>
          </div>
        )}
      </div>

      {!hasHoldings ? (
        <>
          <p className="text-sm text-dark-100">
            {portfolio?.error
              ? `${portfolio.error}. Showing the target weights.`
              : 'When the acquire window locks, the vault buys these assets with the ETH raised, at these weights.'}
          </p>
          <TargetBasket config={config} />
        </>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-dark-100">
              <span className="w-12">Target</span>
              <BasketAllocationBar targets={config.targets} reserveBps={config.reserveBps} />
            </div>
            <div className="flex items-center gap-3 text-xs text-dark-100">
              <span className="w-12">Actual</span>
              <div className="flex h-3 w-full gap-px overflow-hidden rounded-full bg-steel-800">
                {actualTargets.map(t => {
                  const idx = config.targets.findIndex(c => c.assetAddress === t.assetAddress);
                  return (
                    <div
                      key={t.assetAddress}
                      title={`${t.symbol}: ${formatBps(t.weightBps)}`}
                      style={{
                        width: `${t.weightBps / 100}%`,
                        background: idx >= 0 ? basketSegmentColor(idx) : '#64748B',
                      }}
                    />
                  );
                })}
                <div
                  title={`Cash: ${formatBps(portfolio.reserve.actualBps)}`}
                  className="bg-steel-600"
                  style={{ width: `${portfolio.reserve.actualBps / 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-dark-100">
                  <th className="px-3 py-2 font-medium">Asset</th>
                  <th className="px-3 py-2 text-right font-medium">Target</th>
                  <th className="px-3 py-2 text-right font-medium">Actual</th>
                  <th className="px-3 py-2 text-right font-medium">Drift</th>
                  <th className="px-3 py-2 text-right font-medium">Value (ETH)</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.assets.map(asset => {
                  const idx = config.targets.findIndex(c => c.assetAddress === asset.assetAddress);
                  return (
                    <tr key={asset.assetAddress} className="border-t border-steel-800">
                      <td className="px-3 py-2">
                        <TokenCell asset={asset} color={idx >= 0 ? basketSegmentColor(idx) : '#64748B'} />
                        {!asset.inBasket && <p className="mt-1 text-xs text-yellow-400">Leaving the basket</p>}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatBps(asset.targetBps)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatBps(asset.actualBps)}</td>
                      <td className="px-3 py-2 text-right">
                        <DriftCell driftBps={asset.driftBps} />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatNativeWei(asset.valueNative)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-steel-800">
                  <td className="px-3 py-2 text-dark-100">Cash reserve</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBps(portfolio.reserve.targetBps)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBps(portfolio.reserve.actualBps)}</td>
                  <td className="px-3 py-2 text-right">
                    <DriftCell driftBps={portfolio.reserve.actualBps - portfolio.reserve.targetBps} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNativeWei(portfolio.reserve.valueNative)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-dark-100">
            Values are live swap quotes into ETH, refreshed every minute. Drift is actual minus target, as a share of
            the whole vault.
          </p>
        </>
      )}

      <RebalanceHistory rebalances={data?.rebalances} />
    </section>
  );
};
