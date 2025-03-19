import { X } from 'lucide-react';

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
    const errorKey = `socialLinks.${index}.${field}`;
    return errors[errorKey];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Social Links</h3>
        <Button
          onClick={addNewLink}
          disabled={socialLinks.length >= 10}
          variant="outline"
          size="sm"
        >
          Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {socialLinks.map((link, index) => (
          <div key={link.id} className="flex items-center gap-4">
            <div className="w-24">
              <Select
                value={link.name}
                onValueChange={(value) => updateLink(link.id, 'name', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        <SocialPlatformIcon
                          platformId={platform.id}
                          className="text-white"
                          size={20}
                        />
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Input
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                placeholder={getPlaceholderForPlatform(link.name)}
                error={getErrorForLink(index, 'url')}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLink(link.id)}
              className="text-white hover:text-red-500"
            >
              <X size={20} />
            </Button>
          </div>
        ))}
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
              platformId={link.name}
              className="text-white"
              size={16}
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
