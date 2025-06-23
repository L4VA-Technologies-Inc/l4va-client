import { LogOut, User, FolderOpen, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useWallet } from '@ada-anvil/weld/react';

import { UserAvatar } from '@/components/shared/UserAvatar';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';

export const ProfileModal = () => {
  const { closeModal } = useModalControls();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const disconnect = useWallet('disconnect');

  const handleDisconnect = () => {
    disconnect();
    logout();
    closeModal();
  };

  const handleNavigation = path => {
    navigate({ to: path });
    closeModal();
  };

  return (
    <ModalWrapper title="Wallet" modalName="ProfileModal" position="top-right">
      <UserAvatar user={user} />
      <div className="flex flex-col space-y-3 mt-6">
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/profile')}>
          <User size={20} />
          My profile
        </SecondaryButton>
        <SecondaryButton
          className="w-full justify-start gap-3 text-left"
          onClick={() => handleNavigation('/vaults/my')}
        >
          <FolderOpen size={20} />
          My vaults
        </SecondaryButton>
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/swap')}>
          <ArrowLeftRight size={20} />
          Swap ADA/$VLRM
        </SecondaryButton>

        <div className="border-t border-white/10 my-4" />

        <SecondaryButton
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
          onClick={handleDisconnect}
        >
          <LogOut size={20} />
          Disconnect wallet
        </SecondaryButton>
      </div>
    </ModalWrapper>
  );
};
