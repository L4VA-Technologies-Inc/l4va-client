import { X, Copy, PowerOff } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { getAvatarLetter, substringAddress } from '@/utils/core.utils';

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
      <div className="bg-[#181A2A] absolute top-0 right-4 z-50 w-[360px] rounded-t-[10px]">
        <div className="rounded-t-[10px] flex items-center justify-between px-4 py-2 bg-white/5">
          <p className="font-bold text-2xl">
            Wallet
          </p>
          <button
            className="p-1"
            type="button"
            onClick={onClose}
          >
            <X className="w-4 h-4" size={20}/>
          </button>
        </div>
        <div className="p-4 rounded-b-[10px]">
          <div className="flex items-center gap-2 mb-8">
            <Avatar className="h-20 w-20 bg-dark-600 cursor-pointer">
              <AvatarFallback className="text-white font-medium">
                {getAvatarLetter(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-[20px] mb-2">
                Profile Name
              </p>
              <p className="flex items-center gap-2 text-dark-100">
                {substringAddress(user.address)}
                <Copy size={20} />
              </p>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
            >
              <PowerOff className="text-dark-100" size={20} />
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            <button
              className="rounded-[10px] bg-dark-500 py-3 text-[20px] font-medium text-center hover:bg-[#2D3049]"
              type="button"
              onClick={handleDisconnect}
            >
              My profile
            </button>
            <button
              className="rounded-[10px] bg-dark-500 py-3 text-[20px] font-medium text-center hover:bg-[#2D3049]"
              type="button"
              onClick={handleDisconnect}
            >
              My vaults
            </button>
            <button
              className="rounded-[10px] bg-dark-500 py-3 text-[20px] font-medium text-center hover:bg-[#2D3049]"
              type="button"
              onClick={handleDisconnect}
            >
              Swap ADA/VLRM
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
