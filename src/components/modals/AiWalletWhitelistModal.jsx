import { useEffect, useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaWhitelist } from '@/components/shared/LavaWhitelist';
import { useModalControls } from '@/lib/modals/modal.context';

const withWalletIds = list =>
  (list || []).map((item, index) => ({
    ...item,
    id: item.id ?? `${Date.now()}-${index}`,
  }));

export const AiWalletWhitelistModal = ({
  isOpen = true,
  onClose,
  title = 'Wallet whitelist',
  description,
  label,
  whitelist = [],
  setWhitelist,
  required = false,
  maxItems = 100,
}) => {
  const { closeModal } = useModalControls();
  const [localWhitelist, setLocalWhitelist] = useState(() => withWalletIds(whitelist));

  useEffect(() => {
    if (!isOpen) return;
    setLocalWhitelist(withWalletIds(whitelist));
    // Re-seed only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) onClose();
    else closeModal();
  };

  const handleSetWhitelist = next => {
    const normalized = withWalletIds(next);
    setLocalWhitelist(normalized);
    setWhitelist?.(normalized);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} size="2xl" title={title}>
      <div className="flex flex-col gap-5">
        {description ? <p className="text-dark-100 text-sm leading-relaxed">{description}</p> : null}
        <LavaWhitelist
          allowCsv
          allowDeleteAll
          itemFieldName="walletAddress"
          itemPlaceholder="Wallet address"
          label={label || title}
          maxItems={maxItems}
          required={required}
          scrollOnOverflow
          setWhitelist={handleSetWhitelist}
          whitelist={localWhitelist}
          whitelistFieldName="walletWhitelist"
        />
        <div className="flex justify-end pt-1">
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleClose}>
            Done
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
