import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Check, Copy, Edit, Plus, X } from 'lucide-react';

import { CoreApiProvider } from '@/services/api/core';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAvatarLetter, substringAddress } from '@/utils/core.utils';

const BackgroundSection = ({ bgImage, onClick, isEditable = true }) => (
  <div
    className={`relative w-full h-[200px] bg-steel-900 rounded-t-xl overflow-hidden group ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}
    onClick={isEditable ? onClick : null}
  >
    {bgImage ? (
      <>
        <img alt="Profile Background" className="w-full h-full object-cover" src={bgImage} />
        {isEditable && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-medium bg-black/60 px-4 py-2 rounded-full">
              <Camera size={16} />
              Change cover
            </div>
          </div>
        )}
      </>
    ) : (
      isEditable && (
        <div className="w-full h-full flex items-center justify-center bg-navy-800 group-hover:bg-navy-700 transition-colors duration-200">
          <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors duration-200">
            <Plus size={20} />
            Add cover photo
          </div>
        </div>
      )
    )}
  </div>
);

const ProfileAvatar = ({ avatar, onClick, inputRef, onAvatarChange, user, isEditable = true }) => (
  <>
    <div
      className={`relative -mt-16 ml-4 group ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={isEditable ? onClick : null}
    >
      <Avatar className="h-32 w-32 border-4 border-slate-950 bg-navy-800">
        {avatar ? (
          <>
            <AvatarImage alt="Profile" src={avatar} className="object-cover" />
            {isEditable && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                <div className="flex items-center gap-1 text-white text-sm font-medium">
                  <Edit size={18} />
                </div>
              </div>
            )}
          </>
        ) : (
          <AvatarFallback
            className={`bg-orange-gradient ${isEditable ? 'hover:opacity-90' : 'hover:opacity-100'} transition-opacity duration-200 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg relative group`}
          >
            {getAvatarLetter(user)}
            {isEditable && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                <div className="flex items-center gap-1 text-white text-sm font-medium">
                  <Edit size={18} />
                </div>
              </div>
            )}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
    <input ref={inputRef} accept="image/*" className="hidden" type="file" onChange={onAvatarChange} />
  </>
);

const ProfileName = ({
  isEditing,
  name,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onKeyDown,
  inputRef,
  isUpdating,
  isEditable = true,
}) => (
  <div className="flex items-center gap-3 mt-3">
    {isEditing && isEditable ? (
      <div className="flex items-center gap-2 w-full">
        <Input
          ref={inputRef}
          className="bg-steel-850 border-steel-800 text-white placeholder:text-gray-400 focus:border-orange-500 max-w-xs"
          value={name}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Enter your name"
        />
        <Button
          size="sm"
          variant="ghost"
          className="text-green-400 hover:text-green-300 hover:bg-green-800/20 h-8 w-8 p-0"
          onClick={onSave}
          disabled={isUpdating}
        >
          <Check size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-400 hover:text-red-300 hover:bg-red-800/20 h-8 w-8 p-0"
          onClick={onCancel}
          disabled={isUpdating}
        >
          <X size={16} />
        </Button>
      </div>
    ) : (
      <>
        <h1 className="text-xl font-bold text-white">{name || 'Anonymous User'}</h1>
        {isEditable && (
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-steel-800 h-8 w-8 p-0"
            onClick={onEdit}
          >
            <Edit size={16} />
          </Button>
        )}
      </>
    )}
  </div>
);

const ProfileEmail = ({
  isEditable = true,
  isEditing,
  email,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onKeyDown,
  inputRef,
  isUpdating,
}) => {
  if (!isEditable) return null;

  return (
    <div className="flex items-center gap-3 mt-2">
      {isEditing ? (
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            ref={inputRef}
            className="bg-steel-850 border-steel-800 text-white placeholder:text-gray-400 focus:border-orange-500"
            value={email}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Enter your email"
            type="email"
          />
          <Button
            size="sm"
            variant="ghost"
            className="text-green-400 hover:text-green-300 hover:bg-green-800/20 h-8 w-8 p-0"
            onClick={onSave}
            disabled={isUpdating}
          >
            <Check size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-800/20 h-8 w-8 p-0"
            onClick={onCancel}
            disabled={isUpdating}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <span className={email ? '' : 'italic text-gray-500'}>{email || 'Add your email'}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-steel-800 h-8 w-8 p-0"
            onClick={onEdit}
          >
            <Edit size={16} />
          </Button>
        </>
      )}
    </div>
  );
};

const AddressDisplay = ({ address, onCopy }) => (
  <div className="flex items-center gap-2 mt-1">
    <span className="text-gray-400 text-sm font-mono">{substringAddress(address)}</span>
    <Button
      size="sm"
      variant="ghost"
      className="text-gray-400 hover:text-white hover:bg-steel-800 h-7 w-7 p-0"
      onClick={onCopy}
    >
      <Copy size={14} />
    </Button>
  </div>
);

const ProfileHero = ({ user, isEditable = true }) => {
  const [avatar, setAvatar] = useState(user?.profileImage || null);
  const [bgImage, setBgImage] = useState(user?.bannerImage || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleFileUpload = async (file, type) => {
    try {
      const { data } = await CoreApiProvider.uploadImage(file);
      const updateData = type === 'avatar' ? { profileImage: data.url } : { bannerImage: data.url };

      await CoreApiProvider.updateProfile(updateData);
      if (type === 'avatar') {
        setAvatar(data.url);
      } else {
        setBgImage(data.url);
      }

      toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} photo updated successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to update ${type === 'avatar' ? 'profile' : 'cover'} photo`);
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

  const handleNameKeyDown = e => {
    if (e.key === 'Enter' && !isUpdating) handleNameSave();
    else if (e.key === 'Escape') handleNameCancel();
  };

  const handleEmailEdit = () => {
    setIsEditingEmail(true);
    setTimeout(() => emailInputRef.current?.focus(), 0);
  };

  const handleEmailSave = async () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/i.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsUpdating(true);
    try {
      await CoreApiProvider.updateProfile({ email: trimmedEmail || null });
      setEmail(trimmedEmail);
      setIsEditingEmail(false);
      toast.success('Email updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update email');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailCancel = () => {
    setEmail(user?.email || '');
    setIsEditingEmail(false);
  };

  const handleEmailKeyDown = e => {
    if (e.key === 'Enter' && !isUpdating) handleEmailSave();
    else if (e.key === 'Escape') handleEmailCancel();
  };

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div>
      <div className="rounded-xl overflow-hidden">
        <BackgroundSection bgImage={bgImage} onClick={() => bgInputRef.current?.click()} isEditable={isEditable} />
        <input ref={bgInputRef} accept="image/*" className="hidden" type="file" onChange={handleFileChange('banner')} />

        <div className="px-4 pb-6">
          <div className="flex justify-between items-start">
            <ProfileAvatar
              avatar={avatar}
              inputRef={avatarInputRef}
              onAvatarChange={handleFileChange('avatar')}
              onClick={() => avatarInputRef.current?.click()}
              user={user}
              isEditable={isEditable}
            />
          </div>

          <div className="mt-3">
            <ProfileName
              inputRef={nameInputRef}
              isEditing={isEditingName}
              name={name}
              onCancel={handleNameCancel}
              onChange={e => setName(e.target.value)}
              onEdit={handleNameEdit}
              onKeyDown={handleNameKeyDown}
              onSave={handleNameSave}
              isUpdating={isUpdating}
              isEditable={isEditable}
            />

            <ProfileEmail
              email={email}
              inputRef={emailInputRef}
              isEditing={isEditingEmail}
              isEditable={isEditable}
              isUpdating={isUpdating}
              onCancel={handleEmailCancel}
              onChange={e => setEmail(e.target.value)}
              onEdit={handleEmailEdit}
              onKeyDown={handleEmailKeyDown}
              onSave={handleEmailSave}
            />

            {user?.address && <AddressDisplay address={user.address} onCopy={handleCopyAddress} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
