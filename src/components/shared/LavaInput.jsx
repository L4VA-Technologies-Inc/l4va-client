import { HelpCircle, Search } from 'lucide-react';
import { useEffect, useState, useId } from 'react';

import { formatNum } from '@/utils/core.utils';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';

const getAutocompleteValue = (name, type) => {
  if (!name) return undefined;

  const nameLower = name.toLowerCase();

  if (nameLower.includes('email') || type === 'email') {
    return 'email';
  }

  if (nameLower.includes('password') || type === 'password') {
    return 'current-password';
  }

  if (nameLower === 'name' || nameLower === 'fullname' || nameLower === 'full-name') {
    return 'name';
  }

  if (nameLower.includes('username') || nameLower === 'user') {
    return 'username';
  }

  if (nameLower.includes('phone') || nameLower.includes('tel')) {
    return 'tel';
  }

  if (nameLower.includes('address')) {
    return 'street-address';
  }

  if (nameLower === 'city') {
    return 'address-level2';
  }

  if (nameLower === 'country') {
    return 'country';
  }

  if (nameLower.includes('zip') || nameLower.includes('postal')) {
    return 'postal-code';
  }

  if (nameLower.includes('search')) {
    return 'off';
  }

  return undefined;
};

export const LavaInput = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  maxLength,
  suffix,
  className,
  hint,
  placeholder = 'Enter text',
  type = 'text',
  required = false,
  id,
  autoComplete,
}) => {
  const generatedId = useId();
  const inputId = id || (name ? `lava-input-${name}` : generatedId);
  const autocompleteValue = autoComplete !== undefined ? autoComplete : getAutocompleteValue(name, type);

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
        <label htmlFor={inputId} className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required ? '*' : ''}
            {label}
          </span>
          {hint && <HoverHelp hint={hint} />}
        </label>
      ) : null}
      <div className="mt-4">
        <div className="relative flex items-center">
          <input
            id={inputId}
            className={`
              lava-input
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
            onBlur={onBlur}
            autoComplete={autocompleteValue}
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
  error = false,
  name,
  id,
  autoComplete,
  disabled = false,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || (name ? `lava-steel-input-${name}` : generatedId);
  const autocompleteValue = autoComplete !== undefined ? autoComplete : getAutocompleteValue(name, type);

  const handleChange = e => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="font-semibold mb-4 flex items-center gap-2">
          {required ? '*' : ''}
          {label}
          {hint && (
            <div className="group relative">
              <HelpCircle className="w-5 h-5 text-white/60 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {hint}
              </div>
            </div>
          )}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`
          lava-steel-input
          w-full px-4 py-2 bg-steel-850 text-white placeholder-white/60 rounded-lg 
          ${error ? 'border border-red-600' : 'border border-steel-750'}
          focus:outline-none focus:ring-2 focus:ring-steel-750
          ${disabled ? 'opacity-50' : ''}
          ${className}
        `}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={handleChange}
        name={name}
        autoComplete={autocompleteValue}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

export const LavaSearchInput = ({
  name,
  onChange,
  onBlur,
  maxLength,
  className,
  placeholder = 'Search',
  type = 'text',
  value: propValue = '',
  debounceTime = 300,
  id,
}) => {
  const generatedId = useId();
  const inputId = id || (name ? `lava-search-input-${name}` : generatedId);
  const autocompleteValue = 'off';

  const [value, setValue] = useState(propValue);

  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceTime]);

  useEffect(() => {
    if (onChange) onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleChange = e => {
    setValue(e.target.value);
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        id={inputId}
        className={`
              lava-input
              bg-input-bg h-10 px-4 py-2.5 rounded-lg
              pr-12 font-medium w-full border border-steel-850
              focus:outline-none focus:ring-[1px] focus:ring-white transition-all duration-200
              ${className}
            `}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        type={type}
        onChange={event => handleChange(event)}
        onBlur={onBlur}
        value={value}
        autoComplete={autocompleteValue}
        aria-label={placeholder}
      />
      <div className="absolute right-3 text-white/60 select-none">
        <Search />
      </div>
    </div>
  );
};
