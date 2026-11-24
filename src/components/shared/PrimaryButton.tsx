import { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  /** Accepted for backwards compatibility; not rendered. */
  icon?: unknown;
}

const PrimaryButton = ({
  children,
  className,
  disabled = false,
  size = 'md',
  onClick,
  type = 'button',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripped so they never reach the DOM
  color: _color,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  icon: _icon,
  ...rest
}: PrimaryButtonProps) => {
  const sizeClasses = {
    sm: 'h-9 px-4 py-2 rounded-lg text-sm',
    md: 'h-10 px-4 py-2.5 rounded-lg',
    lg: 'h-12 px-6 py-3 rounded-lg',
  } as const;

  return (
    <button
      {...rest}
      disabled={disabled}
      type={type}
      className={cn(
        'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[opacity,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 bg-orange-gradient text-slate-950 hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:opacity-50 active:scale-[0.97] active:opacity-80',
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
