import type { FunctionComponent, SVGProps } from 'react';

import { HoverHelp } from '@/components/shared/HoverHelp';
import { ChainType } from '@/utils/types';
import { cn } from '@/lib/utils';
import CardanoIcon from '@/icons/cardano.svg?react';
import RobinhoodIcon from '@/icons/robinhood.svg?react';

type ChainConfig = {
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  label: string;
  hint: string;
  /** Official brand color; when omitted the icon inherits the default white. */
  color?: string;
};

const CHAIN_CONFIG: Record<string, ChainConfig> = {
  [ChainType.CARDANO]: {
    Icon: CardanoIcon,
    label: 'Cardano',
    hint: 'This vault lives on the Cardano blockchain.',
  },
  [ChainType.ROBINHOOD]: {
    Icon: RobinhoodIcon,
    label: 'Robinhood',
    hint: 'This vault lives on the Robinhood Chain (EVM).',
    color: '#CCFF00',
  },
};

type ChainBadgeProps = {
  chainType?: ChainType | string | null;
  /** Extra classes for the pill wrapper (positioning, background, etc.). */
  className?: string;
  iconClassName?: string;
};

/**
 * Renders a chain's logo in place of its name, with a tooltip on hover that
 * explains which chain the vault is on.
 */
export const ChainBadge = ({ chainType, className = '', iconClassName = 'h-4 w-4' }: ChainBadgeProps) => {
  if (!chainType) return null;

  const config = CHAIN_CONFIG[chainType];
  if (!config) return null;

  const { Icon, label, hint, color } = config;

  return (
    <HoverHelp
      hint={hint}
      variant="icon"
      className={cn('inline-flex items-center justify-center rounded-full cursor-help', className)}
    >
      <span role="img" aria-label={`${label} chain`} className="inline-flex" style={color ? { color } : undefined}>
        <Icon className={cn(!color && 'text-white', iconClassName)} />
      </span>
    </HoverHelp>
  );
};
