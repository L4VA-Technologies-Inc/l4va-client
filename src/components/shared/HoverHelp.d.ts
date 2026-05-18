import type { ReactNode, ReactElement } from 'react';

export type HoverHelpProps = {
  hint: string;
  className?: string;
  variant?: 'help' | 'icon';
  children?: ReactNode;
  wrap?: boolean;
};

export declare const HoverHelp: (props: HoverHelpProps) => ReactElement;
