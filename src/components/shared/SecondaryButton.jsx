export const SecondaryButton = ({
  children,
  onClick,
  className = '',
  icon: Icon,
  size = 'default', // can be "small", "default", or "large"
}) => {
  const sizeClasses = {
    small: 'px-6 py-4',
    default: 'px-14 py-4 text-lg',
    large: 'px-16 py-5 text-xl',
  };

  return (
    <button
      className={`
        flex items-center
        bg-transparent border-2 border-gray-600
        text-white
        rounded-lg font-semibold
        hover:bg-white/5
        transition-colors
        gap-1.5
        ${sizeClasses[size]}
        ${className}
      `}
      type="button"
      onClick={onClick}
    >
      {Icon && <Icon height={20} width={20} />}
      <span>{children}</span>
    </button>
  );
};
