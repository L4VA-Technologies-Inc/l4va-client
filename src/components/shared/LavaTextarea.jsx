import { useState, useId } from 'react';

const getAutocompleteValue = name => {
  if (!name) return undefined;

  const nameLower = name.toLowerCase();

  if (nameLower.includes('address')) {
    return 'street-address';
  }

  if (nameLower.includes('description') || nameLower.includes('note') || nameLower.includes('comment')) {
    return 'off';
  }

  return undefined;
};

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
  id,
  autoComplete,
}) => {
  const generatedId = useId();
  const textareaId = id || (name ? `lava-textarea-${name}` : generatedId);
  const autocompleteValue = autoComplete !== undefined ? autoComplete : getAutocompleteValue(name);

  return (
    <>
      {label ? (
        <label htmlFor={textareaId} className="uppercase font-bold">
          {required ? '*' : ''}
          {label}
        </label>
      ) : null}
      <div className="mt-4">
        <textarea
          id={textareaId}
          className={`
          resize-none py-4 pl-5 pr-5 font-medium w-full border border-steel-850 bg-input-bg rounded-[10px] 
          focus:outline-none focus:ring-[1px] focus:ring-white transition-all duration-200
          ${minHeight}
          ${error ? 'border-red-600' : ''}
          ${className}
        `}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          autoComplete={autocompleteValue}
        />
        {error && <p className="text-red-600 mt-1">{error}</p>}
      </div>
    </>
  );
};

export const LavaSteelTextarea = ({
  label,
  required = false,
  placeholder = 'Lorem ipsum',
  value,
  className = '',
  minHeight = 'min-h-32',
  onChange,
  error = false,
  name,
  id,
  autoComplete,
}) => {
  const generatedId = useId();
  const textareaId = id || (name ? `lava-steel-textarea-${name}` : generatedId);
  const autocompleteValue = autoComplete !== undefined ? autoComplete : getAutocompleteValue(name);
  const [inputValue, setInputValue] = useState(value || '');

  const handleChange = e => {
    setInputValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div>
      {label ? (
        <label htmlFor={textareaId} className="font-semibold mb-4">
          {required ? '*' : ''}
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={`
          resize-none w-full px-4 py-2 bg-steel-850 text-white placeholder-white/60 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-steel-750 ${minHeight} ${className}
          ${error ? 'border border-red-600' : 'border border-steel-750'}
        `}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        name={name}
        autoComplete={autocompleteValue}
      />
    </div>
  );
};
