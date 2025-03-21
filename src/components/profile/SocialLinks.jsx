import { useState, useEffect } from 'react';
import { Plus, X, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';
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
import { CoreApiProvider } from '@/services/api/core';
import { useAuth } from '@/context/auth';

const MAX_LINKS = 5;

export const SocialLinks = () => {
  const { user, checkAuth } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [editingLink, setEditingLink] = useState({
    name: SOCIAL_PLATFORMS.FACEBOOK,
    url: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.socialLinks) {
      setSocialLinks(user.socialLinks);
    }
  }, [user]);

  const handleSave = async () => {
    if (!editingLink.url.trim()) {
      return;
    }

    try {
      let newLinks;
      if (editingId) {
        // Editing existing link
        newLinks = socialLinks.map(link =>
          link.id === editingId ? { ...editingLink, id: editingId } : link
        );
      } else {
        // Adding new link
        newLinks = [...socialLinks, { ...editingLink, id: Date.now() }];
      }

      await CoreApiProvider.updateProfile({ socialLinks: newLinks });
      await checkAuth(); // Refresh user data
      setIsAdding(false);
      setEditingId(null);
      setEditingLink({
        name: SOCIAL_PLATFORMS.FACEBOOK,
        url: '',
      });
      toast.success('Social links updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update social links');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditingLink({
      name: SOCIAL_PLATFORMS.FACEBOOK,
      url: '',
    });
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setEditingLink(link);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    try {
      const newLinks = socialLinks.filter(link => link.id !== id);
      await CoreApiProvider.updateProfile({ socialLinks: newLinks });
      await checkAuth(); // Refresh user data
      toast.success('Social link removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove social link');
    }
  };

  const getPlaceholderForPlatform = (platformId) => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    return platform ? platform.placeholder : '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-russo text-[40px] uppercase">
          Socials
        </h2>
        {socialLinks.length < MAX_LINKS && !isAdding && (
          <button
            className="border-2 border-white/20 rounded-[10px] p-2"
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
              className={
                `py-4 pl-5 text-[20px] border-none shadow-none ${!editingLink.url.trim() ? 'focus:ring-red-500' : ''}`
              }
              placeholder={getPlaceholderForPlatform(editingLink.name)}
              style={{ fontSize: '20px' }}
              value={editingLink.url}
              onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
            />
            <div className="flex gap-2">
              <Button
                className={
                  `h-8 w-8 rounded-full 
                  ${!editingLink.url.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`
                }
                disabled={!editingLink.url.trim()}
                size="icon"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700"
                size="icon"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {socialLinks.map((link) => (
          <div key={link.id} className="flex items-center gap-2">
            <SocialPlatformIcon
              className="text-white"
              platformId={link.name}
              size={20}
            />
            <a
              className="text-[20px] hover:text-main-red transition-colors"
              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.url}
            </a>
            <div className="flex gap-2 ml-auto">
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
                onClick={() => handleEdit(link)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(link.id)}
              >
                <X className="h-4 w-4" />
              </Button>
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