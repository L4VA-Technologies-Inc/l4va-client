import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const LavaCheckbox = ({
  name,
  checked,
  onChange,
  label,
  description,
  error,
  className = '',
}) => (
  <div className={`flex items-start ${className}`}>
    <label className="flex items-start cursor-pointer" htmlFor={name}>
      <div className="relative mr-2 mt-1">
        <input
          checked={checked}
          className="peer sr-only"
          id={name}
          name={name}
          type="checkbox"
          onChange={onChange}
        />
        <div className={`w-5 h-5 flex items-center justify-center border ${error ? 'border-main-red' : 'border-main-orange'} rounded-sm bg-transparent peer-checked:bg-transparent`}>
          {checked && (
            <Check size={16} strokeWidth={2} />
          )}
        </div>
      </div>
      <div>
        <span className="text-white text-sm">
          {label}
        </span>
        {description && (
          <p className="text-dark-100 text-sm mt-1">
            {description}
          </p>
        )}
        {error && (
          <p className="text-main-red text-sm mt-1">{typeof error === 'string' ? error : 'This field is required'}</p>
        )}
      </div>
    </label>
  </div>
);
