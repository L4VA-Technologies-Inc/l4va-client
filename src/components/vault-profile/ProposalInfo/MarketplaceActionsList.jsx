import { ExternalLink } from 'lucide-react';

import { getTransactionUrl } from '@/utils/explorer.utils';
import { LazyImage } from '@/components/shared/LazyImage';
import { formatAdaPrice } from '@/utils/core.utils';
import { useCurrency } from '@/hooks/useCurrency';

const ActionField = ({ label, value, children, className }) => (
  <div className="flex justify-between items-center">
    <div className="text-gray-400 text-sm">{label}</div>
    {children || <div className={`text-white text-sm ${className}`}>{value || 'N/A'}</div>}
  </div>
);

/** Truncate a 0x address for display. */
const shortAddr = addr => (addr ? `${addr.slice(0, 8)}\u2026${addr.slice(-6)}` : 'N/A');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const tokenLabel = addr => (!addr || addr.toLowerCase() === ZERO_ADDR ? 'ETH' : shortAddr(addr));
const formatAmount = v => {
  const n = Number(v);
  if (!Number.isFinite(n)) return v ?? 'N/A';
  return n.toLocaleString(undefined, { maximumFractionDigits: n >= 1 ? 4 : 8 });
};

/** Compact table for EVM Uniswap swaps: one row per swap instead of a 5-line block each. */
const EvmSwapTable = ({ actions }) => (
  <div className="flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <div className="text-gray-400">Actions</div>
      <div className="text-white text-sm">{actions.length} token swap(s) · Uniswap (Robinhood Chain)</div>
    </div>
    <div className="max-h-96 overflow-auto rounded-lg border border-steel-750">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-steel-950 text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left font-normal">#</th>
            <th className="px-3 py-2 text-left font-normal">Sell</th>
            <th className="px-3 py-2 text-left font-normal">For</th>
            <th className="px-3 py-2 text-right font-normal">Amount</th>
            {actions.some(a => a.assetStatus) && <th className="px-3 py-2 text-right font-normal">Status</th>}
          </tr>
        </thead>
        <tbody>
          {actions.map((action, index) => (
            <tr key={index} className="border-t border-steel-750 text-white">
              <td className="px-3 py-2 text-gray-500">{index + 1}</td>
              <td className="px-3 py-2 font-mono" title={action.inputAsset}>
                {tokenLabel(action.inputAsset)}
              </td>
              <td className="px-3 py-2 font-mono" title={action.expectedOutputAsset}>
                {tokenLabel(action.expectedOutputAsset)}
              </td>
              <td className="px-3 py-2 text-right" title={String(action.humanAmount || action.amount || '')}>
                {formatAmount(action.humanAmount || action.amount)}
              </td>
              {actions.some(a => a.assetStatus) && (
                <td className="px-3 py-2 text-right uppercase">{action.assetStatus || '—'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const MarketplaceActionsList = ({ actions, type = 'marketplace', chainType }) => {
  const { currencyLabel } = useCurrency();

  if (!Array.isArray(actions) || actions.length === 0) return null;

  const isDexHunterSwap = actions[0]?.market === 'DexHunter' || actions[0]?.slippage !== undefined;
  const isEvmUniswapSwap = actions[0]?.market === 'Uniswap' && actions[0]?.inputAsset;
  const isEvmClosePosition = actions[0]?.exec === 'CLOSE_POSITION';

  if (isEvmUniswapSwap) return <EvmSwapTable actions={actions} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="text-gray-400">Actions</div>
        <div className="text-white">{actions.length} action(s)</div>
      </div>
      <div className="space-y-4 pl-4 border-l border-steel-750">
        {actions.map((action, index) => (
          <div key={index} className="space-y-2">
            <div className="text-sm text-gray-500">Action {index + 1}</div>
            <div className="space-y-2">
              {isEvmUniswapSwap ? (
                <>
                  <ActionField label="Market" value="Uniswap V3 (Robinhood Chain)" />
                  <ActionField label="Type" value="Token Swap" />
                  <ActionField label="Input Token" value={shortAddr(action.inputAsset)} />
                  <ActionField label="Output Token" value={shortAddr(action.expectedOutputAsset)} />
                  {(action.humanAmount || action.amount) && (
                    <ActionField label="Amount" value={action.humanAmount || action.amount} />
                  )}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                </>
              ) : isEvmClosePosition ? (
                <>
                  <ActionField label="Market" value="Uniswap V3 (Robinhood Chain)" />
                  <ActionField label="Type" value="Close Position" />
                  {action.positionId && <ActionField label="Position ID" value={action.positionId} />}
                  {action.positionAsset && (
                    <ActionField label="Position Asset" value={shortAddr(action.positionAsset)} />
                  )}
                  {action.underlyingAsset && (
                    <ActionField label="Return To" value={shortAddr(action.underlyingAsset)} />
                  )}
                  {action.positionAmount && <ActionField label="Amount (raw)" value={action.positionAmount} />}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                </>
              ) : isDexHunterSwap ? (
                <>
                  <ActionField label="Market" value={action.market || 'DexHunter'} />
                  <ActionField label="Type" value={`Swap to ${currencyLabel}`} />
                  {action.assetName && <ActionField label="Token" value={action.assetName} />}
                  {action.assetImg && (
                    <ActionField label="Token Image">
                      <LazyImage
                        src={action.assetImg}
                        alt={action.assetName || 'Token image'}
                        className="rounded-full"
                        width={32}
                        height={32}
                        fallbackSrc="/assets/icons/ada.svg"
                      />
                    </ActionField>
                  )}
                  {action.quantity && <ActionField label="Quantity" value={action.quantity.toLocaleString()} />}
                  {action.slippage !== undefined && (
                    <ActionField label="Slippage Tolerance" value={`${action.slippage}%`} />
                  )}
                  {action.useMarketPrice !== undefined && (
                    <ActionField
                      label="Price Mode"
                      value={action.useMarketPrice ? 'Market Price (at execution)' : 'Custom Price'}
                    />
                  )}
                  {!action.useMarketPrice && action.customPriceAda && (
                    <ActionField
                      label="Custom Price"
                      value={`\u20B3${formatAdaPrice(action.customPriceAda)} per token`}
                    />
                  )}
                  {action.estimatedOutput && (
                    <ActionField label="Estimated Output" value={`\u20B3${formatAdaPrice(action.estimatedOutput)}`} />
                  )}
                  {action.actualOutput && (
                    <ActionField label="Actual Output" value={`\u20B3${formatAdaPrice(action.actualOutput)}`} />
                  )}
                  {action.txHash && (
                    <ActionField label="Transaction">
                      <a
                        href={getTransactionUrl(action.txHash, chainType)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors text-sm"
                      >
                        <span>View on Explorer</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </ActionField>
                  )}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                </>
              ) : type === 'marketplace' ? (
                <>
                  <ActionField label="Exec" value={action.exec} />
                  <ActionField label="Market" value={action.market || 'WayUp'} />
                  {action.assetPrice && String(action.exec || '').toLowerCase() !== 'offer' && (
                    <ActionField label="Floor Price" value={`\u20B3${formatAdaPrice(action.assetPrice)}`} />
                  )}
                  {action.price && (
                    <ActionField
                      label={String(action.exec || '').toLowerCase() === 'offer' ? 'Offered Price' : 'Buying Max Price'}
                      value={`\u20B3${formatAdaPrice(action.price)}`}
                    />
                  )}
                  {action.listingPrice && (
                    <ActionField label="Listing Price" value={`\u20B3${formatAdaPrice(action.listingPrice)}`} />
                  )}
                  {action.newPrice && (
                    <ActionField label="New Price" value={`\u20B3${formatAdaPrice(action.newPrice)}`} />
                  )}
                  {action.assetName && <ActionField label="Asset Name" value={action.assetName} />}
                  {action.assetImg && (
                    <ActionField label="Asset Image">
                      <LazyImage
                        src={action.assetImg}
                        alt={action.assetName || 'Asset image'}
                        className="rounded-full"
                        width={32}
                        height={32}
                        fallbackSrc="/assets/icons/ada.svg"
                      />
                    </ActionField>
                  )}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                  {action.wayupUrl && (
                    <ActionField label="Token URL">
                      <a
                        href={action.wayupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors text-sm"
                      >
                        <span>View on WayUp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </ActionField>
                  )}
                </>
              ) : (
                <>
                  {action.assetName && <ActionField label="Asset Name" value={action.assetName} />}
                  {action.exec && <ActionField label="Exec" value={action.exec} />}
                  {action.quantity && <ActionField label="Quantity" value={action.quantity} />}
                  {action.sellType && <ActionField label="Sell Type" value={action.sellType} />}
                  {action.method && <ActionField label="Method" value={action.method} />}
                  {action.market && <ActionField label="Market" value={action.market} />}
                  {action.assetPrice && (
                    <ActionField label="Price" value={`\u20B3${formatAdaPrice(action.assetPrice)}`} />
                  )}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                  {action.wayupUrl && (
                    <ActionField label="Token URL">
                      <a
                        href={action.wayupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors text-sm"
                      >
                        <span>View on WayUp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </ActionField>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
