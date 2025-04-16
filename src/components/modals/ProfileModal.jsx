import { X } from 'lucide-react';

import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/shared/UserAvatar';

export const ProfileModal = ({
  user,
  handleDisconnect,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="bg-steel-950 absolute top-0 right-4 z-50 w-[360px] rounded-t-[10px]">
        <div className="rounded-t-[10px] flex items-center justify-between px-4 py-2 bg-white/5">
          <p className="font-bold text-2xl">
            Wallet
          </p>
          <button
            className="p-1"
            type="button"
            onClick={onClose}
          >
            <X className="w-4 h-4" size={20} />
          </button>
        </div>
        <div className="p-4 rounded-b-[10px]">
          <UserAvatar handleDisconnect={handleDisconnect} user={user} />
          <div className="flex flex-col space-y-4">
            <Link
              className="rounded-[10px] bg-dark-500 py-3 text-[20px] font-medium text-center hover:bg-steel-750"
              to="/profile"
              onClick={onClose}
            >
              My profile
            </Link>
            <Link
              className="rounded-[10px] bg-dark-500 py-3 text-[20px] font-medium text-center hover:bg-steel-750"
              to="/vaults/my"
              onClick={onClose}
            >
              My vaults
            </Link>
            <Link
              className="rounded-[10px] bg-dark-500 py-3 text-[20px] font-medium text-center hover:bg-steel-750"
              to="/swap"
              onClick={onClose}
            >
              Swap ADA/VLRM
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
