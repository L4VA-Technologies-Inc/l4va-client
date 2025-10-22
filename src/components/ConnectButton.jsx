import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { getAvatarLetter, getDisplayName } from '@/utils/core.utils';
import WalletIcon from '@/icons/wallet.svg?react';

export const ConnectButton = ({ isFull = false }) => {
  const { openModal } = useModalControls();
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <div className="hidden sm:flex">
        {!isAuthenticated ? (
          <PrimaryButton className={isFull ? 'w-full' : ''} size="md" onClick={() => openModal('LoginModal')}>
            <WalletIcon />
            CONNECT
          </PrimaryButton>
        ) : (
          <PrimaryButton size="md" onClick={() => openModal('ProfileModal')}>
            <Avatar className="h-8 w-8 bg-steel-950 cursor-pointer">
              {user?.profileImage && <AvatarImage alt="Profile" className="object-cover" src={user.profileImage} />}
              <AvatarFallback className="text-white font-medium">{getAvatarLetter(user)}</AvatarFallback>
            </Avatar>
            {getDisplayName(user)}
          </PrimaryButton>
        )}
      </div>
      <div className="flex sm:hidden">
        {!isAuthenticated ? (
          isFull ? (
            <PrimaryButton className={isFull ? 'w-full' : ''} size="md" onClick={() => openModal('LoginModal')}>
              <WalletIcon />
              CONNECT
            </PrimaryButton>
          ) : (
            <button className="p-2 rounded-md bg-orange-gradient" type="button" onClick={() => openModal('LoginModal')}>
              <WalletIcon className="text-slate-950" height={24} width={24} />
            </button>
          )
        ) : (
          <button type="button" onClick={() => openModal('ProfileModal')}>
            <Avatar className="h-8 w-8 bg-orange-gradient cursor-pointer">
              {user?.profileImage && <AvatarImage alt="Profile" className="object-cover" src={user.profileImage} />}
              <AvatarFallback className="text-slate-950 font-medium">{getAvatarLetter(user)}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </>
  );
};
