export const PrimaryButton = ({
  children,
  onClick,
  className = '',
}) => (
  <button
    className={`
      h-14
      cursor-pointer
      flex items-center
      bg-gradient-to-r from-[#FF842C] to-[#FFD012]
      rounded-lg font-bold
      transition-colors
      gap-1.5
      font-satoshi
      
      hover:opacity-90
      px-12 py-4 text-[20px]
      ${className}
    `}
    type="button"
    onClick={onClick}
  >
    {children}
  </button>
);
