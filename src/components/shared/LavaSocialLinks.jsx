import { X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';
import { SOCIAL_PLATFORMS, socialPlatforms } from '@/constants/core.constants';

export const LavaSocialLinks = ({
  socialLinks = [],
  setSocialLinks,
  errors = {},
}) => {
  const addNewLink = () => {
    if (socialLinks.length >= 10) {
      return;
    }
    const newLinks = [...socialLinks, {
      name: SOCIAL_PLATFORMS.FACEBOOK,
      url: '',
      id: Date.now(),
    }];
    setSocialLinks(newLinks);
  };

  const updateLink = (id, field, value) => {
    const updatedLinks = socialLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link,
    );
    setSocialLinks(updatedLinks);
  };

  const removeLink = (id) => {
    const filteredLinks = socialLinks.filter(link => link.id !== id);
    setSocialLinks(filteredLinks);
  };

  const getPlaceholderForPlatform = (platformId) => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    return platform ? platform.placeholder : '';
  };

  const getErrorForLink = (index, field) => {
    const errorKey = `socialLinks[${index}].${field}`;
    return errors[errorKey];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase text-[20px] font-bold">
          SOCIAL LINKS
        </div>
        <button
          className="border-2 border-white/20 rounded-[10px] p-2"
          type="button"
          onClick={addNewLink}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {socialLinks.map((link, index) => (
          <div
            key={link.id}
            className="flex flex-col rounded-lg bg-input-bg border border-steel-850"
          >
            <div className="flex items-center gap-2 p-3">
              <Select
                value={link.name}
                onValueChange={(value) => updateLink(link.id, 'name', value)}
              >
                <SelectTrigger className="bg-transparent border-none shadow-none w-32 p-0">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="border-white/20 bg-input-bg">
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform.id} className="hover:bg-white/5" value={platform.id}>
                      <div className="flex items-center gap-2">
                        <SocialPlatformIcon
                          className="text-white"
                          platformId={platform.id}
                          size={20}
                        />
                        <span>
                          {platform.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className={`py-4 pl-5 text-[20px] border-none shadow-none ${getErrorForLink(index, 'url') ? 'focus-visible:ring-red-600' : ''}`}
                placeholder={getPlaceholderForPlatform(link.name)}
                style={{ fontSize: '20px' }}
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
              />
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
                onClick={() => removeLink(link.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {getErrorForLink(index, 'url') && (
              <div className="px-3 pb-2 text-red-600 text-sm">
                {getErrorForLink(index, 'url')}
              </div>
            )}
          </div>
        ))}
        {socialLinks.length === 0 && (
          <div className="text-dark-100 text-base mb-2">
            No social links added. Click the + button to add one.
          </div>
        )}
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
            <SocialPlatformIcon
              className="text-white"
              platformId={link.name}
              size={20}
            />
            <span className="text-[20px]">
              {link.url}
            </span>
          </a>
        ))
      ) : (
        <p className="text-[20px]">
          No social links added.
        </p>
      )}
    </div>
  );
};
