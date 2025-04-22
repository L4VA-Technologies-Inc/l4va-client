import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { useAuth } from '@/context/auth';
import { useModal } from '@/context/modals';

import { LoginModal } from '@/components/modals/LoginModal';
import { ProfileModal } from '@/components/modals/ProfileModal';

import { MODAL_TYPES } from '@/constants/core.constants';

const messageHex = msg => Array.from(msg).map(char =>
  char.charCodeAt(0).toString(16).padStart(2, '0'),
).join('');

export const AuthModals = () => {
  const {
    activeModal,
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
