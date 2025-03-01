export const PrimaryButton = ({
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
      bg-gradient-to-r from-[#FF842C] to-[#FFD012]
      rounded-lg font-bold
      transition-colors
      gap-1.5
      font-satoshi
      hover:opacity-90
      px-12 py-4 text-[20px]
      text-dark-700
      ${className}
    `}
    disabled={disabled}
    type={type}
    onClick={onClick}
  >
    {children}
  </button>
);
