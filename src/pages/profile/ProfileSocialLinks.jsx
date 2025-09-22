import { useState, useCallback, useEffect } from 'react';
import { Edit, Plus, X, Trash } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';
import { SOCIAL_PLATFORMS, socialPlatforms } from '@/constants/core.constants';
import { useAuth } from '@/lib/auth/auth';
import { CoreApiProvider } from '@/services/api/core';
import { validateUrlRealTime, autoFormatUrl, debounce } from '@/utils/urlValidation';

const MAX_LINKS = 5;

export const ProfileSocialLinks = () => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState({
    name: SOCIAL_PLATFORMS.FACEBOOK,
    url: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [realTimeError, setRealTimeError] = useState('');

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
      url: '',
    });
    setRealTimeError('');
  };

  const debouncedValidateUrl = useCallback(
    debounce(url => {
      const validation = validateUrlRealTime(url);
      setRealTimeError(validation.isEmpty ? '' : validation.error);
    }, 300),
    []
  );

  const handleUrlChange = url => {
    setEditingLink({ ...editingLink, url });
    debouncedValidateUrl(url);
  };

  const handleUrlBlur = url => {
    if (url && url.trim() && !url.startsWith('http')) {
      const formattedUrl = autoFormatUrl(url);
      setEditingLink({ ...editingLink, url: formattedUrl });
      debouncedValidateUrl(formattedUrl);
    }
  };

  const handleSave = async (shouldAddNew = false) => {
    if (!editingLink.url.trim()) {
      return;
    }

    if (realTimeError) {
      return;
    }

    setIsLoading(true);

    try {
      let newLinks;

      if (editingId) {
        newLinks = socialLinks.map(link => (link.id === editingId ? { ...editingLink, id: editingId } : link));
      } else {
        newLinks = [...socialLinks, { ...editingLink, id: Date.now() }];
      }

      await CoreApiProvider.updateProfile({ socialLinks: newLinks });
      setSocialLinks(newLinks);

      if (shouldAddNew && newLinks.length < MAX_LINKS) {
        setEditingId(null);
        setEditingLink({
          name: SOCIAL_PLATFORMS.FACEBOOK,
          url: '',
        });
        setRealTimeError('');
        setIsAdding(true);
      } else {
        resetEditState();
      }
    } catch (error) {
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
      await CoreApiProvider.updateProfile({ socialLinks: newLinks });
      setSocialLinks(newLinks);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderForPlatform = platformId => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    return platform ? platform.placeholder : 'Enter URL';
  };

  const formatUrl = url => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-russo text-4xl uppercase">Socials</h2>
        {socialLinks.length < MAX_LINKS && !isAdding && (
          <button
            className="border-2 border-white/20 rounded-[10px] p-2 hover:bg-white/5 transition-colors"
            disabled={isLoading}
            type="button"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {isAdding && (
        <div className="flex flex-col rounded-lg bg-input-bg border border-steel-850 mb-4">
          <div className="flex items-center gap-2 p-3">
            <Select
              disabled={isLoading}
              value={editingLink.name}
              onValueChange={value => setEditingLink({ ...editingLink, name: value })}
            >
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
                placeholder={getPlaceholderForPlatform(editingLink.name)}
                style={{ fontSize: '20px' }}
                value={editingLink.url}
                onChange={e => handleUrlChange(e.target.value)}
                onBlur={e => {
                  handleUrlBlur(e.target.value);
                  if (editingLink.url.trim()) {
                    const validation = validateUrlRealTime(editingLink.url);
                    if (!validation.error) {
                      handleSave();
                    } else {
                      setRealTimeError(validation.error);
                    }
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && editingLink.url.trim()) {
                    const validation = validateUrlRealTime(editingLink.url);
                    if (!validation.error) {
                      handleSave(true);
                    } else {
                      setRealTimeError(validation.error);
                    }
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
            {realTimeError && <div className="px-3 pb-2 text-red-600 text-sm">{realTimeError}</div>}
          </div>
        </div>
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
          </div>
        ))}
        {socialLinks.length === 0 && <div>No social links added. Click the + button to add one.</div>}
        {socialLinks.length >= MAX_LINKS && (
          <div className="text-red-600 text-base mb-2">Maximum number of links ({MAX_LINKS}) reached.</div>
        )}
      </div>
    </div>
  );
};
