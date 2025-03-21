import { useState, useEffect } from 'react';
import {
  Plus, X, Edit, Check, Trash,
} from 'lucide-react';
import toast from 'react-hot-toast';
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
import { CoreApiProvider } from '@/services/api/core';
import { useAuth } from '@/context/auth';

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
  };

  const handleSave = async () => {
    if (!editingLink.url.trim()) {
      toast.error('URL cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      let newLinks;

      if (editingId) {
        newLinks = socialLinks.map(link =>
          link.id === editingId ? { ...editingLink, id: editingId } : link,
        );
      } else {
        newLinks = [...socialLinks, { ...editingLink, id: Date.now() }];
      }

      await CoreApiProvider.updateProfile({ socialLinks: newLinks });
      setSocialLinks(newLinks);
      resetEditState();
      toast.success(editingId ? 'Social link updated successfully' : 'Social link added successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to save social link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setEditingLink({ ...link });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);

    try {
      const newLinks = socialLinks.filter(link => link.id !== id);
      await CoreApiProvider.updateProfile({ socialLinks: newLinks });
      setSocialLinks(newLinks);
      toast.success('Social link removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove social link');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderForPlatform = (platformId) => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    return platform ? platform.placeholder : 'Enter URL';
  };

  const formatUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-russo text-[40px] uppercase">
          Socials
        </h2>
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
        <div className="flex flex-col rounded-lg bg-input-bg border border-dark-600 mb-4">
          <div className="flex items-center gap-2 p-3">
            <Select
              disabled={isLoading}
              value={editingLink.name}
              onValueChange={(value) => setEditingLink({ ...editingLink, name: value })}
            >
              <SelectTrigger className="bg-transparent border-none shadow-none w-32 p-0">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="border-white/20 bg-input-bg">
                {socialPlatforms.map((platform) => (
                  <SelectItem key={platform.id} className="hover:bg-white/5" value={platform.id}>
                    <div className="flex items-center gap-2">
                      <SocialPlatformIcon
                        className="text-dark-100"
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
            <div className="flex-1 relative">
              <Input
                className={
                  `py-4 pl-5 pr-24 text-[20px] bg-transparent border-none shadow-none ${!editingLink.url.trim() ? 'focus:ring-red-500' : ''}`
                }
                disabled={isLoading}
                placeholder={getPlaceholderForPlatform(editingLink.name)}
                style={{ fontSize: '20px' }}
                value={editingLink.url}
                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  className={
                    `p-2 rounded-full transition-colors
                    ${!editingLink.url.trim() || isLoading
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-dark-100 hover:bg-white/10'}`
                  }
                  disabled={!editingLink.url.trim() || isLoading}
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4" />
                </button>
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
      )}

      <div className="space-y-4">
        {socialLinks.map((link) => (
          <div key={link.id} className="flex items-center gap-2 group">
            <SocialPlatformIcon
              className="text-dark-100"
              platformId={link.name}
              size={20}
            />
            <a
              className="text-[20px] hover:text-main-red transition-colors"
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
        {socialLinks.length === 0 && (
          <div className="text-dark-100 text-base mb-2">
            No social links added. Click the + button to add one.
          </div>
        )}
        {socialLinks.length >= MAX_LINKS && (
          <div className="text-main-red text-base mb-2">
            Maximum number of links ({MAX_LINKS}) reached.
          </div>
        )}
      </div>
    </div>
  );
};
