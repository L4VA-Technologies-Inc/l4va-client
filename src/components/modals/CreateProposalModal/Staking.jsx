import { useMemo, useState, useEffect } from 'react';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelSelect } from '@/components/shared/LavaSelect';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';

const marketOptions = [
  { value: 'm1', label: 'Market 1' },
  { value: 'm2', label: 'Market 2' },
  { value: 'm3', label: 'Market 3' },
];

export default function Staking({ vaultId, onDataChange, error }) {
  const [fts, setFts] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [ftsAll, setFtsAll] = useState(false);
  const [nftsAll, setNftsAll] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data, isLoading } = useVaultAssetsForProposalByType(vaultId, 'stake');

  const ftSelected = useMemo(() => fts.filter(f => f.selected), [fts]);
  const nftSelected = useMemo(() => nfts.filter(n => n.selected), [nfts]);

  const invalidFT = useMemo(() => fts.some(f => f.selected && f.amount && Number(f.amount) > f.available), [fts]);
  const missingFTAmount = useMemo(() => fts.some(f => f.selected && (!f.amount || Number(f.amount) === 0)), [fts]);
  const noAssetsSelected = useMemo(
    () => ftSelected.length === 0 && nftSelected.length === 0,
    [ftSelected, nftSelected]
  );

  useEffect(() => {
    const allSelected = fts.length > 0 && fts.every(f => f.selected);
    setFtsAll(allSelected);
  }, [fts]);

  useEffect(() => {
    const allSelected = nfts.length > 0 && nfts.every(n => n.selected);
    setNftsAll(allSelected);
  }, [nfts]);

  function toggleFT(id) {
    setFts(prev => prev.map(f => (f.id === id ? { ...f, selected: !f.selected } : f)));
  }
  function toggleNFT(id) {
    setNfts(prev => prev.map(n => (n.id === id ? { ...n, selected: !n.selected } : n)));
  }

  function setFTAmount(id, next) {
    const v = String(next).replace(/[^0-9.]/g, '');
    setFts(prev => prev.map(f => (f.id === id ? { ...f, amount: v } : f)));
  }
  function setFTMax(id) {
    setFts(prev => prev.map(f => (f.id === id ? { ...f, amount: String(f.available) } : f)));
  }

  function setAllFTs() {
    const newValue = !ftsAll;
    setFtsAll(newValue);
    setFts(prev => prev.map(f => ({ ...f, selected: newValue })));
  }
  function setAllNFTs() {
    const newValue = !nftsAll;
    setNftsAll(newValue);
    setNfts(prev => prev.map(n => ({ ...n, selected: newValue })));
  }

  useEffect(() => {
    const assetsArray = data?.data?.assets;

    if (Array.isArray(assetsArray) && assetsArray.length > 0 && !isLoading && !isInitialized) {
      const ftAssets = assetsArray
        .filter(asset => asset.type === 'ft')
        .map(asset => ({
          id: asset.id,
          symbol: asset.asset_id === 'lovelace' ? 'ADA' : asset.asset_id,
          available: parseFloat(asset.quantity || 0),
          selected: false,
          amount: '',
        }));

      const nftAssets = assetsArray
        .filter(asset => asset.type === 'nft')
        .map(asset => ({
          id: asset.id,
          project: asset?.name || 'Unknown Project',
          tokenLabel: asset?.name || 'Unknown Token',
          selected: false,
          market: 'm1',
        }));

      setFts(ftAssets);
      setNfts(nftAssets);
      setIsInitialized(true);
    }
  }, [data, isLoading, isInitialized]);

  useEffect(() => {
    if (onDataChange) {
      const hasErrors = noAssetsSelected || invalidFT || missingFTAmount;

      const stakingData = {
        fts: ftSelected.map(ft => ({
          id: ft.id,
          amount: ft.amount ? parseFloat(ft.amount) : ft.available,
        })),
        nfts: nftSelected.map(nft => ({
          id: nft.id,
          market: nft.market,
        })),
        isValid: !hasErrors,
      };

      onDataChange(stakingData);
    }
  }, [fts, nfts, ftSelected, nftSelected, onDataChange, noAssetsSelected, invalidFT, missingFTAmount]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-medium text-white">Assets to Stake</h3>
        {error && noAssetsSelected && (
          <div className="mt-2 text-xs text-red-400">Please select at least one asset to stake.</div>
        )}
      </div>
      <div className="rounded-xl border border-steel-750 bg-steel-850">
        <div className="flex items-center justify-between px-4 py-3 border-b border-steel-750">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-white">FTs</div>
            <label className="inline-flex items-center gap-2 text-xs text-white/60">
              <LavaCheckbox checked={ftsAll} onChange={setAllFTs} />
              Select All
            </label>
          </div>
          <div className="text-xs text-white/60">{ftSelected.length} selected</div>
        </div>

        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs text-white/60">
          <div className="col-span-5">Asset</div>
          <div className="col-span-4">Available</div>
          <div className="col-span-3 text-right sm:text-left">Amount</div>
        </div>

        <div className="divide-y divide-steel-750">
          {fts.map(row => (
            <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 py-3 items-center">
              <div className="sm:col-span-5 flex items-center gap-3">
                <LavaCheckbox
                  checked={row.selected}
                  onChange={() => toggleFT(row.id)}
                  ariaLabel={`Select ${row.symbol}`}
                />
                <span className="font-medium text-white">{row.symbol}</span>
              </div>

              <div className="sm:col-span-4 text-sm tabular-nums text-white/80">
                {row.available.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </div>

              <div className="sm:col-span-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <LavaSteelInput
                      placeholder="0.00"
                      value={row.amount}
                      onChange={v => setFTAmount(row.id, v)}
                      className={`text-right sm:text-left ${
                        error && row.selected && (!row.amount || Number(row.amount) === 0)
                          ? 'border-red-500/60'
                          : error && row.amount && Number(row.amount) > row.available
                            ? 'border-red-500/60'
                            : ''
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFTMax(row.id)}
                    className="text-xs px-2 py-1 rounded-md bg-steel-750 hover:bg-steel-800 text-white transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (invalidFT || missingFTAmount) && (
          <div className="px-4 pb-3 text-xs text-red-400">
            {missingFTAmount && <div>Amount is required for selected assets.</div>}
            {invalidFT && <div>One or more amounts exceed available balance.</div>}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-steel-750 bg-steel-850">
        <div className="flex items-center justify-between px-4 py-3 border-b border-steel-750">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-white">NFTs</div>
            <label className="inline-flex items-center gap-2 text-xs text-white/60">
              <LavaCheckbox checked={nftsAll} onChange={setAllNFTs} />
              Select All
            </label>
          </div>
          <div className="text-xs text-white/60">{nftSelected.length} selected</div>
        </div>

        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs text-white/60">
          <div className="col-span-5">Project</div>
          <div className="col-span-4">ID</div>
          <div className="col-span-3">Market</div>
        </div>

        <div className="divide-y divide-steel-750">
          {nfts.map(row => (
            <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 py-3 items-center">
              <div className="sm:col-span-5 flex items-center gap-3">
                <LavaCheckbox
                  checked={row.selected}
                  onChange={() => toggleNFT(row.id)}
                  ariaLabel={`Select ${row.project}`}
                />
                <div className="min-w-0">
                  <div className="font-medium truncate text-white">{row.project}</div>
                  <div className="text-xs text-white/60 truncate sm:hidden">{row.tokenLabel}</div>
                </div>
              </div>

              <div className="sm:col-span-4 hidden sm:block text-sm text-white/80">{row.tokenLabel}</div>

              <div className="sm:col-span-3">
                <LavaSteelSelect
                  options={marketOptions}
                  value={row.market}
                  onChange={v => {
                    const next = nfts.map(n => (n.id === row.id ? { ...n, market: v } : n));
                    setNfts(next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
