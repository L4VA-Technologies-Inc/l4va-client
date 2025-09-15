import { X, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';
import { SOCIAL_PLATFORMS, socialPlatforms } from '@/constants/core.constants';
import { validateUrlRealTime, autoFormatUrl, debounce } from '@/utils/urlValidation';

export const LavaSocialLinks = ({ socialLinks = [], setSocialLinks, errors = {} }) => {
  const [realTimeErrors, setRealTimeErrors] = useState({});

  const addNewLink = () => {
    if (socialLinks.length >= 10) {
      return;
    }
    const newLinks = [
      ...socialLinks,
      {
        name: SOCIAL_PLATFORMS.FACEBOOK,
        url: '',
        id: Date.now(),
      },
    ];
    setSocialLinks(newLinks);
  };

  const updateLink = (id, field, value) => {
    const updatedLinks = socialLinks.map(link => (link.id === id ? { ...link, [field]: value } : link));
    setSocialLinks(updatedLinks);
  };

  const debouncedValidateUrl = useCallback(
    debounce((linkId, url) => {
      const validation = validateUrlRealTime(url);
      setRealTimeErrors(prev => ({
        ...prev,
        [linkId]: validation.isEmpty ? null : validation.error
      }));
    }, 300),
    []
  );

  const handleUrlChange = (linkId, url) => {
    updateLink(linkId, 'url', url);
    debouncedValidateUrl(linkId, url);
  };

  const handleUrlBlur = (linkId, url) => {
    if (url && url.trim() && !url.startsWith('http')) {
      const formattedUrl = autoFormatUrl(url);
      updateLink(linkId, 'url', formattedUrl);
      debouncedValidateUrl(linkId, formattedUrl);
    }
  };

  const removeLink = id => {
    const filteredLinks = socialLinks.filter(link => link.id !== id);
    setSocialLinks(filteredLinks);
  };

  const getPlaceholderForPlatform = platformId => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    return platform ? platform.placeholder : '';
  };

  const getErrorForLink = (index, field, linkId) => {
    const errorKey = `socialLinks[${index}].${field}`;
    const formError = errors[errorKey];
    const realTimeError = realTimeErrors[linkId];
    
    return realTimeError || formError;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase font-bold">Social Links</div>
        <button className="border-2 border-white/20 rounded-[10px] p-2" type="button" onClick={addNewLink}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {socialLinks.map((link, index) => (
          <div key={link.id} className="flex flex-col rounded-lg bg-input-bg border border-steel-850">
            <div className="flex items-center gap-2 p-3">
              <Select value={link.name} onValueChange={value => updateLink(link.id, 'name', value)}>
                <SelectTrigger className="bg-transparent border-none shadow-none w-32 p-0">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="border-white/20 bg-input-bg">
                  {socialPlatforms.map(platform => (
                    <SelectItem key={platform.id} className="hover:bg-white/5" value={platform.id}>
                      <div className="flex items-center gap-2">
                        <SocialPlatformIcon className="text-white" platformId={platform.id} size={20} />
                        <span>{platform.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className={`py-4 pl-5 border-none shadow-none ${getErrorForLink(index, 'url', link.id) ? 'focus-visible:ring-red-600' : ''}`}
                placeholder={getPlaceholderForPlatform(link.name)}
                style={{ fontSize: '20px' }}
                value={link.url}
                onChange={e => handleUrlChange(link.id, e.target.value)}
                onBlur={e => handleUrlBlur(link.id, e.target.value)}
              />
              <Button className="h-8 w-8 rounded-full" size="icon" variant="ghost" onClick={() => removeLink(link.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {getErrorForLink(index, 'url', link.id) && (
              <div className="px-3 pb-2 text-red-600 text-sm">{getErrorForLink(index, 'url', link.id)}</div>
            )}
          </div>
        ))}
        {socialLinks.length === 0 && <div>No social links added. Click the + button to add one.</div>}
      </div>
    </div>
  );
};

export const LavaSocialLinksPreview = ({ socialLinks = [] }) => {
  const validLinks = socialLinks.filter(link => link.url.trim() !== '');

  return (
    <div className="space-y-2">
      {validLinks.length > 0 ? (
        validLinks.map((link, index) => (
          <a
            key={`social-link-${index}`}
            className="flex items-center gap-2"
            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SocialPlatformIcon className="text-white" platformId={link.name} size={20} />
            <span>{link.url}</span>
          </a>
        ))
      ) : (
        <p>No social links added.</p>
      )}
    </div>
  );
};
