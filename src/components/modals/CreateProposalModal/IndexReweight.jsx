import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { IndexBasketEditor } from '@/components/vaults/index/IndexBasketEditor';
import {
  formatBps,
  formatNativeWei,
  toIndexBasketPayload,
  validateIndexBasket,
} from '@/components/vaults/index/indexVault.utils';
import { useVaultIndex } from '@/services/api/queries';
import { VaultsApiProvider } from '@/services/api/vaults';

const sameBasket = (a, b) => {
  if (!a || !b) return false;
  if (Number(a.reserveBps) !== Number(b.reserveBps)) return false;
  if (a.targets.length !== b.targets.length) return false;
  const weights = new Map(a.targets.map(t => [t.assetAddress.toLowerCase(), Number(t.weightBps)]));
  return b.targets.every(t => weights.get(t.assetAddress.toLowerCase()) === Number(t.weightBps));
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

const IndexReweight = ({ vault, onDataChange, error }) => {
  const { data, isLoading, isFetching, refetch } = useVaultIndex(vault?.id);
  const current = data?.config || vault?.indexConfig;
  const [basket, setBasket] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewState, setPreviewState] = useState('idle');

  useEffect(() => {
    if (current && !basket) {
      setBasket({ targets: current.targets.map(t => ({ ...t })), reserveBps: current.reserveBps });
    }
  }, [current, basket]);

  const problem = basket ? validateIndexBasket(basket) : 'Loading the current basket';
  const unchanged = sameBasket(current, basket);

  useEffect(() => {
    onDataChange({
      indexReweight: basket ? toIndexBasketPayload(basket) : null,
      isValid: !problem && !unchanged,
    });
  }, [basket, problem, unchanged, onDataChange]);

  const diff = useMemo(() => diffBaskets(current, basket), [current, basket]);
  const symbolOf = address =>
    basket?.targets.find(t => t.assetAddress === address)?.symbol ||
    current?.targets.find(t => t.assetAddress === address)?.symbol ||
    `${address.slice(0, 6)}…`;

  const runPreview = async () => {
    setPreviewState('loading');
    try {
      setPreview(await VaultsApiProvider.previewIndexReweight(vault.id, toIndexBasketPayload(basket)));
      setPreviewState('idle');
    } catch (err) {
      setPreview(null);
      setPreviewState(err?.response?.data?.message || 'The trade preview is unavailable right now.');
    }
  };

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
        Set the new target weights. If the proposal passes, the vault adopts them and trades automatically: it sells
        what is over target, then buys what is under target with the proceeds.
      </p>

      <IndexBasketEditor
        steel
        value={basket}
        onChange={next => {
          setBasket(next);
          setPreview(null);
        }}
        error={
          error ? problem || (unchanged ? 'Change at least one weight to create a re-weight proposal' : null) : null
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
          </ul>
        </div>
      )}

      {!unchanged && !problem && vault?.contractAddress && (
        <div className="space-y-3">
          <SecondaryButton size="sm" onClick={runPreview} disabled={previewState === 'loading'}>
            {previewState === 'loading' ? 'Estimating trades…' : 'Estimate trades at current prices'}
          </SecondaryButton>
          {previewState !== 'idle' && previewState !== 'loading' && (
            <p className="text-sm text-red-400">{previewState}</p>
          )}
          {preview && (
            <div className="space-y-2 rounded-lg bg-steel-800 p-4 text-sm">
              {preview.sells.length === 0 && preview.buys.length === 0 ? (
                <p className="text-dark-100">All assets are within tolerance of the new weights — no trades needed.</p>
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
                </>
              )}
              <p className="pt-1 text-xs text-dark-100">
                Estimate only. Trades are sized again from live prices when the proposal executes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndexReweight;
