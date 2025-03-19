import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Camera, Copy, Edit, Check, X,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth';
import { substringAddress } from '@/utils/core.utils';

const BackgroundImage = ({ bgImage, onClick }) => (
  <button
    className="w-full h-full group relative"
    type="button"
    onClick={onClick}
  >
    <div className="relative w-full h-full">
      {bgImage ? (
        <>
          <img
            src={bgImage}
            alt="Profile Background"
            className="w-full h-full object-cover"
          />
          <div className="hover-overlay hover-overlay-gradient">
            <div className="flex items-center gap-2 font-medium text-dark-100">
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
          <div className="flex items-center gap-2 font-medium transition-all duration-200 z-10 text-dark-100">
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
    <Avatar
      className="h-[200px] w-[200px] cursor-pointer group relative"
      onClick={onClick}
    >
      {avatar ? (
        <>
          <AvatarImage alt="Profile" src={avatar} />
          <div className="hover-overlay hover-overlay-gradient rounded-full">
            <div className="flex items-center gap-2 font-medium text-dark-100">
              <Camera size={20} />
              Replace photo
            </div>
          </div>
        </>
      ) : (
        <AvatarFallback
          className="flex flex-col items-center justify-center gap-2 text-dark-100"
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
    <input
      ref={inputRef}
      accept="image/*"
      className="hidden"
      type="file"
      onChange={onAvatarChange}
    />
  </>
);

const ProfileName = ({ isEditing, name, onEdit, onSave, onCancel, onChange, onKeyDown, inputRef }) => (
  <div className="flex items-center gap-2">
    {isEditing ? (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          className="w-[200px]"
          value={name}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <button
          className="text-green-500 hover:text-green-400 transition-colors"
          onClick={onSave}
        >
          <Check size={20} />
        </button>
        <button
          className="text-red-500 hover:text-red-400 transition-colors"
          onClick={onCancel}
        >
          <X size={20} />
        </button>
      </div>
    ) : (
      <>
        <h1 className="text-2xl font-medium">{name}</h1>
        <button
          className="text-dark-100 hover:text-white transition-colors"
          onClick={onEdit}
        >
          <Edit size={20} />
        </button>
      </>
    )}
  </div>
);

export const Hero = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleFileChange = (setFile) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFile(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleNameSave = () => {
    if (name.trim()) {
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
    if (e.key === 'Enter') handleNameSave();
    else if (e.key === 'Escape') handleNameCancel();
  };

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="mb-[100px]">
      <h1 className="font-russo text-[40px] uppercase my-8 text-center">
        My Profile
      </h1>
      <div className="relative w-full h-[384px]">
        <BackgroundImage
          bgImage={bgImage}
          onClick={() => bgInputRef.current.click()}
          inputRef={bgInputRef}
        />
        <input
          ref={bgInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleFileChange(setBgImage)}
        />
        <div className="container mx-auto">
          <div className="absolute -bottom-[100px]">
            <div className="flex items-center gap-6">
              <ProfileAvatar
                avatar={avatar}
                onClick={() => avatarInputRef.current.click()}
                inputRef={avatarInputRef}
                onAvatarChange={handleFileChange(setAvatar)}
              />
              <div className="flex flex-col gap-2">
                <ProfileName
                  isEditing={isEditingName}
                  name={name}
                  onEdit={handleNameEdit}
                  onSave={handleNameSave}
                  onCancel={handleNameCancel}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  inputRef={nameInputRef}
                />
                <div className="flex items-center gap-2">
                  <p className="text-dark-100">{substringAddress(user.address)}</p>
                  <button
                    type="button"
                    className="text-dark-100 hover:text-white transition-colors"
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
