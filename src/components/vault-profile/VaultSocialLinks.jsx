import { SocialPlatformIcon } from '@/components/shared/SocialPlatformIcon';

export const VaultSocialLinks = ({ socialLinks = [] }) => {
  if (socialLinks.length === 0) {
    return <p className="text-dark-100 text-sm">No social links</p>;
  }

  return (
    <div className="flex justify-center gap-4">
      {socialLinks.slice(0, 5).map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity border border-dark-100"
        >
          <SocialPlatformIcon className="text-dark-100" platformId={link.name} size={20} />
        </a>
      ))}
    </div>
  );
};
