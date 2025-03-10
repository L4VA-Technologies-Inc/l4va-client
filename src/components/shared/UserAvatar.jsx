import { Copy, PowerOff } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { getAvatarLetter, substringAddress } from '@/utils/core.utils';

export const UserAvatar = ({ user, handleDisconnect }) => (
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
    {handleDisconnect ? (
      <button
        type="button"
        onClick={handleDisconnect}
      >
        <PowerOff className="text-dark-100" size={20} />
      </button>
    ) : null}
  </div>
);
