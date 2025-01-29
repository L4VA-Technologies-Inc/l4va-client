import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import { useAuth } from '../context/auth';
import { LoginModal } from './modals/LoginModal.jsx';
import { PrimaryButton } from './shared/PrimaryButton.jsx';
import WalletIcon from '../icons/wallet.svg?react';

const RADIX = 16;

const messageHex = msg => Array.from(msg).map(char =>
  char.charCodeAt(0).toString(RADIX).padStart(2, '0'),
).join('');

export const ConnectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isAuthenticated,
    login,
    logout,
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
        },
        onError: (error) => {
          console.error('Failed to connect to wallet:', error);
        },
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
    setIsModalOpen(false);
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) return;
    setIsLoading(true);

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      await login(signature, wallet.stakeAddressBech32);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <PrimaryButton
          className="w-[226px] h-[60px]"
          icon={WalletIcon}
          onClick={() => setIsModalOpen(true)}
        >
          CONNECT
        </PrimaryButton>
      ) : (
        <PrimaryButton
          className="w-[226px] h-[60px]"
          onClick={handleDisconnect}
        >
          DISCONNECT
        </PrimaryButton>
      )}

      <LoginModal
        isAuthenticated={isAuthenticated}
        isConnected={wallet.isConnected}
        isConnectingTo={wallet.isConnectingTo}
        isLoading={isLoading}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
        onSignMessage={handleSignMessage}
      />
    </>
  );
};
