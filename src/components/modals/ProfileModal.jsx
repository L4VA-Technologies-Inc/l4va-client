import { LogOut, User, FolderOpen, ArrowLeftRight, RefreshCwIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useWallet } from '@ada-anvil/weld/react';

import { UserAvatar } from '@/components/shared/UserAvatar';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { formatNum } from '@/utils/core.utils';
import { useVlrmBalance } from '@/hooks/useVlrmBalance';

export const ProfileModal = () => {
  const { closeModal } = useModalControls();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'disconnect');

  const { vlrmBalance, isLoading, lastUpdated, refreshBalance } = useVlrmBalance();

  const handleDisconnect = () => {
    wallet.disconnect();
    logout();
    closeModal();
  };

  const handleNavigation = path => {
    if (path === '/vaults') {
      navigate({
        to: '/profile',
        search: { tab: 'all' },
      });
    } else {
      navigate({ to: path });
    }
    closeModal();
  };

  return (
    <ModalWrapper isOpen title="Profile" onClose={closeModal} size="md">
      <UserAvatar user={user} />
      <div
        className="flex justify-between items-center mt-4 p-3 bg-steel-850 rounded-lg"
        title={`Last synced ${lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}`}
      >
        <div className="flex items-center gap-2">
          <RefreshCwIcon
            className={`cursor-pointer text-dark-100 hover:text-white transition ${isLoading ? 'animate-spin' : ''}`}
            size={18}
            onClick={refreshBalance}
          />
          <span className="text-dark-100">$VLRM</span>
        </div>
        <span className="font-bold">{formatNum(vlrmBalance)} VLRM</span>
      </div>
      <div className="flex justify-between items-center mt-2 p-3 bg-steel-850 rounded-lg">
        <span className="text-dark-100">ADA</span>
        <span className="font-bold">{formatNum(wallet.balanceAda)} ADA</span>
      </div>
      <div className="flex flex-col space-y-4 mt-6">
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/profile')}>
          <User size={20} />
          My profile
        </SecondaryButton>
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/vaults')}>
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
