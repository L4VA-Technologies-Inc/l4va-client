import { Copy, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarLetter, getDisplayName, substringAddress } from '@/utils/core.utils';

export const UserAvatar = ({ user, handleDisconnect }) => {
  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="flex items-center gap-2 mb-8">
      <Avatar className="h-20 w-20 bg-steel-950 border border-steel-750 cursor-pointer">
        {user?.profileImage && <AvatarImage alt="Profile" className="object-cover" src={user.profileImage} />}
        <AvatarFallback className="text-white font-medium">{getAvatarLetter(user)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium text-[20px] mb-2">{getDisplayName(user)}</p>
        <button className="flex items-center gap-2 text-dark-100" type="button" onClick={handleCopyAddress}>
          {substringAddress(user.address)}
          <Copy size={20} />
        </button>
      </div>
      {handleDisconnect ? (
        <button
          className="text-dark-100 hover:text-red-600 transition-colors duration-200"
          type="button"
          onClick={handleDisconnect}
        >
          <PowerOff size={20} />
        </button>
      ) : null}
    </div>
  );
};
