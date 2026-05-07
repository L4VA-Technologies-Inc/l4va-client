import React, { useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { L4VA_DECIMALS, VLRM_DECIMALS } from '@/hooks/useTokenBalance';
import { useModalControls } from '@/lib/modals/modal.context';
import { formatNum } from '@/utils/core.utils';

export type StakingAction = 'stake' | 'unstake' | 'harvest' | 'compound';
type ConfirmStatus = 'idle' | 'building' | 'signing' | 'submitting';

interface StakeToken {
  symbol: string;
  amount: number;
}

interface SelectedTokenTotal {
  symbol: string;
  reward: string;
  payout: string;
  maximumFractionDigits?: number;
}

const getTokenMaxFractionDigits = (symbol: string) => (symbol === 'L4VA' ? L4VA_DECIMALS : VLRM_DECIMALS);

export interface StakingConfirmModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmStatus?: ConfirmStatus;
  action: StakingAction;
  tokens?: StakeToken[];
  selectedCount?: number;
  selectedTotals?: SelectedTokenTotal[];
}

const ACTION_META: Record<StakingAction, { title: string; confirmLabel: string; accentClass: string }> = {
  stake: {
    title: 'Confirm Stake',
    confirmLabel: 'Stake',
    accentClass: 'text-lava-500',
  },
  unstake: {
    title: 'Confirm Unstake',
    confirmLabel: 'Unstake',
    accentClass: 'text-amber-400',
  },
  harvest: {
    title: 'Confirm Harvest',
    confirmLabel: 'Harvest',
    accentClass: 'text-green-400',
  },
  compound: {
    title: 'Confirm Compound',
    confirmLabel: 'Compound',
    accentClass: 'text-sky-400',
  },
};

const Row: React.FC<{ label: string; value: React.ReactNode; valueClass?: string }> = ({
  label,
  value,
  valueClass = 'text-white',
}) => (
  <div className="flex items-center justify-between text-[13px]">
    <span className="text-dark-100">{label}</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export const StakingConfirmModal: React.FC<StakingConfirmModalProps> = ({
  isOpen = true,
  onClose,
  onConfirm,
  action,
  confirmStatus = 'idle',
  tokens = [],
  selectedCount = 0,
  selectedTotals = [],
}) => {
  const { closeModal } = useModalControls();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleRequestClose = () => {
    if (isConfirming) return;
    handleClose();
  };

  const handleConfirm = async () => {
    if (isConfirming) return;

    setIsConfirming(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      handleClose();
    } catch (error) {
      // Keep the modal open so async failures are visible to the caller UI.
      console.error('Staking confirmation failed', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const { title, confirmLabel, accentClass } = ACTION_META[action];
  const confirmButtonLabel =
    confirmStatus === 'building'
      ? 'Building...'
      : confirmStatus === 'signing'
        ? 'Signing...'
        : confirmStatus === 'submitting'
          ? 'Submitting...'
          : confirmLabel;
  const footer = (
    <div className="flex flex-col md:flex-row gap-3 justify-end">
      <SecondaryButton className="w-full md:w-auto justify-center" disabled={isConfirming} onClick={handleRequestClose}>
        Cancel
      </SecondaryButton>
      <PrimaryButton className="w-full md:w-auto justify-center" disabled={isConfirming} onClick={handleConfirm}>
        {confirmButtonLabel}
      </PrimaryButton>
    </div>
  );

  const renderDetails = () => {
    switch (action) {
      case 'stake':
        return (
          <>
            <p className="text-[13px] text-dark-100 leading-relaxed">
              You are about to stake the following tokens into on-chain UTxO boxes. Each token creates a separate box.
            </p>
            <div className="rounded-xl border border-steel-750 bg-steel-900 px-4 py-3 space-y-2">
              {tokens.map(t => (
                <Row
                  key={t.symbol}
                  label={t.symbol}
                  value={`${formatNum(t.amount, getTokenMaxFractionDigits(t.symbol))} ${t.symbol}`}
                  valueClass={accentClass}
                />
              ))}
            </div>
          </>
        );

      case 'unstake':
        return (
          <>
            <p className="text-[13px] text-dark-100 leading-relaxed">
              You are about to unstake{' '}
              <span className="text-white font-medium">
                {selectedCount} box{selectedCount !== 1 ? 'es' : ''}
              </span>
              . Your full deposit plus accumulated rewards will be returned to your wallet.
            </p>
            <div className="rounded-xl border border-steel-750 bg-steel-900 px-4 py-3 space-y-2">
              <Row label="Selected boxes" value={selectedCount} />
              {selectedTotals.map(total => (
                <div key={total.symbol} className="border-t border-steel-750 pt-2">
                  <Row
                    label={`Total reward (${total.symbol})`}
                    value={`+${formatNum(total.reward, total.maximumFractionDigits ?? getTokenMaxFractionDigits(total.symbol))} ${total.symbol}`}
                    valueClass="text-green-400"
                  />
                  <Row
                    label={`You will receive (${total.symbol})`}
                    value={`${formatNum(total.payout, total.maximumFractionDigits ?? getTokenMaxFractionDigits(total.symbol))} ${total.symbol}`}
                    valueClass={accentClass}
                  />
                </div>
              ))}
            </div>
          </>
        );

      case 'harvest':
        return (
          <>
            <p className="text-[13px] text-dark-100 leading-relaxed">
              You are about to harvest rewards from{' '}
              <span className="text-white font-medium">
                {selectedCount} box{selectedCount !== 1 ? 'es' : ''}
              </span>
              . Only the accumulated rewards will be sent to your wallet — your original deposit stays staked.
            </p>
            <div className="rounded-xl border border-steel-750 bg-steel-900 px-4 py-3 space-y-2">
              <Row label="Selected boxes" value={selectedCount} />
              <Row label="Deposit stays staked" value="Yes" valueClass="text-dark-100" />
              {selectedTotals.map(total => (
                <div key={total.symbol} className="border-t border-steel-750 pt-2">
                  <Row
                    label={`Rewards to wallet (${total.symbol})`}
                    value={`+${formatNum(total.reward, total.maximumFractionDigits ?? getTokenMaxFractionDigits(total.symbol))} ${total.symbol}`}
                    valueClass={accentClass}
                  />
                </div>
              ))}
            </div>
          </>
        );

      case 'compound':
        return (
          <>
            <p className="text-[13px] text-dark-100 leading-relaxed">
              You are about to compound{' '}
              <span className="text-white font-medium">
                {selectedCount} box{selectedCount !== 1 ? 'es' : ''}
              </span>
              . Your deposit plus rewards will be restaked into new boxes — nothing is sent to your wallet.
            </p>
            <div className="rounded-xl border border-steel-750 bg-steel-900 px-4 py-3 space-y-2">
              <Row label="Selected boxes" value={selectedCount} />
              {selectedTotals.map(total => (
                <div key={total.symbol} className="border-t border-steel-750 pt-2">
                  <Row
                    label={`Reward (${total.symbol})`}
                    value={`+${formatNum(total.reward, total.maximumFractionDigits ?? getTokenMaxFractionDigits(total.symbol))} ${total.symbol}`}
                    valueClass="text-green-400"
                  />
                  <Row
                    label={`Total restaked (${total.symbol})`}
                    value={`${formatNum(total.payout, total.maximumFractionDigits ?? getTokenMaxFractionDigits(total.symbol))} ${total.symbol}`}
                    valueClass={accentClass}
                  />
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleRequestClose} title={title} size="md" footer={footer}>
      <div className="flex flex-col gap-4">
        {renderDetails()}
        <p className="text-[12px] text-dark-100">
          This action will submit an on-chain transaction and cannot be undone.
        </p>
      </div>
    </ModalWrapper>
  );
};
