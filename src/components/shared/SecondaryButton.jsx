export const SecondaryButton = ({
  type = 'button',
  children,
  disabled = false,
  className = '',
  onClick,
}) => (
  <button
    className={`
      h-[60px]
      cursor-pointer
      flex items-center
      bg-white/5 backdrop-blur-sm
      border border-white/20
      rounded-lg font-semibold
      hover:bg-white/10
      hover:border-white/30
      transition-all
      shadow-lg
      gap-1.5
      px-10 py-4 text-[20px]
      disabled:opacity-50
      disabled:cursor-not-allowed
      disabled:hover:bg-white/5
      disabled:hover:border-white/20
      ${className}
    `}
    disabled={disabled}
    type={type}
    onClick={onClick}
  >
    {children}
  </button>
);
