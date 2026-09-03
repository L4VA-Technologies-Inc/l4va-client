import { useEffect, useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { useModalControls } from '@/lib/modals/modal.context';

const withLinkIds = list =>
  (list || []).map((item, index) => ({
    ...item,
    id: item.id ?? `${Date.now()}-${index}`,
  }));

export const AiSocialLinksModal = ({ isOpen = true, onClose, socialLinks = [], setSocialLinks }) => {
  const { closeModal } = useModalControls();
  const [localLinks, setLocalLinks] = useState(() => withLinkIds(socialLinks));

  useEffect(() => {
    if (!isOpen) return;
    setLocalLinks(withLinkIds(socialLinks));
    // Re-seed only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) onClose();
    else closeModal();
  };

  const handleSetLinks = next => {
    const normalized = withLinkIds(next);
    setLocalLinks(normalized);
    setSocialLinks?.(normalized);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} size="2xl" title="Social links">
      <div className="flex flex-col gap-5">
        <p className="text-dark-100 text-sm leading-relaxed">Optional. Add the same social profiles as in manual setup.</p>
        <LavaSocialLinks setSocialLinks={handleSetLinks} socialLinks={localLinks} />
        <div className="flex justify-end pt-1">
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleClose}>
            Done
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
