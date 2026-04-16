import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Button } from '@/components/ui/button';
import { useVlrmBalance } from '@/hooks/useVlrmBalance';
import { useStakeTransaction } from '@/hooks/useStakeTransaction';
import { useMyStakedBalance } from '@/services/api/queries';
import {
  clampDecimalInput,
  formatDateTime as formatDateTimeUtil,
  formatRawNumber,
  includesUtxoRef,
  sumExactDecimals,
} from '@/utils/core.utils';

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

const TABS = ['Stake', 'Unstake'] as const;

type TabKey = 'stake' | 'unstake';

const includesRef = (arr: UtxoRefDto[], ref: UtxoRefDto) => includesUtxoRef(arr, ref);

export const StakingWidget: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('stake');
  const [amountRaw, setAmountRaw] = useState('');
  const [selected, setSelected] = useState<UtxoRefDto[]>([]);

  const { vlrmBalance, isLoading: isBalanceLoading, refreshBalance } = useVlrmBalance();
  const { stake, unstake, harvest, compound, isProcessing } = useStakeTransaction();
  const {
    data: stakedBoxes,
    isLoading: isBoxesLoading,
    isFetching: isBoxesFetching,
    refetch: refetchBoxes,
  } = useMyStakedBalance();

  const boxes: StakedBoxItem[] = useMemo(() => {
    const raw = stakedBoxes as unknown;
    if (Array.isArray(raw)) return raw as StakedBoxItem[];
    const maybeBoxes = (raw as { boxes?: unknown } | null)?.boxes;
    if (Array.isArray(maybeBoxes)) return maybeBoxes as StakedBoxItem[];
    return [];
  }, [stakedBoxes]);

  const amount = useMemo(() => {
    const num = Number(amountRaw);
    return Number.isFinite(num) ? num : 0;
  }, [amountRaw]);

  const canStake = amount > 0 && amount <= vlrmBalance && !isProcessing;

  const selectedPayout = useMemo(() => {
    if (!selected.length) return '0';
    const key = new Set(selected.map(s => `${s.txHash}:${s.outputIndex}`));
    const values = boxes.filter(b => key.has(`${b.txHash}:${b.outputIndex}`)).map(b => b.estimatedPayout);
    return values.length ? sumExactDecimals(values) : '0';
  }, [boxes, selected]);

  const selectedReward = useMemo(() => {
    if (!selected.length) return '0';
    const key = new Set(selected.map(s => `${s.txHash}:${s.outputIndex}`));
    const values = boxes.filter(b => key.has(`${b.txHash}:${b.outputIndex}`)).map(b => b.estimatedReward);
    return values.length ? sumExactDecimals(values) : '0';
  }, [boxes, selected]);

  const handleStake = async (stakeAmount: number) => {
    const hash = await stake({ assetId: ASSET_ID, amount: stakeAmount });
    if (hash) {
      setAmountRaw('');
    }
  };

  const handleUnstake = async (selectedRefs: UtxoRefDto[]) => {
    const hash = await unstake({ assetId: ASSET_ID, utxos: selectedRefs });
    if (hash) {
      setSelected([]);
    }
  };

  const handleHarvest = async (selectedRefs: UtxoRefDto[]) => {
    const hash = await harvest({ utxos: selectedRefs });
    if (hash) {
      setSelected([]);
    }
  };

  const handleCompound = async (selectedRefs: UtxoRefDto[]) => {
    const hash = await compound({ utxos: selectedRefs });
    if (hash) {
      setSelected([]);
    }
  };

  const toggleRef = (ref: UtxoRefDto) => {
    setSelected(prev =>
      includesRef(prev, ref)
        ? prev.filter(r => !(r.txHash === ref.txHash && r.outputIndex === ref.outputIndex))
        : [...prev, ref]
    );
  };

  const handleReload = async () => {
    await Promise.all([refreshBalance?.(), refetchBoxes()]);
  };

  return (
    <div className="w-full max-w-[920px] mx-auto">
      <div className="rounded-2xl border border-steel-750 bg-steel-950 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[13px] tracking-[0.12em] uppercase text-dark-100 flex items-center gap-2">
                <span>Staking</span>
                <HoverHelp
                  hint={
                    'Stake creates individual on-chain boxes (UTxOs).\n\n' +
                    'Eligibility:\n' +
                    '- Eligible (verified) boxes show a checkbox and can be selected.\n' +
                    '- Not verified boxes are visible but can’t be selected.\n\n' +
                    'Actions (for selected eligible boxes):\n' +
                    '- Unstake: sends deposit + reward to your wallet.\n' +
                    '- Harvest: sends only reward to your wallet; deposit stays staked.\n' +
                    '- Compound: restakes deposit + reward into a new box; nothing is sent to wallet.'
                  }
                />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="text-[18px] sm:text-[20px] font-semibold text-white">VLRM Widget</div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isProcessing || isBalanceLoading || isBoxesFetching}
                  onClick={handleReload}
                  title="Reload balances"
                  aria-label="Reload balances"
                  className="size-8 text-dark-100 hover:text-white hover:bg-steel-850"
                >
                  <RefreshCw className={isBoxesFetching || isBalanceLoading ? 'animate-spin' : ''} />
                </Button>
              </div>
            </div>

            <div className="self-start sm:self-auto flex items-center gap-3">
              <LavaTabs
                tabs={TABS}
                activeTab={tab === 'stake' ? 'Stake' : 'Unstake'}
                onTabChange={(v: string) => setTab(v === 'Stake' ? 'stake' : 'unstake')}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 pb-5 sm:pb-6">
          {tab === 'stake' ? (
            <div className="space-y-5">
              {/* Balance row */}
              <div className="flex items-center justify-between text-[12px] text-dark-100">
                <div className="truncate">
                  Balance:{' '}
                  <span className="text-white">{isBalanceLoading ? '…' : `${formatRawNumber(vlrmBalance)} VLRM`}</span>
                </div>
                <div className="text-gray-500">eUTxO staking</div>
              </div>
              <div className="text-[12px] text-dark-100 leading-relaxed">
                Stake creates a new on-chain box (UTxO). Manage withdrawals and rewards in the{' '}
                <span className="text-white">Unstake</span> tab.
              </div>

              {/* Amount input */}
              <div className="rounded-xl border border-steel-850 bg-input-bg px-4 py-4 focus-within:border-steel-600 transition">
                <div className="flex items-center gap-3">
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={amountRaw}
                    onChange={e => setAmountRaw(clampDecimalInput(e.target.value))}
                    className="lava-input w-full bg-transparent text-[28px] sm:text-[32px] leading-none tracking-tight text-white placeholder:text-gray-500 outline-none border-none focus:ring-0 h-auto py-0 px-0"
                  />
                  <SecondaryButton
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => setAmountRaw(String(vlrmBalance || 0))}
                  >
                    MAX
                  </SecondaryButton>
                </div>
                <div className="mt-3 flex items-center justify-between text-[12px] text-dark-100">
                  <div className="truncate">Asset: VLRM</div>
                  <div className="text-gray-500">Numbers only</div>
                </div>
              </div>

              {/* Stake CTA */}
              <PrimaryButton disabled={!canStake} onClick={() => handleStake(amount)} size="lg" className="w-full">
                Stake Tokens
              </PrimaryButton>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Subheader */}
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[12px] text-dark-100">Positions</div>
                  <div className="mt-1 text-[14px] font-medium text-white">Select eligible boxes to withdraw</div>
                </div>
                <div className="text-[12px] text-dark-100">
                  Selected: <span className="text-white">{selected.length}</span>
                </div>
              </div>

              {/* Positions list */}
              <div className="max-h-[360px] sm:max-h-[320px] overflow-auto rounded-xl border border-steel-750 bg-steel-900">
                <div className="divide-y divide-steel-750">
                  {isBoxesLoading ? (
                    <div className="px-5 py-8">
                      <div className="text-[12px] text-dark-100">Loading positions…</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-steel-800 overflow-hidden">
                        <div className="h-full w-1/3 bg-steel-600 animate-pulse" />
                      </div>
                    </div>
                  ) : boxes.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="text-[13px] font-medium text-white">No staked boxes yet</div>
                      <div className="mt-2 text-[12px] text-dark-100">
                        Stake tokens to create your first on-chain box, then manage withdrawals here.
                      </div>
                    </div>
                  ) : (
                    boxes.map(box => {
                      const ref: UtxoRefDto = { txHash: box.txHash, outputIndex: box.outputIndex };
                      const isSelected = includesRef(selected, ref);
                      const locked = !box.eligible;
                      const stakedAtText = formatDateTimeUtil(new Date(box.stakedAt), { variant: 'compact' }) ?? '-';

                      const isRowClickable = !locked;
                      const rowKey = `${box.txHash}:${box.outputIndex}`;

                      const onRowToggle = () => {
                        if (!isRowClickable) return;
                        toggleRef(ref);
                      };

                      return (
                        <div
                          key={rowKey}
                          role={isRowClickable ? 'button' : 'group'}
                          tabIndex={isRowClickable ? 0 : -1}
                          aria-disabled={isRowClickable ? undefined : true}
                          onClick={onRowToggle}
                          onKeyDown={e => {
                            if (!isRowClickable) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowToggle();
                            }
                          }}
                          className={[
                            'w-full text-left px-4 sm:px-5 py-4 transition outline-none',
                            isRowClickable
                              ? 'cursor-pointer hover:bg-steel-800 focus-visible:ring-2 focus-visible:ring-white/30'
                              : '',
                            locked ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          <div className="flex items-start sm:items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-white truncate">
                                {formatRawNumber(box.stakedAmount)} VLRM
                              </div>
                              <div className="mt-1 text-[12px] text-dark-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                  <div>
                                    Reward:{' '}
                                    <span className="text-green-400">+{formatRawNumber(box.estimatedReward)} VLRM</span>
                                  </div>
                                  <span className="hidden sm:inline text-steel-600">•</span>
                                  <div>
                                    Payout:{' '}
                                    <span className="text-white">{formatRawNumber(box.estimatedPayout)} VLRM</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-3">
                              {box.eligible ? (
                                <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                                  <LavaCheckbox
                                    name={`box-${box.txHash}-${box.outputIndex}`}
                                    checked={isSelected}
                                    onChange={() => toggleRef(ref)}
                                    label=""
                                    disabled={locked}
                                  />
                                </div>
                              ) : (
                                <div className="text-right max-w-[220px]">
                                  <div className="text-[12px] text-dark-100 flex items-center justify-end gap-2">
                                    <span>🔒</span>
                                    <span>Not verified</span>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <div className="text-[12px] text-dark-100">
                                      Staked At: <span className="text-white">{stakedAtText}</span>
                                    </div>
                                    <div className="text-[12px] text-gray-500">This box can’t be used yet.</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Footer summary */}
              <div className="rounded-xl border border-steel-750 bg-steel-950 px-4 sm:px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[12px] text-dark-100">Selected Payout</div>
                    <div className="mt-1 text-[16px] font-semibold text-white truncate">{selectedPayout} VLRM</div>
                    <div className="mt-1 text-[12px] text-dark-100 truncate">
                      Selected Reward: <span className="text-green-400">+{selectedReward} VLRM</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                    <SecondaryButton
                      disabled={selected.length === 0 || isProcessing}
                      onClick={() => handleHarvest(selected)}
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Harvest
                    </SecondaryButton>
                    <SecondaryButton
                      disabled={selected.length === 0 || isProcessing}
                      onClick={() => handleCompound(selected)}
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Compound
                    </SecondaryButton>
                    <PrimaryButton
                      disabled={selected.length === 0 || isProcessing}
                      onClick={() => handleUnstake(selected)}
                      size="md"
                      className="col-span-2 w-full sm:w-auto"
                    >
                      Unstake
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
