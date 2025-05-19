import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera, Copy, Edit, Check, X } from 'lucide-react';

import { CoreApiProvider } from '@/services/api/core';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth';
import { substringAddress } from '@/utils/core.utils';

const BackgroundImage = ({ bgImage, onClick }) => (
  <button className="w-full h-full group relative" type="button" onClick={onClick}>
    <div className="relative w-full h-full">
      {bgImage ? (
        <>
          <img alt="Profile Background" className="w-full h-full object-cover" src={bgImage} />
          <div className="hover-overlay hover-overlay-gradient">
            <div className="flex items-center gap-2 font-medium">
              <Camera size={20} />
              Replace photo
            </div>
          </div>
        </>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backgroundImage: 'url(/assets/profile-bg-empty.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center gap-2 font-medium transition-all duration-200 z-10">
            <Camera size={20} />
            Add cover
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-[#000322] to-100%" />
    </div>
  </button>
);

const ProfileAvatar = ({ avatar, onClick, inputRef, onAvatarChange }) => (
  <>
    <Avatar className="h-[200px] w-[200px] cursor-pointer group relative" onClick={onClick}>
      {avatar ? (
        <>
          <AvatarImage alt="Profile" className="object-cover" src={avatar} />
          <div className="hover-overlay hover-overlay-gradient rounded-full">
            <div className="flex items-center gap-2 font-medium">
              <Camera size={20} />
              Replace photo
            </div>
          </div>
        </>
      ) : (
        <AvatarFallback
          className="flex flex-col items-center justify-center gap-2"
          style={{
            backgroundImage: 'url(/assets/avatar-bg-empty.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Camera size={20} />
          Add avatar
        </AvatarFallback>
      )}
    </Avatar>
    <input ref={inputRef} accept="image/*" className="hidden" type="file" onChange={onAvatarChange} />
  </>
);

const ProfileName = ({ isEditing, name, onEdit, onSave, onCancel, onChange, onKeyDown, inputRef }) => (
  <div className="flex items-center gap-2">
    {isEditing ? (
      <div className="flex items-center gap-2">
        <Input ref={inputRef} className="w-[200px]" value={name} onChange={onChange} onKeyDown={onKeyDown} />
        <button className="text-green-500 hover:text-green-400 transition-colors" onClick={onSave}>
          <Check size={20} />
        </button>
        <button className="text-red-500 hover:text-red-400 transition-colors" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>
    ) : (
      <>
        <h1 className="text-2xl font-medium">{name}</h1>
        <button className="text-dark-100 hover:text-white transition-colors" type="button" onClick={onEdit}>
          <Edit size={20} />
        </button>
      </>
    )}
  </div>
);

export const Hero = () => {
  const { user, checkAuth } = useAuth();
  const [avatar, setAvatar] = useState(user?.profileImage || null);
  const [bgImage, setBgImage] = useState(user?.bannerImage || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleFileUpload = async (file, type) => {
    try {
      const { data } = await CoreApiProvider.uploadImage(file);
      const updateData = type === 'avatar' ? { profileImage: data.url } : { bannerImage: data.url };

      await CoreApiProvider.updateProfile(updateData);
      await checkAuth();

      if (type === 'avatar') {
        setAvatar(data.url);
      } else {
        setBgImage(data.url);
      }

      toast.success(`${type === 'avatar' ? 'Profile' : 'Banner'} image updated successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to update ${type === 'avatar' ? 'profile' : 'banner'} image`);
    }
  };

  const handleFileChange = type => async e => {
    const file = e.target.files[0];
    if (file) {
      await handleFileUpload(file, type);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleNameSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      await CoreApiProvider.updateProfile({ name: name.trim() });
      await checkAuth(); // Refresh user data
      setIsEditingName(false);
      toast.success('Name updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update name');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameCancel = () => {
    setName(user?.name || '');
    setIsEditingName(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !isUpdating) handleNameSave();
    else if (e.key === 'Escape') handleNameCancel();
  };

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="mb-40">
      <h1 className="font-russo text-[40px] uppercase my-8 text-center">My Profile</h1>
      <div className="relative w-full h-[384px]">
        <BackgroundImage bgImage={bgImage} onClick={() => bgInputRef.current.click()} />
        <input ref={bgInputRef} accept="image/*" className="hidden" type="file" onChange={handleFileChange('banner')} />
        <div className="container mx-auto">
          <div className="absolute -bottom-[100px]">
            <div className="flex items-center gap-6">
              <ProfileAvatar
                avatar={avatar}
                inputRef={avatarInputRef}
                onAvatarChange={handleFileChange('avatar')}
                onClick={() => avatarInputRef.current.click()}
              />
              <div className="flex flex-col gap-2">
                <ProfileName
                  inputRef={nameInputRef}
                  isEditing={isEditingName}
                  name={name}
                  onCancel={handleNameCancel}
                  onChange={e => setName(e.target.value)}
                  onEdit={handleNameEdit}
                  onKeyDown={handleKeyDown}
                  onSave={handleNameSave}
                />
                <div className="flex items-center gap-2">
                  <p className="text-dark-100">{substringAddress(user.address)}</p>
                  <button
                    className="text-dark-100 hover:text-white transition-colors"
                    type="button"
                    onClick={handleCopyAddress}
                  >
                    <Copy size={20} />
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
