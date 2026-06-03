import { useCallback, useEffect, useState } from 'react';
import { Edit, Plus, Trash, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';
import { SOCIAL_PLATFORMS, socialPlatforms } from '@/constants/core.constants';
import { useUpdateProfile } from '@/services/api/queries';
import {
  autoFormatUrl,
  debounce,
  getSocialPlatformUrlPrefix,
  getUrlForPlatformChange,
  sanitizeSocialUrlInput,
  validateSocialUrlForPlatform,
} from '@/utils/urlValidation';

const MAX_LINKS = 5;

export const ProfileSocialLinks = ({ user, isEditable = true }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState({
    name: SOCIAL_PLATFORMS.FACEBOOK,
    url: getSocialPlatformUrlPrefix(SOCIAL_PLATFORMS.FACEBOOK),
  });
  const [editingId, setEditingId] = useState(null);
  const [realTimeError, setRealTimeError] = useState('');

  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (user && Array.isArray(user.socialLinks)) {
      setSocialLinks(user.socialLinks);
    }
  }, [user]);

  const resetEditState = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditingLink({
      name: SOCIAL_PLATFORMS.FACEBOOK,
      url: getSocialPlatformUrlPrefix(SOCIAL_PLATFORMS.FACEBOOK),
    });
    setRealTimeError('');
  };

  const setUrlValidationError = (url, platformId) => {
    const validation = validateSocialUrlForPlatform(url, platformId);
    setRealTimeError(validation.isEmpty ? '' : validation.error);
  };

  const debouncedValidateUrl = useCallback(
    debounce((url, platformId) => {
      setUrlValidationError(url, platformId);
    }, 300),
    []
  );

  const formatUrlIfNeeded = url => {
    if (url?.trim() && !url.startsWith('http')) {
      return autoFormatUrl(url);
    }
    return url;
  };

  const handleUrlChange = url => {
    const sanitizedUrl = sanitizeSocialUrlInput(url);
    setEditingLink(prev => {
      debouncedValidateUrl(sanitizedUrl, prev.name);
      return { ...prev, url: sanitizedUrl };
    });
  };

  const handlePlatformChange = platformId => {
    setEditingLink(prev => {
      const nextUrl = getUrlForPlatformChange(prev.url, platformId, prev.name);
      if (nextUrl?.trim()) {
        setUrlValidationError(nextUrl, platformId);
      }
      return { ...prev, name: platformId, url: nextUrl };
    });
  };

  const startAddingLink = () => {
    setEditingLink({
      name: SOCIAL_PLATFORMS.FACEBOOK,
      url: getSocialPlatformUrlPrefix(SOCIAL_PLATFORMS.FACEBOOK),
    });
    setRealTimeError('');
    setIsAdding(true);
  };

  const handleSave = async (shouldAddNew = false, urlOverride) => {
    const url = formatUrlIfNeeded(urlOverride ?? editingLink.url);
    if (!url?.trim()) {
      return;
    }

    const linkToSave = { ...editingLink, url };
    const validation = validateSocialUrlForPlatform(linkToSave.url, linkToSave.name);

    if (!validation.isValid) {
      if (!validation.isEmpty) {
        setRealTimeError(validation.error);
      }
      return;
    }

    setRealTimeError('');
    setIsLoading(true);

    try {
      let newLinks;

      if (editingId) {
        newLinks = socialLinks.map(link => (link.id === editingId ? { ...linkToSave, id: editingId } : link));
      } else {
        newLinks = [...socialLinks, { ...linkToSave, id: Date.now() }];
      }

      await updateProfileMutation.mutateAsync({ socialLinks: newLinks });
      setSocialLinks(newLinks);

      if (shouldAddNew && newLinks.length < MAX_LINKS) {
        setEditingId(null);
        setEditingLink({
          name: SOCIAL_PLATFORMS.FACEBOOK,
          url: getSocialPlatformUrlPrefix(SOCIAL_PLATFORMS.FACEBOOK),
        });
        setRealTimeError('');
        setIsAdding(true);
      } else {
        resetEditState();
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = link => {
    setEditingId(link.id);
    setEditingLink({ ...link });
    setIsAdding(true);
  };

  const handleDelete = async id => {
    setIsLoading(true);

    try {
      const newLinks = socialLinks.filter(link => link.id !== id);
      await updateProfileMutation.mutateAsync({ socialLinks: newLinks });
      setSocialLinks(newLinks);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const formatUrl = url => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-russo text-4xl uppercase">Socials</h2>
        {isEditable && socialLinks.length < MAX_LINKS && !isAdding && (
          <button
            className="border-2 border-white/20 rounded-[10px] p-2 hover:bg-white/5 transition-colors"
            disabled={isLoading}
            type="button"
            onClick={startAddingLink}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {isAdding && (
        <>
          <div className="flex flex-col rounded-lg bg-input-bg border border-steel-850 mb-4">
            <div className="flex items-center gap-2 p-3">
              <Select disabled={isLoading} value={editingLink.name} onValueChange={handlePlatformChange}>
                <SelectTrigger className="bg-transparent border-none shadow-none w-32 p-0">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="border-white/20 bg-input-bg">
                  {socialPlatforms.map(platform => (
                    <SelectItem key={platform.id} className="hover:bg-white/5" value={platform.id}>
                      <div className="flex items-center gap-2">
                        <SocialPlatformIcon className="text-dark-100" platformId={platform.id} size={20} />
                        <span>{platform.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Input
                  className={`py-4 pl-5 pr-12 bg-transparent border-none shadow-none ${realTimeError || !editingLink.url.trim() ? 'focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                  placeholder={getSocialPlatformUrlPrefix(editingLink.name)}
                  style={{ fontSize: '20px' }}
                  value={editingLink.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  onBlur={e => {
                    const url = formatUrlIfNeeded(e.target.value);
                    if (url !== e.target.value) {
                      setEditingLink(prev => ({ ...prev, url }));
                    }
                    if (url?.trim()) {
                      handleSave(false, url);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && editingLink.url.trim()) {
                      e.preventDefault();
                      handleSave(true);
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    className="p-2 rounded-full text-dark-100 hover:bg-white/10 transition-colors"
                    disabled={isLoading}
                    onClick={resetEditState}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {realTimeError && <div className="px-3 pb-2 text-red-600 text-sm">{realTimeError}</div>}
        </>
      )}

      <div className="space-y-4">
        {socialLinks.map(link => (
          <div key={link.id} className="flex items-center gap-2 group">
            <SocialPlatformIcon className="text-dark-100" platformId={link.name} size={20} />
            <a
              className="hover:text-orange-500 transition-colors"
              href={formatUrl(link.url)}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.url}
            </a>
            {isEditable && (
              <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-2 rounded-full text-dark-100 hover:bg-white/10 transition-colors"
                  disabled={isLoading || isAdding}
                  onClick={() => handleEdit(link)}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-full text-dark-100 hover:bg-white/10 transition-colors"
                  disabled={isLoading}
                  onClick={() => handleDelete(link.id)}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {isEditable && socialLinks.length === 0 && <div>No social links added. Click the + button to add one.</div>}
        {!isEditable && socialLinks.length === 0 && <div>The user has no social links.</div>}
      </div>
    </div>
  );
};
