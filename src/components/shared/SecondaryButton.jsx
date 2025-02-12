export const SecondaryButton = ({
  children,
  onClick,
  className = '',
  icon: Icon,
}) => (
  <button
    className={`
        h-14
        cursor-pointer
        flex items-center
        bg-white/5 backdrop-blur-sm
        border-2 border-white/20
        text-white
        rounded-lg font-semibold
        hover:bg-white/10
        hover:border-white/30
        transition-all
        shadow-lg
        gap-1.5
        px-10 py-4 text-[20px]
        ${className}
      `}
    type="button"
    onClick={onClick}
  >
    {Icon && <Icon height={20} width={20} />}
    <span>{children}</span>
  </button>
);
