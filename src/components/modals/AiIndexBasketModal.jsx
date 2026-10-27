import { useEffect, useState } from 'react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { IndexBasketEditor } from '@/components/vaults/index/IndexBasketEditor';
import { emptyIndexBasket, validateIndexBasket } from '@/components/vaults/index/indexVault.utils';
import { useModalControls } from '@/lib/modals/modal.context';

/**
 * The index basket, opened from the AI chat's "choose_basket" action.
 *
 * The assistant builds everything else about the vault but never invents token
 * addresses or weights, so this is where the user says what the index holds.
 */
export const AiIndexBasketModal = ({ isOpen = true, onClose, basket, setBasket }) => {
  const { closeModal } = useModalControls();
  // Modal props are a snapshot from openModal — keep a live local copy so edits
  // render here, and push every change back to the draft as it happens.
  const [localBasket, setLocalBasket] = useState(() => basket || emptyIndexBasket());

  useEffect(() => {
    if (!isOpen) return;
    setLocalBasket(basket || emptyIndexBasket());
    // Re-seed only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const problem = validateIndexBasket(localBasket);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleChange = next => {
    setLocalBasket(next);
    setBasket?.(next);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} size="3xl" title="Index basket">
      <div className="flex flex-col gap-5">
        <p className="text-dark-100 text-sm leading-relaxed">
          Choose the tokens this vault buys when the acquire window locks, and the share of the vault each one should
          be. Holders can re-weight the basket later through a governance proposal.
        </p>

        <IndexBasketEditor steel value={localBasket} onChange={handleChange} />

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-sm text-dark-100">{problem || 'The basket is ready.'}</p>
          <PrimaryButton className="w-full md:w-auto justify-center" onClick={handleClose}>
            Done
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
