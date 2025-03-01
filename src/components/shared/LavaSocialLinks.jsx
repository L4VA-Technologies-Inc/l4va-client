// LavaSocialLinks.jsx
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const LavaSocialLinks = ({
  socialLinks = [],
  setSocialLinks,
  errors,
  touched,
}) => {
  const socialPlatforms = [
    {
      id: 'facebook', name: 'Facebook', icon: <Facebook size={20} />, placeholder: 'facebook.com/',
    },
    {
      id: 'twitter', name: 'Twitter', icon: <Twitter size={20} />, placeholder: 'twitter.com/',
    },
    {
      id: 'x', name: 'X', icon: <X size={20} />, placeholder: 'x.com/',
    },
    {
      id: 'instagram', name: 'Instagram', icon: <Instagram size={20} />, placeholder: 'instagram.com/',
    },
    {
      id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={20} />, placeholder: 'linkedin.com/in/',
    },
    {
      id: 'youtube', name: 'YouTube', icon: <Youtube size={20} />, placeholder: 'youtube.com/',
    },
    {
      id: 'github', name: 'GitHub', icon: <Github size={20} />, placeholder: 'github.com/',
    },
  ];

  const addNewLink = () => {
    setSocialLinks([...socialLinks, {
      platform: 'facebook',
      url: '',
      id: Date.now(),
    }]);
  };

  const updateLink = (id, field, value) => {
    setSocialLinks(socialLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link,
    ));
  };

  const removeLink = (id) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const getPlaceholderForPlatform = (platformId) => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    return platform ? platform.placeholder : '';
  };

  const hasErrors = errors && Array.isArray(errors);
  const isTouched = touched && Array.isArray(touched);

  return (
    <div className="w-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div className="uppercase text-[20px] font-bold">
          *SOCIAL LINKS
        </div>
        <button
          className="border-2 border-white/20 rounded-[10px] p-2"
          type="button"
          onClick={addNewLink}
        >
          <img
            alt="add-icon"
            src="/assets/icons/plus.svg"
          />
        </button>
      </div>
      <div className="space-y-4">
        {socialLinks.map((link, index) => {
          const linkError = hasErrors && errors[index];
          const linkTouched = isTouched && touched[index];

          return (
            <div
              key={link.id}
              className={`flex items-center gap-2 p-3 rounded-lg bg-input-bg border ${
                linkError && linkTouched ? 'border-red-500' : 'border-dark-600'
              }`}
            >
              <Select
                value={link.platform}
                onValueChange={(value) => updateLink(link.id, 'platform', value)}
              >
                <SelectTrigger className="bg-transparent border-none shadow-none w-32 p-0">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="border-white/20 bg-input-bg">
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform.id} className="hover:bg-white/5" value={platform.id}>
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        <span>{platform.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="py-4 pl-5 text-[20px] border-none shadow-none"
                placeholder={getPlaceholderForPlatform(link.platform)}
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

              {linkError && linkTouched && linkError.url && (
                <div className="absolute -bottom-5 left-0 text-red-500 text-xs">
                  {linkError.url}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {socialLinks.length === 0 && (
        <div className="text-dark-100 text-[20px] mb-2">
          No social links added. Click the + button to add one.
        </div>
      )}
    </div>
  );
};
