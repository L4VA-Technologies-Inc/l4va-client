import { Check } from 'lucide-react';
import { ChangeEvent } from 'react';

type LavaCheckboxProps = {
  name: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
  error?: string | boolean;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export const LavaCheckbox = ({
  name,
  checked,
  onChange,
  label,
  description,
  error,
  className = '',
  labelClassName = '',
  disabled = false,
}: LavaCheckboxProps) => (
  <div className={`flex items-center ${className}`}>
    <label
      className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      htmlFor={name}
    >
      <div className="relative">
        <input
          checked={checked}
          className="peer sr-only"
          id={name}
          name={name}
          type="checkbox"
          onChange={onChange}
          disabled={disabled}
        />
        <div
          className={`w-6 h-6 flex items-center justify-center border ${error ? 'border-red-600' : 'border-steel-750'} bg-steel-850 rounded-lg`}
        >
          {checked && <Check size={20} strokeWidth={2} />}
        </div>
      </div>
      <div>
        <span className={`text-sm ${labelClassName}`}>{label}</span>
        {description && <p className="text-dark-100 text-sm">{description}</p>}
        {error && (
          <p className="text-red-600 text-sm mt-1">{typeof error === 'string' ? error : 'This field is required'}</p>
        )}
      </div>
    </label>
  </div>
);
