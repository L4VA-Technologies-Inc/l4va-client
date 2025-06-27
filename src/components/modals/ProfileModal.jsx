import { LogOut, User, FolderOpen, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useWallet } from '@ada-anvil/weld/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { UserAvatar } from '@/components/shared/UserAvatar';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { formatNum } from '@/utils/core.utils';
import { TapToolsApiProvider } from '@/services/api/taptools';

export const ProfileModal = () => {
  const { closeModal } = useModalControls();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const disconnect = useWallet('disconnect');
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded');

  const [vlrmBalance, setVlrmBalance] = useState(0);

  const fetchAndFormatWalletAssets = async () => {
    try {
      const changeAddress = await wallet.handler.getChangeAddressBech32();
      const { data } = await TapToolsApiProvider.getWalletSummary(changeAddress);
      const vlrmToken = data.assets?.find(asset => asset.tokenId === import.meta.env.VITE_VLRM_TOKEN_ID);
      setVlrmBalance(vlrmToken ? vlrmToken.quantity : 0);
    } catch (err) {
      console.error('Error fetching wallet summary:', err);
      toast.error('Failed to load assets');
      setVlrmBalance(0);
    }
  };

  useEffect(() => {
    const loadWalletAssets = async () => {
      if (!wallet.handler) return;
      await fetchAndFormatWalletAssets();
    };
    loadWalletAssets();
  }, [wallet.handler]);

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
      <div className="flex justify-between items-center mt-4 p-3 bg-steel-850 rounded-lg">
        <span className="text-dark-100">$VLRM</span>
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
