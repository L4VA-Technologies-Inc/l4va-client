import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Camera, Copy, Edit, Check, X,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/context/auth';
import { substringAddress } from '@/utils/core.utils';

export const Hero = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      toast.success('Address copied to clipboard');
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    // Focus the input on the next tick to ensure it's rendered
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  };

  const handleNameSave = () => {
    if (name.trim()) {
      // Here you would typically make an API call to update the name
      // For now, we'll just update the local state
      setIsEditingName(false);
      toast.success('Name updated successfully');
    } else {
      toast.error('Name cannot be empty');
    }
  };

  const handleNameCancel = () => {
    setName(user?.name || '');
    setIsEditingName(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

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

  return (
    <div>
      <h1 className="font-russo text-[40px] uppercase mb-8 text-center">
        My Profile
      </h1>
      <div className="relative w-full h-[384px] group">
        <button
          className="w-full h-full"
          type="button"
          onClick={() => bgInputRef.current.click()}
        >
          {bgImage ? (
            <div className="relative w-full h-full">
              <img
                alt="Profile Background"
                className="w-full h-full object-cover"
                src={bgImage}
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-dark-800"
              style={{ backgroundImage: 'url(/assets/profile-bg-empty.webp)', backgroundRepeat: 'repeat' }}
            >
              <div className="flex items-center gap-2 font-medium transition-all duration-200">
                <Camera size={24} />
                Add cover
              </div>
            </div>
          )}
        </button>
        <input
          ref={bgInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleBgImageChange}
        />
        <div className="container mx-auto">
          <div className="absolute bottom-0">
            <div className="flex items-center gap-6">
              <Avatar
                className="h-[200px] w-[200px] cursor-pointer border-2 border-white"
                onClick={() => avatarInputRef.current.click()}
              >
                {avatar ? (
                  <AvatarImage alt="Profile" src={avatar} />
                ) : (
                  <AvatarFallback
                    className="text-4xl font-medium flex flex-col items-center justify-center gap-2 text-white"
                    style={{ backgroundImage: 'url(/assets/profile-bg-empty.webp)', backgroundRepeat: 'repeat' }}
                  >
                    <Camera
                      className="text-white"
                      size={24}
                    />
                    <span
                      className="text-sm"
                    >
                      Add avatar
                    </span>
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                ref={avatarInputRef}
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handleAvatarChange}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={nameInputRef}
                        className="w-[200px]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <button
                        className="text-green-500 hover:text-green-400 transition-colors"
                        onClick={handleNameSave}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-400 transition-colors"
                        onClick={handleNameCancel}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-medium">
                        {name}
                      </h1>
                      <button
                        className="text-dark-100 hover:text-white transition-colors"
                        onClick={handleNameEdit}
                      >
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-dark-100">{substringAddress(user.address)}</p>
                  <button
                    className="text-dark-100 hover:text-white transition-colors"
                    onClick={handleCopyAddress}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
