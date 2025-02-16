import { useState } from 'react';
import { useWallet } from '@ada-anvil/weld/react';

import WalletIcon from '../icons/wallet.svg?react';

import { useAuth } from '@/context/auth';
import { useModal } from '@/context/modals';

import { LoginModal } from '@/components/modals/LoginModal';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    closeModal();
  };

  const handleSignMessage = async () => {
    if (!wallet.isConnected || !wallet.handler) return false;
    setIsLoading(true);

    try {
      const message = `account: ${wallet.stakeAddressBech32}`;
      const signature = await wallet.handler.signData(messageHex(message));
      await login(signature, wallet.stakeAddressBech32);
      closeModal();
      return modalProps.onSuccess && modalProps.onSuccess();
    } catch (error) {
      return console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarLetter = () => {
    if (user) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      {!isAuthenticated ? (
        <PrimaryButton onClick={() => openModal(MODAL_TYPES.LOGIN)}>
          <WalletIcon />
          CONNECT
        </PrimaryButton>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none rounded-full">
            <Avatar className="h-10 w-10 bg-main-orange cursor-pointer">
              <AvatarFallback className=" font-medium">
                {getAvatarLetter()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-primary-background border border-dark-600 "
          >
            <DropdownMenuItem
              className="hover:bg-dark-600 cursor-pointer px-4 py-2 text-sm font-medium"
              onClick={handleDisconnect}
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    </>
  );
};
