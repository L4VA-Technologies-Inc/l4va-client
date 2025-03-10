import { useState, useRef } from 'react';
import {
  Edit3, Camera, Copy,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { getAvatarLetter, substringAddress } from '@/utils/core.utils';

export const Profile = () => {
  const [user, setUser] = useState({
    name: 'Profile Name',
    address: 'jr41jeoj2le9a8sdgf7a60cbe2dfbb6482je124fe',
  });

  const [bgImage, setBgImage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (nameInputRef.current?.value) {
      setUser({ ...user, name: nameInputRef.current.value });
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    }
  };

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
    }
  };

  return (
    <div className="min-h-screen bg-primary-background">
      <div className="flex justify-center pt-20 pb-8">
        <span className="font-russo text-[40px] uppercase">
          My Profile
        </span>
      </div>

      <div className="relative w-full h-64 bg-dark-600 overflow-hidden group">
        {bgImage ? (
          <img
            alt="Profile Background"
            className="w-full h-full object-cover"
            src={bgImage}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <button
              className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-dark-500 rounded-md px-4 py-2 font-medium text-dark-100 transition-all duration-200"
              onClick={() => bgInputRef.current.click()}
            >
              <Camera size={20} />
              Replace photo
            </button>
          </div>
        )}
        {bgImage && (
          <button
            className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 flex items-center gap-2 bg-dark-600 bg-opacity-70 rounded-md px-3 py-1.5 font-medium text-dark-100 transition-all duration-200"
            onClick={() => bgInputRef.current.click()}
          >
            <Camera size={16} />
            Replace photo
          </button>
        )}
        <input
          ref={bgInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleBgImageChange}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="relative -mt-16">
          <div className="flex flex-col md:flex-row">
            <div className="relative mr-4 mb-4 md:mb-0 group">
              <div className="h-32 w-32 rounded-full bg-dark-600 overflow-hidden border-4 border-primary-background">
                {avatar ? (
                  <img
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    src={avatar}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-dark-600">
                    <Avatar className="h-full w-full bg-dark-600">
                      <AvatarFallback className="text-white text-4xl font-medium">
                        {getAvatarLetter(user)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <button
                  className="opacity-0 group-hover:opacity-100 absolute bottom-0 right-0 p-2 bg-dark-600 rounded-full hover:bg-dark-500 transition-all duration-200"
                  onClick={() => avatarInputRef.current.click()}
                >
                  <Camera className="text-dark-100" size={16} />
                </button>
                <input
                  ref={avatarInputRef}
                  accept="image/*"
                  className="hidden"
                  type="file"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="flex-1 md:pt-8">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    autoFocus
                    className="text-2xl font-medium bg-dark-600 border border-dark-500 rounded px-2 py-1 outline-none focus:border-main-orange"
                    defaultValue={user.name}
                    type="text"
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                  />
                ) : (
                  <>
                    <h1 className="text-2xl font-medium">{user.name}</h1>
                    <button className="hover:text-main-orange transition-colors" onClick={handleNameEdit}>
                      <Edit3 className="text-dark-100 hover:text-main-orange" size={18} />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-dark-100">{substringAddress(user.address)}</p>
                <button className="hover:text-main-orange transition-colors" onClick={handleCopyAddress}>
                  <Copy className="text-dark-100 hover:text-main-orange" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-dark-700 rounded-md p-6">
            <p className="text-dark-100 mb-2">TVL</p>
            <p className="text-2xl font-medium">12,003.0989 ADA</p>
          </div>
          <div className="bg-dark-700 rounded-md p-6">
            <p className="text-dark-100 mb-2">Total Vaults</p>
            <p className="text-2xl font-medium">28</p>
          </div>
          <div className="bg-dark-700 rounded-md p-6">
            <p className="text-dark-100 mb-2">Gains</p>
            <p className="text-2xl font-medium text-main-green">+ 150.03%</p>
          </div>
        </div>

        <div className="bg-dark-700 rounded-md p-6 my-8">
          <h2 className="text-xl font-medium mb-4">My Vaults</h2>
          <p className="text-dark-100">No vaults created yet.</p>
        </div>
      </div>
    </div>
  );
};
