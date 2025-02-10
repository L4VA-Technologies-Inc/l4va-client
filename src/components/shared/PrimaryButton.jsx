export const PrimaryButton = ({
  children,
  onClick,
  className = '',
  icon: Icon,
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
        flex items-center
        bg-main-orange text-navy
        rounded-lg font-semibold
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
