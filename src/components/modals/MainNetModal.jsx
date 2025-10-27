import { CircleX } from 'lucide-react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import SecondaryButton from '@/components/shared/SecondaryButton.js';

export const MainNetModal = () => {
  const { closeModal } = useModalControls();

  return (
    <ModalWrapper isOpen title="Warning" onClose={closeModal} size="md">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl text-center font-bold mb-3">You’re connected to a mainnet wallet!</h1>

        <p className="text-sm text-gray-400 text-center">
          This app currently runs on testnet — please switch your wallet network to continue.
        </p>

        <SecondaryButton
          className="w-full justify-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
          onClick={closeModal}
        >
          <CircleX size={20} />
          Disconnect
        </SecondaryButton>
      </div>
    </ModalWrapper>
  );
};
