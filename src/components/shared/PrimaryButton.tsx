import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PrimaryButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  color?: string;
}

const PrimaryButton = ({ children, className, disabled = false, size = 'md', onClick }: PrimaryButtonProps) => {
  const sizeClasses = {
    sm: 'h-9 px-4 py-2 rounded-lg text-sm',
    md: 'h-10 px-4 py-2.5 rounded-lg',
    lg: 'h-12 px-6 py-3 rounded-lg',
  } as const;

  return (
    <button
      disabled={disabled}
      type="button"
      className={cn(
        'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[var(--color-orange-500)] to-[#FFD012] text-slate-950 hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:opacity-50 active:opacity-80',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
