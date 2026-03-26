import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Check, Copy, Edit, Loader2, Plus, X } from 'lucide-react';

import { useUpdateProfile, useUploadProfileImage } from '@/services/api/queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAvatarLetter, substringAddress } from '@/utils/core.utils';

const PROFILE_IMAGE_MAX_SIZE_MB = 5;
const PROFILE_IMAGE_MAX_SIZE_BYTES = PROFILE_IMAGE_MAX_SIZE_MB * 1024 * 1024;

const BackgroundSection = ({ bgImage, onClick, isEditable = true, isUploading = false, isDisabled = false }) => (
  <div
    className={`relative w-full h-[200px] bg-steel-900 rounded-t-xl overflow-hidden group ${isEditable && !isDisabled ? 'cursor-pointer' : 'cursor-default'}`}
    onClick={isEditable && !isDisabled ? onClick : null}
  >
    {bgImage ? (
      <>
        <img alt="Profile Background" className="w-full h-full object-cover" src={bgImage} />
        {isUploading ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 size={28} className="text-white animate-spin" />
          </div>
        ) : (
          isEditable && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white font-medium bg-black/60 px-4 py-2 rounded-full">
                <Camera size={16} />
                Change banner
              </div>
            </div>
          )
        )}
      </>
    ) : (
      isEditable && (
        <div className="w-full h-full flex items-center justify-center bg-navy-800 group-hover:bg-navy-700 transition-colors duration-200">
          {isUploading ? (
            <Loader2 size={24} className="text-white animate-spin" />
          ) : (
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors duration-200">
              <Plus size={20} />
              Add banner photo
            </div>
          )}
        </div>
      )
    )}
  </div>
);

const ProfileAvatar = ({
  avatar,
  onClick,
  inputRef,
  onAvatarChange,
  user,
  isEditable = true,
  isUploading = false,
  isDisabled = false,
}) => (
  <>
    <div
      className={`relative -mt-16 ml-4 group ${isEditable && !isDisabled ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={isEditable && !isDisabled ? onClick : null}
    >
      <Avatar className="h-32 w-32 border-4 border-slate-950 bg-navy-800">
        {avatar ? (
          <>
            <AvatarImage alt="Profile" src={avatar} className="object-cover" />
            {isUploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            ) : (
              isEditable && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                  <div className="flex items-center gap-1 text-white text-sm font-medium">
                    <Edit size={18} />
                  </div>
                </div>
              )
            )}
          </>
        ) : (
          <AvatarFallback
            className={`bg-orange-gradient ${isEditable ? 'hover:opacity-90' : 'hover:opacity-100'} transition-opacity duration-200 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg relative group`}
          >
            {getAvatarLetter(user)}
            {isUploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            ) : (
              isEditable && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                  <div className="flex items-center gap-1 text-white text-sm font-medium">
                    <Edit size={18} />
                  </div>
                </div>
              )
            )}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
    <input
      ref={inputRef}
      accept="image/*"
      className="hidden"
      type="file"
      onChange={onAvatarChange}
      disabled={isDisabled}
    />
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
}) => {
  const inputId = 'profile-name-input';

  return (
    <div className="flex items-center gap-3 mt-3">
      {isEditing && isEditable ? (
        <div className="flex items-center gap-2 w-full">
          <label htmlFor={inputId} className="sr-only">
            Name
          </label>
          <Input
            id={inputId}
            ref={inputRef}
            name="name"
            autoComplete="name"
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
};

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
  const inputId = 'profile-email-input';

  if (!isEditable) return null;

  return (
    <div className="flex items-center gap-3 mt-2">
      {isEditing ? (
        <div className="flex items-center gap-2 w-full max-w-md">
          <label htmlFor={inputId} className="sr-only">
            Email
          </label>
          <Input
            id={inputId}
            ref={inputRef}
            name="email"
            type="email"
            autoComplete="email"
            className="bg-steel-850 border-steel-800 text-white placeholder:text-gray-400 focus:border-orange-500"
            value={email}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Enter your email"
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
  const [uploadingByType, setUploadingByType] = useState({ avatar: false, banner: false });

  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const avatarPreviewUrlRef = useRef(null);
  const bannerPreviewUrlRef = useRef(null);

  const uploadProfileImageMutation = useUploadProfileImage();
  const updateProfileMutation = useUpdateProfile();
  const isAnyUploadInProgress = uploadingByType.avatar || uploadingByType.banner;

  useEffect(() => {
    if (user) {
      // Revoke optimistic preview blob URLs once server-backed URLs are applied.
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
        avatarPreviewUrlRef.current = null;
      }
      if (bannerPreviewUrlRef.current) {
        URL.revokeObjectURL(bannerPreviewUrlRef.current);
        bannerPreviewUrlRef.current = null;
      }
      setAvatar(user.profileImage || null);
      setBgImage(user.bannerImage || null);
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
      }
      if (bannerPreviewUrlRef.current) {
        URL.revokeObjectURL(bannerPreviewUrlRef.current);
      }
    };
  }, []);

  const handleFileUpload = async (e, type) => {
    if (isAnyUploadInProgress) {
      e.target.value = '';
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      toast.error('Please upload a valid image file');
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE_BYTES) {
      e.target.value = '';
      toast.error(`File size must be less than ${PROFILE_IMAGE_MAX_SIZE_MB}MB`);
      return;
    }

    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    const prevAvatar = avatar;
    const prevBgImage = bgImage;

    if (type === 'avatar') {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
      }
      avatarPreviewUrlRef.current = previewUrl;
      setAvatar(previewUrl);
    } else {
      if (bannerPreviewUrlRef.current) {
        URL.revokeObjectURL(bannerPreviewUrlRef.current);
      }
      bannerPreviewUrlRef.current = previewUrl;
      setBgImage(previewUrl);
    }

    setUploadingByType(prev => ({ ...prev, [type]: true }));

    try {
      await uploadProfileImageMutation.mutateAsync({ file, imageType: type });
      toast.success(`${type === 'avatar' ? 'Profile' : 'Banner'} photo updated successfully`);
    } catch (error) {
      console.error('Upload error:', error);

      if (type === 'avatar') {
        setAvatar(prevAvatar);
        avatarPreviewUrlRef.current = null;
      } else {
        setBgImage(prevBgImage);
        bannerPreviewUrlRef.current = null;
      }
      URL.revokeObjectURL(previewUrl);

      const serverMessage = error?.response?.data?.message;
      let errorMessage = `Failed to update ${type === 'avatar' ? 'profile' : 'Banner'} photo`;
      if (serverMessage != null) {
        if (typeof serverMessage === 'string') {
          errorMessage = serverMessage;
        } else if (Array.isArray(serverMessage) && serverMessage.length > 0) {
          errorMessage = String(serverMessage[0]);
        } else if (typeof serverMessage === 'object') {
          const values = Object.values(serverMessage);
          const firstValue = values.find(value => value != null);

          if (typeof firstValue === 'string') {
            errorMessage = firstValue;
          } else if (Array.isArray(firstValue) && firstValue.length > 0) {
            errorMessage = String(firstValue[0]);
          } else {
            errorMessage = 'Failed to update image';
          }
        }
      }
      toast.error(errorMessage);
    } finally {
      setUploadingByType(prev => ({ ...prev, [type]: false }));
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
      await updateProfileMutation.mutateAsync({ name: name.trim() });
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
      await updateProfileMutation.mutateAsync({ email: trimmedEmail || null });
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
        <BackgroundSection
          bgImage={bgImage}
          onClick={() => bgInputRef.current?.click()}
          isEditable={isEditable}
          isUploading={uploadingByType.banner}
          isDisabled={isAnyUploadInProgress}
        />
        <input
          ref={bgInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          disabled={isAnyUploadInProgress}
          onChange={e => handleFileUpload(e, 'banner')}
        />

        <div className="px-4 pb-6">
          <div className="flex justify-between items-start">
            <ProfileAvatar
              avatar={avatar}
              inputRef={avatarInputRef}
              onAvatarChange={e => handleFileUpload(e, 'avatar')}
              onClick={() => avatarInputRef.current?.click()}
              user={user}
              isEditable={isEditable}
              isUploading={uploadingByType.avatar}
              isDisabled={isAnyUploadInProgress}
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
