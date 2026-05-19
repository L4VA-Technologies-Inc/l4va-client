import { useId } from 'react';

import { HoverHelp } from '@/components/shared/HoverHelp';

type BadgeSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/** Scalloped circle — same silhouette as Instagram's verified badge */
const buildScallopedPath = (cx: number, cy: number, outerR: number, innerR: number, points = 12) => {
  const segments = points * 2;
  let path = '';

  for (let i = 0; i < segments; i += 1) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerR : innerR;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    path += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }

  return `${path}Z`;
};

const BADGE_PATH = buildScallopedPath(12, 12, 11.35, 9.85);

type VerifiedIconProps = {
  size?: BadgeSize;
  className?: string;
  gradientId: string;
};

const VerifiedIcon = ({ size = 'md', className = '', gradientId }: VerifiedIconProps) => (
  <svg viewBox="0 0 24 24" className={`shrink-0 ${SIZE_CLASS[size]} ${className}`} aria-hidden="true">
    <defs>
      <linearGradient id={gradientId} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF8D6" />
        <stop offset="38%" stopColor="#F5C518" />
        <stop offset="72%" stopColor="#D4A017" />
        <stop offset="100%" stopColor="#9A7209" />
      </linearGradient>
    </defs>
    <path d={BADGE_PATH} fill={`url(#${gradientId})`} />
    <path d={BADGE_PATH} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.6" />
    <ellipse cx="9.2" cy="8.4" rx="3.6" ry="2.2" fill="rgba(255,255,255,0.2)" />
    <path
      d="M7.1 12.15l2.75 2.75 7.05-7.35"
      stroke="white"
      strokeWidth="2.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export type GoldenVerifiedBadgeProps = {
  /** Tooltip text on hover (omit for icon-only, no tooltip) */
  hint?: string;
  size?: BadgeSize;
  className?: string;
  /** Accessible name */
  label?: string;
};

export const GoldenVerifiedBadge = ({
  hint = OFFICIAL_PARTNER_BADGE_HINT,
  size = 'md',
  className = '',
  label = 'Verified',
}: GoldenVerifiedBadgeProps) => {
  const gradientId = useId().replace(/:/g, '');
  const icon = <VerifiedIcon size={size} className={className} gradientId={gradientId} />;

  if (!hint) {
    return (
      <span className="inline-flex align-middle" role="img" aria-label={label}>
        {icon}
      </span>
    );
  }

  return (
    <HoverHelp hint={hint} variant="icon" className="inline-flex align-middle group">
      <span
        tabIndex={0}
        role="img"
        aria-label={label}
        className="inline-flex cursor-pointer rounded-full transition-transform duration-150 ease-out group-hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
      >
        {icon}
      </span>
    </HoverHelp>
  );
};

export const OFFICIAL_PARTNER_BADGE_HINT = 'Official L4VA partner vault — verified and supported by the L4VA team.';
