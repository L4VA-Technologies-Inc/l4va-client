import { useState } from 'react';

export const LavaTextarea = ({
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter text',
  error,
  required = false,
  minHeight = 'min-h-32',
  className = '',
}) => (
  <>
    {label ? (
      <div className="uppercase font-bold">
        {required ? '*' : ''}
        {label}
      </div>
    ) : null}
    <div className="mt-4">
      <textarea
        className={`
          resize-none py-4 pl-5 pr-5 font-medium w-full border border-steel-850 bg-input-bg rounded-[10px] 
          focus:outline-none focus:ring-[1px] focus:ring-white focus:border-white transition-all duration-200
          ${minHeight}
          ${error ? 'border-red-600' : ''}
          ${className}
        `}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
      />
      {error && <p className="text-red-600 mt-1">{error}</p>}
    </div>
  </>
);

export const LavaSteelTextarea = ({
  label,
  required = false,
  placeholder = 'Lorem ipsum',
  value,
  className = '',
  minHeight = 'min-h-32',
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  const handleChange = e => {
    setInputValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div>
      {label ? (
        <div className="font-semibold mb-4">
          {required ? '*' : ''}
          {label}
        </div>
      ) : null}
      <textarea
        className={`
          resize-none w-full px-4 py-2 bg-steel-850 text-white placeholder-white/60 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-steel-750 ${minHeight} ${className}
        `}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};
