import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import WalletIcon from '@/icons/wallet.svg?react';

import { useAuth } from '@/context/auth';
import { useModal } from '@/context/modals';

import { LoginModal } from '@/components/modals/LoginModal';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { getAvatarLetter, getDisplayName } from '@/utils/core.utils';

import { MODAL_TYPES } from '@/constants/core.constants';

const RADIX = 16;

const messageHex = msg => Array.from(msg).map(char =>
  char.charCodeAt(0).toString(RADIX).padStart(2, '0'),
).join('');

export const ConnectButton = () => {
  const {
    activeModal,
    openModal,
    closeModal,
    modalProps,
  } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    isAuthenticated,
    login,
    logout,
    user,
  } = useAuth();

  const wallet = useWallet(
    'isConnectingTo',
    'isConnected',
    'displayName',
    'handler',
    'stakeAddressBech32',
    'changeAddressBech32',
  );

  const connect = useWallet('connect');
  const disconnect = useWallet('disconnect');

  const handleConnect = (walletKey) => {
    if (walletKey) {
      connect(walletKey, {
        onSuccess: () => {
          console.log('Successfully connected to wallet');
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Failed to connect to wallet:', error);
          setIsLoading(false);
        },
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
    closeModal();
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) return false;
    setIsLoading(true);

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      await login(signature, wallet.stakeAddressBech32, wallet.changeAddressBech32);
      closeModal();
      return modalProps.onSuccess && modalProps.onSuccess();
    } catch (error) {
      return console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <PrimaryButton onClick={() => openModal(MODAL_TYPES.LOGIN)}>
          <WalletIcon />
          CONNECT
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={() => openModal(MODAL_TYPES.PROFILE)}>
          <Avatar className="h-10 w-10 bg-[#181A2A] cursor-pointer">
            <AvatarFallback className="text-white font-medium">
              {getAvatarLetter(user)}
            </AvatarFallback>
          </Avatar>
          {getDisplayName(user)}
        </PrimaryButton>
      )}
      <LoginModal
        disconnect={disconnect}
        isAuthenticated={isAuthenticated}
        isConnected={wallet.isConnected}
        isConnectingTo={wallet.isConnectingTo}
        isLoading={isLoading}
        isOpen={activeModal === MODAL_TYPES.LOGIN}
        onClose={closeModal}
        onConnect={handleConnect}
        onSignMessage={handleSignMessage}
      />
      <ProfileModal
        handleDisconnect={handleDisconnect}
        isOpen={activeModal === MODAL_TYPES.PROFILE}
        user={user}
        onClose={closeModal}
      />
    </>
  );
};
