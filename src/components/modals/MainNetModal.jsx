import { CircleX } from 'lucide-react';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModal, useModalControls } from '@/lib/modals/modal.context';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { NETWORK_TYPES } from '@/constants/core.constants.js';

const getModalContent = networkType => {
  switch (networkType) {
    case NETWORK_TYPES.MAINNET_ON_TESTNET:
      return {
        title: 'Mainnet Wallet Detected',
        heading: "You're connected to a mainnet wallet!",
        description: 'This app currently runs on testnet. Please switch your wallet to a testnet network to continue.',
      };
    case NETWORK_TYPES.TESTNET_ON_MAINNET:
      return {
        title: 'Testnet Wallet Detected',
        heading: "You're connected to a testnet wallet!",
        description: 'This app runs on mainnet. Please switch your wallet to a mainnet network to continue.',
      };
    case NETWORK_TYPES.WALLET_NOT_WHITELISTED:
      return {
        title: 'Wallet Not Whitelisted',
        heading: 'Your wallet is not whitelisted!',
        description: 'This wallet address is not in the whitelist. Please use a whitelisted wallet to continue.',
      };
    default:
      return {
        title: 'Network Mismatch',
        heading: 'Wrong network detected!',
        description: 'Please switch your wallet to the correct network to continue.',
      };
  }
};

export const MainNetModal = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();

  const networkType = activeModalData?.props?.networkType;
  const onDisconnect = activeModalData?.props?.onDisconnect;
  const content = getModalContent(networkType);

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    }
    closeModal();
  };

  return (
    <ModalWrapper isOpen title={content.title} onClose={handleDisconnect} size="md">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl text-center font-bold mb-3">{content.heading}</h1>

        <p className="text-sm text-gray-400 text-center">{content.description}</p>

        <SecondaryButton
          className="w-full justify-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
          onClick={handleDisconnect}
        >
          <CircleX size={20} />
          Disconnect
        </SecondaryButton>
      </div>
    </ModalWrapper>
  );
};
