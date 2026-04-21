import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Sprout, RefreshCcw } from 'lucide-react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useModalControls } from '@/lib/modals/modal.context';
import { formatRawNumber } from '@/utils/core.utils';

export type StakingAction = 'stake' | 'unstake' | 'harvest' | 'compound';

interface StakeToken {
  symbol: string;
  amount: number;
}

export interface StakingConfirmModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  action: StakingAction;
  tokens?: StakeToken[];
  selectedCount?: number;
  selectedPayout?: string;
  selectedReward?: string;
}

const ACTION_META: Record<
  StakingAction,
  { title: string; icon: React.ReactNode; confirmLabel: string; accentClass: string }
> = {
  stake: {
    title: 'Confirm Stake',
    icon: <ArrowDownToLine className="w-5 h-5 text-lava-500" />,
    confirmLabel: 'Stake',
    accentClass: 'text-lava-500',
  },
  unstake: {
    title: 'Confirm Unstake',
    icon: <ArrowUpFromLine className="w-5 h-5 text-amber-400" />,
    confirmLabel: 'Unstake',
    accentClass: 'text-amber-400',
  },
  harvest: {
    title: 'Confirm Harvest',
    icon: <Sprout className="w-5 h-5 text-green-400" />,
    confirmLabel: 'Harvest',
    accentClass: 'text-green-400',
  },
  compound: {
    title: 'Confirm Compound',
    icon: <RefreshCcw className="w-5 h-5 text-sky-400" />,
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
  tokens = [],
  selectedCount = 0,
  selectedPayout = '0',
  selectedReward = '0',
}) => {
  const { closeModal } = useModalControls();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    handleClose();
  };

  const { title, icon, confirmLabel, accentClass } = ACTION_META[action];

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
                  value={`${formatRawNumber(t.amount)} ${t.symbol}`}
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
              <Row label="Total reward" value={`+${selectedReward}`} valueClass="text-green-400" />
              <div className="border-t border-steel-750 pt-2">
                <Row label="You will receive" value={selectedPayout} valueClass={accentClass} />
              </div>
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
              <div className="border-t border-steel-750 pt-2">
                <Row label="Rewards to wallet" value={`+${selectedReward}`} valueClass={accentClass} />
              </div>
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
              <Row label="Reward" value={`+${selectedReward}`} valueClass="text-green-400" />
              <div className="border-t border-steel-750 pt-2">
                <Row label="Total restaked" value={selectedPayout} valueClass={accentClass} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-steel-900 rounded-xl border border-steel-750">
          {icon}
          <span className={`text-[14px] font-semibold ${accentClass}`}>{title}</span>
        </div>

        {renderDetails()}

        <p className="text-[12px] text-dark-100">
          This action will submit an on-chain transaction and cannot be undone.
        </p>

        <div className="flex flex-col md:flex-row gap-3 justify-end mt-2">
          <SecondaryButton className="w-full md:w-auto justify-center" onClick={handleClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleConfirm}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
