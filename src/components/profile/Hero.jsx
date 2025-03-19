import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera, Copy, Edit, Check, X } from 'lucide-react';
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
      <div className="relative w-full h-96 group">
        <button
          className="w-full h-full"
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
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex items-center gap-2 font-medium text-dark-100 transition-all duration-200">
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
                className="h-[200px] w-[200px] cursor-pointer"
                onClick={() => avatarInputRef.current.click()}
              >
                {avatar ? (
                  <AvatarImage src={avatar} alt="Profile" />
                ) : (
                  <AvatarFallback
                    className="text-dark-700 text-4xl text-white font-medium flex flex-col items-center justify-center gap-2 bg-orange-gradient"
                  >
                    <Camera
                      size={24}
                      className="text-dark-700"
                    />
                    <span
                      className="text-dark-700 text-sm"
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-[200px]"
                      />
                      <button
                        onClick={handleNameSave}
                        className="text-green-500 hover:text-green-400 transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleNameCancel}
                        className="text-red-500 hover:text-red-400 transition-colors"
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
                        onClick={handleNameEdit}
                        className="text-dark-100 hover:text-white transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-dark-100">{substringAddress(user.address)}</p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-dark-100 hover:text-white transition-colors"
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
