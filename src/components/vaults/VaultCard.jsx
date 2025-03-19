import { Link } from 'react-router-dom';
import { formatCompactNumber, formatNum } from '@/utils/core.utils';

import FacebookIcon from '@/icons/facebook.svg?react';
import XIcon from '@/icons/x.svg?react';
import MediumIcon from '@/icons/medium.svg?react';
import TelegramIcon from '@/icons/telegram.svg?react';
import TikTokIcon from '@/icons/tiktok.svg?react';
import YouTubeIcon from '@/icons/youtube.svg?react';

const progress = 75;
const raised = 750000;
const goal = 1000000;
const tvl = 150000;
const baseAllo = 10000;
const image = '/assets/vaults/space-man.webp';

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FacebookIcon className="text-white" width={20} height={20} />,
  },
  {
    id: 'x',
    name: 'X',
    icon: <XIcon className="text-white" width={20} height={20} />,
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: <MediumIcon className="text-white" width={20} height={20} />,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <TelegramIcon className="text-white" width={20} height={20} />,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <TikTokIcon className="text-white" width={20} height={20} />,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <YouTubeIcon className="text-white" width={20} height={20} />,
  },
];

export const VaultCard = (props) => {
  const {
    id,
    name,
    description,
    privacy,
    vaultImage,
    socialLinks = [],
  } = props;

  const getPlatformIcon = (platformId) => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    console.log(platform);
    return platform ? platform.icon : null;
  };

  return (
    <Link className="block" to={`/vaults/${id}`}>
      <div className="max-w-md rounded-xl bg-dark-600 overflow-hidden">
        <div className="h-48">
          <img
            alt="Vault avatar"
            className="h-full w-full object-cover"
            src={vaultImage || image}
          />
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <img
              alt="icon"
              className="h-16 w-16 rounded-xl"
              src="/assets/vault-logo.png"
            />
            <div>
              <h2 className="font-satoshi text-[20px] font-bold ">
                {name || 'No name'}
              </h2>
              <p className="text-sm text-dark-100">
                {description || 'No description'}
              </p>
            </div>
          </div>
          <div className="mb-6 text-sm font-russo">
            <div className="mb-2 flex justify-between ">
              <span className="font-bold">Total Raised: <span className="text-main-yellow">{progress}%</span></span>
              <span className="text-main-yellow">
                ${formatNum(raised)} / ${formatNum(goal)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-800/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-950 via-yellow-500 to-yellow-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-dark-100">TVL</p>
              <p className="font-bold ">{formatCompactNumber(tvl)}</p>
            </div>
            <div className="border-x border-slate-800">
              <p className="text-sm text-dark-100">Privacy</p>
              <p className="font-bold ">
                {privacy}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-100">Base allo</p>
              <p className="font-bold ">{formatCompactNumber(baseAllo)}</p>
            </div>
          </div>
          <div className="flex justify-center gap-3 h-10">
            {socialLinks.length > 0 ? (
              socialLinks.map((social, index) => (
                <a
                  key={index}
                  className="
                    rounded-full p-2
                    inline-flex items-center justify-center
                    hover:bg-slate-700
                  "
                  href={social.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {getPlatformIcon(social.name)}
                </a>
              ))
            ) : (
              <span className="text-dark-100 text-sm">No social links</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
