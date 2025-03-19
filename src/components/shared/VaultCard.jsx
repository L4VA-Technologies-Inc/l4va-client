import { Link } from 'react-router-dom';
import { formatCompactNumber, formatNum } from '@/utils/core.utils';

const socialLinks = [
  { icon: '/assets/social/x.svg', url: 'https://twitter.com/yourusername' },
  { icon: '/assets/social/xing.svg', url: 'https://xing.com/yourusername' },
  { icon: '/assets/social/stumble-upon.svg', url: 'https://mix.com/yourusername' },
  { icon: '/assets/social/vine.svg', url: '#' },
  { icon: '/assets/social/last-fm.svg', url: 'https://last.fm/user/yourusername' },
];

const progress = 75;
const raised = 750000;
const goal = 1000000;
const tvl = 150000;
const baseAllo = 10000;
const image = '/assets/vaults/space-man.webp';

export const VaultCard = (props) => {
  const {
    id,
    name,
    description,
    privacy,
    vaultImage,
  } = props;

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
          <div className="flex justify-center gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                className="
                  rounded-full border border-white/10 p-2 hover:bg-slate-700
                  inline-flex items-center justify-center
                "
                href={social.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt={`Social icon ${index + 1}`}
                  className="h-5 w-5 text-dark-100"
                  src={social.icon}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
