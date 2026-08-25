import { useEffect, useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { useModalControls } from '@/lib/modals/modal.context';
import { createEmptyWhitelistAsset } from '@/components/vaults/constants/vaults.constants';

// The table layout (search dropdown + cap columns) needs real width to lay out —
// hosting it inline in the 380px AI preview sidebar clipped/overflowed it, so it opens here instead.
export const AiAssetWhitelistModal = ({
  isOpen = true,
  onClose,
  whitelist = [],
  setWhitelist,
  isExpandable,
  onExpandableChange,
}) => {
  const { closeModal } = useModalControls();
  // Modal props are a snapshot from openModal — keep a live local copy so selecting
  // assets actually updates the UI (and push changes back to the parent draft).
  const [localWhitelist, setLocalWhitelist] = useState(() =>
    whitelist?.length ? whitelist : [createEmptyWhitelistAsset()]
  );
  const [localExpandable, setLocalExpandable] = useState(Boolean(isExpandable));

  useEffect(() => {
    if (!isOpen) return;
    setLocalWhitelist(whitelist?.length ? whitelist : [createEmptyWhitelistAsset()]);
    setLocalExpandable(Boolean(isExpandable));
    // Re-seed only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleSetWhitelist = next => {
    setLocalWhitelist(next);
    setWhitelist?.(next);
  };

  const handleExpandableChange = checked => {
    setLocalExpandable(checked);
    onExpandableChange?.(checked);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} size="4xl" title="Asset whitelist">
      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          <p className="text-dark-100 text-sm leading-relaxed">
            Choose which collections contributors can deposit. Open the dropdown to pick from your wallet, or type a
            collection name / Policy ID to search.
          </p>
          <p className="text-dark-100/80 text-xs leading-relaxed">
            Only verified collections can be added. Then set how many of each asset the vault accepts and how they are
            valued.
          </p>
        </div>

        <LavaWhitelistWithCaps
          required
          hideLabel
          itemPlaceholder="Search collection or paste Policy ID"
          isExpandable={localExpandable}
          setWhitelist={handleSetWhitelist}
          whitelist={localWhitelist}
          onExpandableChange={handleExpandableChange}
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
