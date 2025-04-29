import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { useAuth } from '@/lib/auth/auth';
import { useModal, useModalControls } from '@/lib/modals/modal.context';

import { LoginModal } from '@/components/modals/LoginModal';
import { ProfileModal } from '@/components/modals/ProfileModal';

const messageHex = (msg) =>
  Array.from(msg)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

export const AuthModals = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, login, logout, user } = useAuth();

  const wallet = useWallet('isConnectingTo', 'isConnected', 'handler', 'stakeAddressBech32', 'changeAddressBech32');

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
      return activeModalData?.props?.onSuccess && activeModalData.props.onSuccess();
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
        isOpen={activeModalData?.name === 'LoginModal'}
        onClose={closeModal}
        onConnect={handleConnect}
        onSignMessage={handleSignMessage}
      />
      <ProfileModal
        handleDisconnect={handleDisconnect}
        isOpen={activeModalData?.name === 'ProfileModal'}
        user={user}
        onClose={closeModal}
      />
    </>
  );
};
