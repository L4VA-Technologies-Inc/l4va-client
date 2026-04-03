import React, { useEffect, useMemo, useState } from 'react';

import { useVlrmBalance } from '@/hooks/useVlrmBalance';
import { useStakeTransaction } from '@/hooks/useStakeTransaction';
import { useMyStakedBalance } from '@/services/api/queries';

export interface StakedBoxItem {
  txHash: string;
  outputIndex: number;
  unit: string;
  policyId: string;
  stakedAmount: number;
  stakedAt: number;
  estimatedReward: number;
  estimatedPayout: number;
  eligible: boolean;
  cooldownEndsAt: number;
}

export interface UtxoRefDto {
  txHash: string;
  outputIndex: number;
}

const VLRM_TOKEN_ID = (import.meta as any).env.VITE_VLRM_TOKEN_ID as string | undefined;
const ASSET_ID = VLRM_TOKEN_ID ?? 'VLRM';

type TabKey = 'stake' | 'unstake';

const nowMs = () => Date.now();
const clampAmountInput = (raw: string) => raw.replace(/[^\d.]/g, '').replace(/^(\d+)\.(\d*).*$/, '$1.$2');

const formatRawNumber = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Object.is(n, -0)) return '0';
  return String(n);
};

const formatDateTime = (unixMs: number) => {
  const d = new Date(unixMs);
  return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const formatCountdown = (unixMs: number) => {
  const diffMs = Math.max(0, unixMs - nowMs());
  const diff = Math.floor(diffMs / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h <= 0 && m <= 0) return 'Unlocking soon';
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const includesRef = (arr: UtxoRefDto[], ref: UtxoRefDto) =>
  arr.some(r => r.txHash === ref.txHash && r.outputIndex === ref.outputIndex);

export const StakingWidget: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('stake');
  const [amountRaw, setAmountRaw] = useState('');
  const [selected, setSelected] = useState<UtxoRefDto[]>([]);
  const [cooldownTick, setCooldownTick] = useState(0);

  const { vlrmBalance, isLoading: isBalanceLoading } = useVlrmBalance();
  const { stake, unstake, isProcessing } = useStakeTransaction();
  const { data: stakedBoxes, isLoading: isBoxesLoading } = useMyStakedBalance();

  useEffect(() => {
    const t = setInterval(() => setCooldownTick(x => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const boxes: StakedBoxItem[] = useMemo(() => {
    // `cooldownTick` exists to update countdown text every 30s without re-fetching.
    void cooldownTick;

    // Be defensive: depending on axios/transformers, payload may be wrapped.
    const raw = stakedBoxes as unknown;
    if (Array.isArray(raw)) return raw as StakedBoxItem[];
    const maybeBoxes = (raw as { boxes?: unknown } | null)?.boxes;
    if (Array.isArray(maybeBoxes)) return maybeBoxes as StakedBoxItem[];
    return [];
  }, [cooldownTick, stakedBoxes]);

  const amount = useMemo(() => {
    const num = Number(amountRaw);
    return Number.isFinite(num) ? num : 0;
  }, [amountRaw]);

  const canStake = amount > 0 && amount <= vlrmBalance && !isProcessing;

  const selectedPayout = useMemo(() => {
    if (!selected.length) return 0;
    const key = new Set(selected.map(s => `${s.txHash}:${s.outputIndex}`));
    return boxes.reduce((sum, b) => (key.has(`${b.txHash}:${b.outputIndex}`) ? sum + b.estimatedPayout : sum), 0);
  }, [boxes, selected]);

  const handleStake = async (stakeAmount: number) => {
    // Stubbed: wire this to your real staking contract config as needed.
    await stake({ assetId: ASSET_ID, amount: stakeAmount });
  };

  const handleUnstake = async (selectedRefs: UtxoRefDto[]) => {
    // Stubbed: backend/build step may later require selected UTxO refs.
    await unstake({ assetId: ASSET_ID, utxos: selectedRefs });
  };

  return (
    <div className="w-full max-w-[920px] mx-auto">
      <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/70 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[13px] tracking-[0.12em] uppercase text-white/50">Staking</div>
              <div className="mt-1 text-[20px] font-semibold text-white/90">VLRM Widget</div>
            </div>

            <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setTab('stake')}
                className={[
                  'px-4 py-2 text-[13px] rounded-lg transition',
                  tab === 'stake'
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5',
                ].join(' ')}
              >
                Stake
              </button>
              <button
                type="button"
                onClick={() => setTab('unstake')}
                className={[
                  'px-4 py-2 text-[13px] rounded-lg transition',
                  tab === 'unstake'
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5',
                ].join(' ')}
              >
                Unstake
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {tab === 'stake' ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-[12px] text-white/55">
                <div className="truncate">
                  Balance:{' '}
                  <span className="text-white/80">
                    {isBalanceLoading ? '…' : `${formatRawNumber(vlrmBalance)} VLRM`}
                  </span>
                </div>
                <div className="text-white/40">eUTxO staking</div>
              </div>

              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 focus-within:border-white/20 focus-within:bg-white/[0.06] transition">
                  <div className="flex items-center gap-3">
                    <input
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0"
                      value={amountRaw}
                      onChange={e => setAmountRaw(clampAmountInput(e.target.value))}
                      className="w-full bg-transparent text-[32px] leading-none tracking-tight text-white/90 placeholder:text-white/20 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setAmountRaw(String(vlrmBalance || 0))}
                      className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-medium tracking-wide text-white/70 hover:bg-white/10 hover:text-white/85 transition"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-white/45">
                    <div className="truncate">Asset: {ASSET_ID === 'VLRM' ? 'VLRM' : 'VLRM Token'}</div>
                    <div className="text-white/35">Numbers only</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canStake}
                onClick={() => handleStake(amount)}
                className={[
                  'w-full rounded-2xl px-5 py-4 text-[14px] font-semibold tracking-wide transition',
                  canStake
                    ? 'bg-white text-black hover:bg-white/90 active:bg-white/85'
                    : 'bg-white/10 text-white/30 cursor-not-allowed',
                ].join(' ')}
              >
                Stake Tokens
              </button>

              <div className="text-[12px] text-white/35 leading-relaxed">
                Staking creates individual on-chain “boxes” (UTxOs). Unstaking requires selecting eligible boxes.
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[12px] text-white/50">Positions</div>
                  <div className="mt-1 text-[14px] font-medium text-white/80">Select eligible boxes to withdraw</div>
                </div>
                <div className="text-[12px] text-white/45">
                  Selected: <span className="text-white/75">{selected.length}</span>
                </div>
              </div>

              <div className="max-h-[320px] overflow-auto rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="divide-y divide-white/10">
                  {isBoxesLoading ? (
                    <div className="px-5 py-8">
                      <div className="text-[12px] text-white/45">Loading positions…</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-1/3 bg-white/10 animate-pulse" />
                      </div>
                    </div>
                  ) : boxes.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="text-[13px] font-medium text-white/70">No staked boxes yet</div>
                      <div className="mt-2 text-[12px] text-white/40">
                        Stake tokens to create your first on-chain box, then manage withdrawals here.
                      </div>
                    </div>
                  ) : (
                    boxes.map(box => {
                      const ref: UtxoRefDto = { txHash: box.txHash, outputIndex: box.outputIndex };
                      const isSelected = includesRef(selected, ref);
                      const locked = !box.eligible;
                      const cooldownText = locked
                        ? `${formatCountdown(box.cooldownEndsAt)} · ${formatDateTime(box.cooldownEndsAt)}`
                        : '';

                      return (
                        <button
                          key={`${box.txHash}:${box.outputIndex}`}
                          type="button"
                          disabled={locked}
                          onClick={() => {
                            if (locked) return;
                            setSelected(prev =>
                              includesRef(prev, ref)
                                ? prev.filter(r => !(r.txHash === ref.txHash && r.outputIndex === ref.outputIndex))
                                : [...prev, ref]
                            );
                          }}
                          className={[
                            'w-full text-left px-5 py-4 transition',
                            locked ? 'opacity-55 cursor-not-allowed' : 'hover:bg-white/[0.04]',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-white/85 truncate">
                                {formatRawNumber(box.stakedAmount)} VLRM
                              </div>
                              <div className="mt-1 text-[12px] text-white/45">
                                Reward:{' '}
                                <span className="text-white/65">+{formatRawNumber(box.estimatedReward)} VLRM</span>
                                <span className="mx-2 text-white/25">•</span>
                                Payout:{' '}
                                <span className="text-white/70">{formatRawNumber(box.estimatedPayout)} VLRM</span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-3">
                              {box.eligible ? (
                                <div
                                  className={[
                                    'h-5 w-5 rounded-md border transition grid place-items-center',
                                    isSelected ? 'border-white bg-white' : 'border-white/30 bg-transparent',
                                  ].join(' ')}
                                  aria-hidden
                                >
                                  <div
                                    className={[
                                      'h-[10px] w-[10px] rounded-[3px] transition',
                                      isSelected ? 'bg-black' : 'bg-transparent',
                                    ].join(' ')}
                                  />
                                </div>
                              ) : (
                                <div className="text-right">
                                  <div className="text-[12px] text-white/65">
                                    <span className="mr-2">🔒</span>Cooldown
                                  </div>
                                  <div className="mt-1 text-[12px] text-white/35">{cooldownText}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 rounded-2xl border border-white/10 bg-[#0b0f14]/85 backdrop-blur-xl px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[12px] text-white/50">Selected Payout</div>
                    <div className="mt-1 text-[16px] font-semibold text-white/85 truncate">
                      {formatRawNumber(selectedPayout)} VLRM
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={selected.length === 0 || isProcessing}
                    onClick={() => handleUnstake(selected)}
                    className={[
                      'shrink-0 rounded-2xl px-5 py-3 text-[14px] font-semibold tracking-wide transition',
                      selected.length > 0 && !isProcessing
                        ? 'bg-white text-black hover:bg-white/90 active:bg-white/85'
                        : 'bg-white/10 text-white/30 cursor-not-allowed',
                    ].join(' ')}
                  >
                    Unstake Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
