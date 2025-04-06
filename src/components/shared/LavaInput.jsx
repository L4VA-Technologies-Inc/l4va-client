import { useState } from 'react';
import { formatNum } from '@/utils/core.utils';

export const LavaInput = ({
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter text',
  error,
  type = 'text',
  required = false,
  maxLength,
  suffix,
  className,
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    const isNumber = (/^\d*$/).test(newValue.replace(/,/g, ''));

    if (isNumber) {
      const rawValue = newValue.replace(/,/g, '');
      e.target.value = rawValue;
      onChange(e);
      e.target.value = formatNum(rawValue);
    } else {
      onChange(e);
    }
  };

  const displayValue = value && (/^\d*$/).test(value.toString().replace(/,/g, ''))
    ? formatNum(value)
    : (value || '');

  return (
    <>
      {label ? (
        <div className="uppercase text-[20px] font-bold">
          {required ? '*' : ''}{label}
        </div>
      ) : null}
      <div className="mt-4">
        <div className="relative flex items-center">
          <input
            className={`
              rounded-[10px] bg-input-bg py-4 pl-5 
              ${suffix ? 'pr-12' : 'pr-5'} text-lg font-medium w-full border border-dark-600 h-[60px]
              focus:outline-none focus:ring-[1px] focus:ring-white focus:border-white transition-all duration-200
              ${className}
            `}
            maxLength={maxLength}
            name={name}
            placeholder={placeholder}
            type={type}
            value={displayValue}
            onChange={handleChange}
          />
          {suffix && (
            <div className="absolute right-5 text-lg text-white/60 select-none">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-main-red mt-1">
            {error}
          </p>
        )}
      </div>
    </>
  );
};

export const LavaSteelInput = ({
  label,
  required = false,
  placeholder = 'Lorem ipsum',
  value,
  className = '',
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div>
      {label ? (
        <div className="text-[20px] font-semibold mb-4">
          {required ? '*' : ''}{label}
        </div>
      ) : null}
      <input
        className={`
          w-full px-4 py-2 bg-steel-850 text-white placeholder-white/60 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-[#2D3049] ${className}
        `}
        placeholder={placeholder}
        type="text"
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};
