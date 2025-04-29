import { Globe } from 'lucide-react';

import FacebookIcon from '@/icons/facebook.svg?react';
import XIcon from '@/icons/x.svg?react';
import MediumIcon from '@/icons/medium.svg?react';
import TelegramIcon from '@/icons/telegram.svg?react';
import TikTokIcon from '@/icons/tiktok.svg?react';
import YouTubeIcon from '@/icons/youtube.svg?react';
import { SOCIAL_PLATFORMS } from '@/constants/core.constants';

const iconMap = {
  [SOCIAL_PLATFORMS.FACEBOOK]: FacebookIcon,
  [SOCIAL_PLATFORMS.X]: XIcon,
  [SOCIAL_PLATFORMS.MEDIUM]: MediumIcon,
  [SOCIAL_PLATFORMS.TELEGRAM]: TelegramIcon,
  [SOCIAL_PLATFORMS.TIKTOK]: TikTokIcon,
  [SOCIAL_PLATFORMS.YOUTUBE]: YouTubeIcon,
  [SOCIAL_PLATFORMS.WEBSITE]: Globe,
};

export const SocialPlatformIcon = ({ platformId, className }) => {
  const Icon = iconMap[platformId];

  if (!Icon) return null;

  return (
    <Icon className={className} height={20} width={20} />
  );
};
