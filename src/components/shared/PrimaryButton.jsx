export const PrimaryButton = ({ type = 'button', children, disabled = false, className = '', onClick }) => (
  <button
    className={`
      h-[60px]
      cursor-pointer
      flex items-center
      bg-gradient-to-r from-[#FF842C] to-[#FFD012]
      rounded-lg font-bold
      transition-colors
      font-satoshi
      hover:opacity-90
      gap-1.5
      px-10 py-4 text-[20px]
      text-slate-950
      disabled:opacity-50
      disabled:cursor-not-allowed
      disabled:bg-gray-300
      disabled:hover:opacity-50
      ${className}
    `}
    disabled={disabled}
    type={type}
    onClick={onClick}
  >
    {children}
  </button>
);
