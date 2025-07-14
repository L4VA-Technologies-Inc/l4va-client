import { X } from 'lucide-react';

export const Chip = ({
  label,
  value,
  selected = false,
  onSelect,
  onRemove,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const baseClasses = `inline-flex items-center rounded-full font-medium border transition-colors ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${sizeClasses[size]} ${className}`;

  const selectedClasses = selected
    ? 'bg-orange-500 border-orange-500 text-white'
    : 'bg-steel-850 border-steel-750 text-gray-400 hover:bg-steel-800';

  const handleClick = () => {
    if (!disabled && onSelect && value) {
      onSelect(value);
    }
  };

  const handleRemove = e => {
    e.stopPropagation();
    if (!disabled && onRemove && value) {
      onRemove(value);
    }
  };

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={handleClick}>
      <span>{label}</span>
      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-2 text-steel-400 hover:text-white transition-colors"
          disabled={disabled}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
