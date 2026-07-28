import type { SVGProps } from 'react';

import { useNetwork } from '@/hooks/useNetwork';
import CardanoL4vaIcon from '@/icons/l4va.svg?react';
import RobinhoodL4vaIcon from '@/icons/l4va-rh.svg?react';
import type { NetworkType } from '@/hooks/useNetwork';

type L4vaIconProps = SVGProps<SVGSVGElement> & {
  chainType?: NetworkType | string | null;
};

export const L4vaIcon = ({ chainType, ...props }: L4vaIconProps) => {
  const { network } = useNetwork();
  const activeNetwork = chainType ?? network;
  const Icon = activeNetwork === 'robinhood' ? RobinhoodL4vaIcon : CardanoL4vaIcon;

  return <Icon {...props} />;
};

export default L4vaIcon;
