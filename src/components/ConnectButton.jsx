import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { getAvatarLetter, getDisplayName } from '@/utils/core.utils';
import WalletIcon from '@/icons/wallet.svg?react';

export const ConnectButton = () => {
  const { openModal } = useModalControls();
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <div className="hidden sm:flex">
        {!isAuthenticated ? (
          <PrimaryButton onClick={() => openModal('LoginModal')}>
            <WalletIcon />
            CONNECT
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => openModal('ProfileModal')}>
            <Avatar className="h-10 w-10 bg-steel-950 cursor-pointer">
              <AvatarFallback className="text-white font-medium">{getAvatarLetter(user)}</AvatarFallback>
            </Avatar>
            {getDisplayName(user)}
          </PrimaryButton>
        )}
      </div>

      <div className="flex sm:hidden">
        {!isAuthenticated ? (
          <button className="p-2 rounded-lg bg-orange-gradient" type="button" onClick={() => openModal('LoginModal')}>
            <WalletIcon className="text-slate-950" height={24} width={24} />
          </button>
        ) : (
          <button type="button" onClick={() => openModal('ProfileModal')}>
            <Avatar className="h-10 w-10 bg-orange-gradient cursor-pointer">
              <AvatarFallback className="text-slate-950 font-medium">{getAvatarLetter(user)}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </>
  );
};
