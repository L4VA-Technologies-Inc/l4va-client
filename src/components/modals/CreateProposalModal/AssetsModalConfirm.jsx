import { useState } from 'react';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox.jsx';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export const AssetsModalConfirm = ({ onClose, isOpen, onConfirm, title, description, confirming, understanding }) => {
  const [confirmBurn, setConfirmBurn] = useState(false);
  const [understandBurn, setUnderstandBurn] = useState(false);

  return (
    <>
      <ModalWrapper size="2xl" isOpen={isOpen} onClose={onClose} maxHeight="90vh" header={false}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span style={{ fontSize: '16px' }} className="text-lg font-medium mb-2">
              {title}
            </span>

            {description ? <span style={{ fontSize: '14px' }}>{description}</span> : null}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              <LavaCheckbox
                checked={understandBurn}
                onChange={e => setUnderstandBurn(e.target.checked)}
                description={understanding}
              />
            </div>
            <div className="flex justify-center gap-2">
              <LavaCheckbox
                checked={confirmBurn}
                onChange={e => setConfirmBurn(e.target.checked)}
                description={confirming}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <SecondaryButton onClick={onClose} size="lg">
              CANSEL
            </SecondaryButton>
            <PrimaryButton
              disabled={!understandBurn || !confirmBurn}
              onClick={onConfirm}
              size="lg"
              className="capitalize"
            >
              PROCEED
            </PrimaryButton>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};
