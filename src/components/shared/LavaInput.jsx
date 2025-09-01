import { HelpCircle } from 'lucide-react';

import { formatNum } from '@/utils/core.utils';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';

export const LavaInput = ({
  name,
  label,
  value,
  onChange,
  error,
  maxLength,
  suffix,
  className,
  hint,
  placeholder = 'Enter text',
  type = 'text',
  required = false,
}) => {
  const handleChange = e => {
    const newValue = e.target.value;
    const isNumber = /^\d*$/.test(newValue.replace(/,/g, ''));

    if (isNumber) {
      const rawValue = newValue.replace(/,/g, '');
      e.target.value = rawValue;
      onChange(e);
      e.target.value = formatNum(rawValue);
    } else {
      onChange(e);
    }
  };

  const displayValue = value && /^\d*$/.test(value.toString().replace(/,/g, '')) ? formatNum(value) : value || '';

  return (
    <>
      {label ? (
        <div className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required ? '*' : ''}
            {label}
          </span>
          {hint && (
            <HoverHelp hint={hint} />
          )}
        </div>
      ) : null}
      <div className="mt-4">
        <div className="relative flex items-center">
          <input
            className={`
              rounded-[10px] bg-input-bg py-4 pl-5 
              ${suffix ? 'pr-12' : 'pr-5'} font-medium w-full border border-steel-850 h-[60px]
              focus:outline-none focus:ring-[1px] focus:ring-white transition-all duration-200
              ${className}
            `}
            maxLength={maxLength}
            name={name}
            placeholder={placeholder}
            type={type}
            value={displayValue}
            onChange={handleChange}
          />
          {suffix && <div className="absolute right-5 text-white/60 select-none">{suffix}</div>}
        </div>
        {error && <p className="text-red-600 mt-1">{error}</p>}
      </div>
    </>

  );
};

export const LavaSteelInput = ({
  label,
  value,
  onChange,
  hint,
  type = 'text',
  className = '',
  required = false,
  placeholder = 'Lorem ipsum',
  ...props
}) => {
  const handleChange = e => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div>
      {label ? (
        <div className="font-semibold mb-4 flex items-center gap-2">
          {required ? '*' : ''}
          {label}
          {hint && (
            <div className="group relative">
              <HelpCircle className="w-5 h-5 text-white/60 cursor-help" />
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {hint}
              </div>
            </div>
          )}
        </div>
      ) : null}
      <input
        className={`
          w-full px-4 py-2 bg-steel-850 text-white placeholder-white/60 rounded-lg 
          border border-steel-750
          focus:outline-none focus:ring-2 focus:ring-steel-750 ${className}
        `}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};
