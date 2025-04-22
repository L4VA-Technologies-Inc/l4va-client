import { useWallet } from '@ada-anvil/weld/react';

import WalletIcon from '@/icons/wallet.svg?react';

import { useAuth } from '@/context/auth';
import { useModal } from '@/context/modals';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { getAvatarLetter, getDisplayName } from '@/utils/core.utils';

import { MODAL_TYPES } from '@/constants/core.constants';

export const ConnectButton = () => {
  const { openModal } = useModal();
  const { isAuthenticated, user } = useAuth();

  return (
    !isAuthenticated ? (
      <PrimaryButton onClick={() => openModal(MODAL_TYPES.LOGIN)}>
        <WalletIcon />
        CONNECT
      </PrimaryButton>
    ) : (
      <PrimaryButton onClick={() => openModal(MODAL_TYPES.PROFILE)}>
        <Avatar className="h-10 w-10 bg-steel-950 cursor-pointer">
          <AvatarFallback className="text-white font-medium">
            {getAvatarLetter(user)}
          </AvatarFallback>
        </Avatar>
        {getDisplayName(user)}
      </PrimaryButton>
    )
  );
};
