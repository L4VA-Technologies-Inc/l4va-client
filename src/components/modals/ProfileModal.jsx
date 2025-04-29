import { X } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useWallet } from '@ada-anvil/weld/react';

import { UserAvatar } from '@/components/shared/UserAvatar';

import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';

import { useBodyOverflow } from '@/hooks/useBodyOverflow';

export const ProfileModal = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();
  const { user, logout } = useAuth();

  const disconnect = useWallet('disconnect');

  useBodyOverflow(activeModalData?.name === 'ProfileModal');

  const handleDisconnect = () => {
    disconnect();
    logout();
    closeModal();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={closeModal} />
      <div
        className="
          fixed z-50 bg-steel-950

          /* Desktop styles */
          md:absolute md:top-0 md:right-4 md:w-[360px] md:rounded-[10px]

          /* Mobile styles */
          max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:rounded-t-xl
        "
      >
        <div
          className="
            flex items-center justify-between px-4 bg-white/5

            /* Desktop styles */
            md:py-3 md:rounded-t-[10px]

            /* Mobile styles */
            max-md:py-3 max-md:rounded-t-xl
          "
        >
          <p className="font-bold text-2xl max-md:text-xl">Wallet</p>
          <button className="p-1" type="button" onClick={closeModal}>
            <X className="w-4 h-4" size={20} />
          </button>
        </div>
        <div className="p-4 md:p-5 md:rounded-b-[10px] max-md:pb-8">
          <UserAvatar handleDisconnect={handleDisconnect} user={user} />
          <div className="flex flex-col space-y-4 mt-4">
            <Link
              className="rounded-[10px] bg-steel-800 py-3 text-[20px] max-md:text-lg font-medium text-center hover:bg-steel-750"
              to="/profile"
              onClick={closeModal}
            >
              My profile
            </Link>
            <Link
              className="rounded-[10px] bg-steel-800 py-3 text-[20px] max-md:text-lg font-medium text-center hover:bg-steel-750"
              to="/vaults/my"
              onClick={closeModal}
            >
              My vaults
            </Link>
            <Link
              className="rounded-[10px] bg-steel-800 py-3 text-[20px] max-md:text-lg font-medium text-center hover:bg-steel-750"
              to="/swap"
              onClick={closeModal}
            >
              Swap ADA/VLRM
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
