import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { LavaTabs } from '@/components/shared/LavaTabs';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Button } from '@/components/ui/button';
import { useModalControls } from '@/lib/modals/modal.context';
import { robinhoodChain } from '@/lib/evm/wagmi.config';
import { useEvmStakeTransaction } from '@/hooks/useEvmStakeTransaction';
import { useEvmStakeConfig, useMyStakedBalance, StakedBoxItem } from '@/services/api/queries';
import {
  clampDecimalInput,
  formatDateTime as formatDateTimeUtil,
  formatNum,
  sumExactDecimals,
} from '@/utils/core.utils';

const TABS = ['Stake', 'Unstake'] as const;
/** Display precision; amounts themselves are exact (parseUnits on the raw input). */
const DISPLAY_DECIMALS = 6;

type TabKey = 'stake' | 'unstake';

const formatTokenInputValue = (raw: string) => {
  if (!raw) return '';
  if (raw === '.') return raw;
  if (raw.endsWith('.')) return `${formatNum(raw.slice(0, -1), DISPLAY_DECIMALS)}.`;
  return String(formatNum(raw, DISPLAY_DECIMALS));
};

const safeParseUnits = (raw: string, decimals: number): bigint => {
  try {
    return raw && raw !== '.' ? parseUnits(raw, decimals) : 0n;
  } catch {
    return 0n;
  }
};

type EvmStakingWidgetProps = {
  focusOnMount?: boolean;
};

/**
 * Robinhood staking (L4VAStaking) — the EVM counterpart of StakingWidget.
 * Each stake opens its own position, like a Cardano box; Unstake / Harvest /
 * Compound act on the selected positions straight from the wallet.
 */
export const EvmStakingWidget: React.FC<EvmStakingWidgetProps> = ({ focusOnMount = false }) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TabKey>('stake');
  const [amountRaw, setAmountRaw] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const { openModal, updateModal } = useModalControls();
  const { address } = useAccount();

  const { data: config, isLoading: isConfigLoading } = useEvmStakeConfig();
  const token = useMemo(
    // Prefer the L4VA listing that is open for new stakes; a retired one stays listed for its open positions.
    () =>
      config?.tokens.find(t => t.type === 'L4VA' && t.enabled) ??
      config?.tokens.find(t => t.type === 'L4VA') ??
      config?.tokens.find(t => t.enabled),
    [config]
  );
  const symbol = token?.symbol ?? 'L4VA';
  const decimals = token?.decimals ?? 18;
  const maxBatch = config?.maxBatch ?? 25;
  const minStake = token ? BigInt(token.minStake) : 0n;
  const stakeFee = BigInt(config?.fees?.stakeFee ?? '0');
  const stakeFeeEth = stakeFee > 0n ? formatUnits(stakeFee, 18) : undefined;

  const {
    data: rawBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: token?.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: robinhoodChain.id,
    query: { enabled: !!token && !!address },
  });
  const balance = (rawBalance as bigint | undefined) ?? 0n;

  const { stake, unstake, harvest, compound, emergencyUnstake, status, isProcessing } = useEvmStakeTransaction({
    stakingAddress: config?.stakingAddress ?? undefined,
  });
  const {
    data: stakedBoxes,
    isLoading: isBoxesLoading,
    isFetching: isBoxesFetching,
    refetch: refetchBoxes,
  } = useMyStakedBalance();

  const positions: StakedBoxItem[] = useMemo(
    () => (stakedBoxes?.boxes ?? []).filter(b => !!b.positionId),
    [stakedBoxes]
  );

  useEffect(() => {
    if (!focusOnMount) return;
    setTab('stake');
    const timer = setTimeout(() => {
      const element = widgetRef.current;
      if (!element) return;
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 72 - 24;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [focusOnMount]);

  useEffect(() => {
    updateModal('StakingConfirmModal', { confirmStatus: status });
  }, [status, updateModal]);

  // Drop selections whose positions disappeared after a refetch.
  useEffect(() => {
    setSelected(prev => prev.filter(id => positions.some(p => p.positionId === id)));
  }, [positions]);

  const amount = useMemo(() => safeParseUnits(amountRaw, decimals), [amountRaw, decimals]);

  const stakeValidationMessage = useMemo(() => {
    if (amount === 0n) return '';
    if (amount < minStake) return `Minimum stake is ${formatNum(formatUnits(minStake, decimals), 2)} ${symbol}.`;
    if (amount > balance) return `Insufficient ${symbol} balance.`;
    return '';
  }, [amount, minStake, balance, decimals, symbol]);

  const canStake = !!token?.enabled && !isProcessing && amount > 0n && !stakeValidationMessage;

  const selectedTotals = useMemo(() => {
    const chosen = positions.filter(p => selected.includes(p.positionId!));
    if (!chosen.length) return [];
    return [
      {
        symbol,
        reward: sumExactDecimals(chosen.map(p => p.estimatedReward)),
        payout: sumExactDecimals(chosen.map(p => p.estimatedPayout)),
        principal: sumExactDecimals(chosen.map(p => p.stakedAmount)),
        maximumFractionDigits: DISPLAY_DECIMALS,
      },
    ];
  }, [positions, selected, symbol]);

  // The reward pool can't cover the selection: Unstake / Harvest / Compound
  // would revert, so offer the deposit-only exit instead.
  const reserveShort = useMemo(() => {
    if (!token || !selectedTotals[0]) return false;
    return safeParseUnits(String(selectedTotals[0].reward), decimals) > BigInt(token.rewardReserve);
  }, [token, selectedTotals, decimals]);

  const handleStake = () => {
    if (!canStake || !token) return;
    openModal('StakingConfirmModal', {
      action: 'stake',
      confirmStatus: status,
      tokens: [{ symbol, amount: Number(amountRaw) }],
      stakeFeeEth,
      stakeDescription: 'You are about to stake the following tokens. The stake opens a new on-chain position.',
      positionNoun: 'position',
      onConfirm: async () => {
        const hash = await stake({ token: token.address, amount, stakeFee });
        if (hash) {
          setAmountRaw('');
          refetchBalance();
        }
      },
    });
  };

  const openAction = (action: 'unstake' | 'harvest' | 'compound' | 'emergencyUnstake') => {
    const positionIds = [...selected];
    const send = { unstake, harvest, compound, emergencyUnstake }[action];
    openModal('StakingConfirmModal', {
      action,
      confirmStatus: status,
      selectedCount: positionIds.length,
      selectedTotals,
      positionNoun: 'position',
      onConfirm: async () => {
        const hash = await send({ positionIds });
        if (hash) {
          setSelected([]);
          refetchBalance();
        }
      },
    });
  };

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= maxBatch ? prev : [...prev, id]
    );
  };

  const handleReload = async () => {
    await Promise.all([refetchBalance(), refetchBoxes()]);
  };

  const balanceHuman = formatUnits(balance, decimals);
  const notConfigured = !isConfigLoading && (!config?.configured || !token);

  return (
    <div ref={widgetRef} className="flex w-full">
      <div className="w-full rounded-2xl border border-steel-750 bg-steel-950 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="text-[18px] sm:text-[20px] font-semibold text-white">Staking Widget</div>
              <HoverHelp
                hint={
                  'Each stake opens its own on-chain position.\n\n' +
                  'Actions (for selected positions):\n' +
                  '- Unstake: sends deposit + reward to your wallet.\n' +
                  '- Harvest: sends only reward to your wallet; deposit stays staked.\n' +
                  '- Compound: adds the reward to the deposit; nothing is sent to wallet.\n\n' +
                  'Harvest and Compound restart the position timer.'
                }
              />
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

            <div className="self-start sm:self-auto">
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
          {notConfigured ? (
            <div className="px-1 py-6 text-[13px] text-dark-100">Staking is not available on this network yet.</div>
          ) : tab === 'stake' ? (
            <div className="space-y-4">
              <div className="text-[12px] text-dark-100 leading-relaxed">
                Each stake opens a new on-chain position. Manage withdrawals in the{' '}
                <span className="text-white">Unstake</span> tab.
                <br />
                Minimum stake:{' '}
                <span className="text-white">
                  {formatNum(formatUnits(minStake, decimals), 2)} {symbol}
                </span>
                {token && !token.enabled ? <span className="ml-2 text-yellow-400">New stakes are paused.</span> : null}
                {stakeFeeEth ? (
                  <>
                    <br />
                    Staking fee: <span className="text-white">{stakeFeeEth} ETH per stake</span>
                  </>
                ) : null}
              </div>

              <div className="rounded-xl border border-steel-850 bg-input-bg px-4 py-4 focus-within:border-steel-600 transition">
                <div className="mb-3 flex items-center justify-between text-[12px] text-dark-100">
                  <div>
                    Balance:{' '}
                    <span className="text-white">
                      {isBalanceLoading ? '…' : `${formatNum(balanceHuman, 3)} ${symbol}`}
                    </span>
                  </div>
                  <div className="font-medium text-white tracking-wide">
                    {symbol}
                    {token ? (
                      <span className="ml-2 text-green-400 font-normal">{formatNum(token.apy, 2)}% APY</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={formatTokenInputValue(amountRaw)}
                    onChange={e => setAmountRaw(clampDecimalInput(e.target.value, decimals))}
                    className="lava-input w-full bg-transparent text-[28px] sm:text-[32px] leading-none tracking-tight text-white placeholder:text-gray-500 outline-none border-none focus:ring-0 h-auto py-0 px-0"
                  />
                  <SecondaryButton size="sm" disabled={isProcessing} onClick={() => setAmountRaw(balanceHuman)}>
                    MAX
                  </SecondaryButton>
                </div>
              </div>

              {stakeValidationMessage ? (
                <div className="text-[12px] text-red-400 leading-relaxed">{stakeValidationMessage}</div>
              ) : null}
              <PrimaryButton disabled={!canStake} onClick={handleStake} size="lg" className="w-full">
                Stake Tokens
              </PrimaryButton>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[12px] text-dark-100">Positions</div>
                  <div className="mt-1 text-[14px] font-medium text-white">Select positions to withdraw</div>
                </div>
                <div className="text-[12px] text-dark-100">
                  Selected: <span className="text-white">{selected.length}</span>
                </div>
              </div>
              {selected.length >= maxBatch ? (
                <div className="text-[12px] text-yellow-400 leading-relaxed">
                  You can select up to {maxBatch} positions. Deselect one to choose another.
                </div>
              ) : null}

              <div className="max-h-[360px] sm:max-h-[320px] overflow-auto rounded-xl border border-steel-750 bg-steel-900">
                <div className="divide-y divide-steel-750">
                  {isBoxesLoading ? (
                    <div className="px-5 py-8">
                      <div className="text-[12px] text-dark-100">Loading positions…</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-steel-800 overflow-hidden">
                        <div className="h-full w-1/3 bg-steel-600 animate-pulse" />
                      </div>
                    </div>
                  ) : positions.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="text-[13px] font-medium text-white">No staked positions yet</div>
                      <div className="mt-2 text-[12px] text-dark-100">
                        Stake tokens to open your first position, then manage withdrawals here.
                      </div>
                    </div>
                  ) : (
                    positions.map(p => {
                      const id = p.positionId!;
                      const isSelected = selected.includes(id);
                      const disabledByLimit = selected.length >= maxBatch && !isSelected;
                      const stakedAtText = formatDateTimeUtil(new Date(p.stakedAt), { variant: 'compact' }) ?? '-';
                      const onRowToggle = () => {
                        if (!disabledByLimit) toggle(id);
                      };

                      return (
                        <div
                          key={id}
                          role="button"
                          tabIndex={disabledByLimit ? -1 : 0}
                          aria-disabled={disabledByLimit || undefined}
                          onClick={onRowToggle}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowToggle();
                            }
                          }}
                          className={[
                            'w-full text-left px-4 sm:px-5 py-4 transition outline-none',
                            disabledByLimit
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:bg-steel-800 focus-visible:ring-2 focus-visible:ring-white/30',
                          ].join(' ')}
                        >
                          <div className="flex items-start sm:items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-white truncate">
                                {formatNum(p.stakedAmount, DISPLAY_DECIMALS)}{' '}
                                <span className="text-dark-100 text-[12px] font-normal">{symbol}</span>
                                {p.apy !== undefined ? (
                                  <span className="ml-2 text-dark-100 text-[12px] font-normal">
                                    {formatNum(p.apy, 2)}% APY
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1 text-[12px] text-dark-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                  <div>
                                    Reward:{' '}
                                    <span className="text-green-400">
                                      +{formatNum(p.estimatedReward, DISPLAY_DECIMALS)} {symbol}
                                    </span>
                                  </div>
                                  <span className="hidden sm:inline text-steel-600">•</span>
                                  <div>
                                    Payout:{' '}
                                    <span className="text-white">
                                      {formatNum(p.estimatedPayout, DISPLAY_DECIMALS)} {symbol}
                                    </span>
                                  </div>
                                  <span className="hidden sm:inline text-steel-600">•</span>
                                  <div>Since {stakedAtText}</div>
                                </div>
                              </div>
                            </div>

                            <div
                              className="shrink-0"
                              onClick={e => e.stopPropagation()}
                              onKeyDown={e => e.stopPropagation()}
                            >
                              <LavaCheckbox
                                name={`position-${id}`}
                                checked={isSelected}
                                onChange={() => toggle(id)}
                                label=""
                                disabled={disabledByLimit}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {reserveShort ? (
                <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 px-4 sm:px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-[12px] text-yellow-400 leading-relaxed">
                      The reward pool can't cover these rewards right now, so Unstake, Harvest and Compound will fail.
                      You can wait until it is topped up, or withdraw just your deposit now — the accrued reward is
                      forfeited.
                    </div>
                    <SecondaryButton
                      disabled={isProcessing}
                      onClick={() => openAction('emergencyUnstake')}
                      size="md"
                      className="w-full sm:w-auto shrink-0"
                    >
                      Withdraw deposit only
                    </SecondaryButton>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-steel-750 bg-steel-950 px-4 sm:px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[12px] text-dark-100">Selected Payout</div>
                    <div className="mt-1 text-[16px] font-semibold text-white truncate">
                      {selectedTotals[0] ? `${formatNum(selectedTotals[0].payout, DISPLAY_DECIMALS)} ${symbol}` : '0'}
                    </div>
                    <div className="mt-1 text-[12px] text-dark-100 truncate">
                      Selected Reward:{' '}
                      <span className="text-green-400">
                        +
                        {selectedTotals[0] ? `${formatNum(selectedTotals[0].reward, DISPLAY_DECIMALS)} ${symbol}` : '0'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                    <SecondaryButton
                      disabled={selected.length === 0 || isProcessing}
                      onClick={() => openAction('harvest')}
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Harvest
                    </SecondaryButton>
                    <SecondaryButton
                      disabled={selected.length === 0 || isProcessing}
                      onClick={() => openAction('compound')}
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Compound
                    </SecondaryButton>
                    <PrimaryButton
                      disabled={selected.length === 0 || isProcessing}
                      onClick={() => openAction('unstake')}
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
