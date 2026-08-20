import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { useModalControls } from '@/lib/modals/modal.context';

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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} size="3xl" title="Asset whitelist">
      <div className="flex flex-col gap-6">
        <LavaWhitelistWithCaps
          required
          isExpandable={isExpandable}
          setWhitelist={setWhitelist}
          whitelist={whitelist}
          onExpandableChange={onExpandableChange}
        />
        <div className="flex justify-end">
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleClose}>
            Done
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
