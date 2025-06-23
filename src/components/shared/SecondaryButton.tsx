import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SecondaryButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'h-9 px-4 py-2 rounded-lg text-sm',
  md: 'h-10 px-4 py-2.5 rounded-lg text-sm',
  lg: 'h-12 px-6 py-3 rounded-xl text-sm',
} as const;

const SecondaryButton = ({
  type = 'button',
  children,
  disabled = false,
  className,
  size = 'md',
  onClick,
}: SecondaryButtonProps) => (
  <button
    disabled={disabled}
    type={type}
    className={cn(
      'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg font-satoshi hover:bg-white/10 hover:border-white/30 shadow-lg disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/20',
      sizeClasses[size],
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export default SecondaryButton;
