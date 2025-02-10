export const PrimaryButton = ({
  children,
  onClick,
  className = '',
  size = 'default',
}) => {
  const sizeClasses = {
    small: 'px-6 py-4',
    default: 'px-14 py-4 text-lg',
    large: 'px-16 py-5 text-xl',
  };

  return (
    <button
      className={`
        cursor-pointer
        flex items-center
        bg-main-orange
        rounded-lg font-bold
        transition-colors
        gap-1.5
        font-satoshi
        text-primary-text
        ${sizeClasses[size]}
        ${className}
      `}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
