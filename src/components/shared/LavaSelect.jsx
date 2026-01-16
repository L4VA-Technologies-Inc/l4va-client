import { useState, useRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClickOutside } from '@/hooks/useClickOutside';

export const LavaSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  className,
  id,
  name,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <>
      {label ? (
        <label htmlFor={selectId} className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required ? '*' : ''}
            {label}
          </span>
        </label>
      ) : null}
      <div className="mt-4">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id={selectId}
            name={name}
            className={`
              bg-input-bg py-4 pl-5 pr-5 font-medium border border-steel-850 h-[60px] 
              focus:ring-0 focus:ring-offset-0
              ${className}
            `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-input-bg border border-steel-850">
            {options.map(option => (
              <SelectItem
                key={option.id || option.value}
                className="text-dark-100 hover:text-white hover:bg-slate-950 cursor-pointer py-3"
                value={option.id || option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-red-600 mt-1">{error}</p>}
      </div>
    </>
  );
};

export const LavaSteelSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  transparent = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = optionValue => {
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const selectedOption = options.find(option => option.value === value)?.label || placeholder;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className={`
          flex items-center justify-between w-full px-4 py-2 ${transparent ? 'bg-transparent' : 'bg-steel-850'} rounded-lg 
          border border-steel-750
          ${className}
        `}
        type="button"
        onClick={toggleDropdown}
      >
        <span className="truncate mr-2">{selectedOption}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          className={`absolute left-0 z-10 mt-1 w-full rounded-lg ${transparent ? 'bg-transparent' : 'bg-steel-850'} shadow-lg border border-steel-750`}
        >
          {options.map(option => (
            <button
              key={option.value}
              className="
                block w-full px-4 py-2 text-left hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg
              "
              type="button"
              onClick={() => handleOptionClick(option.value)}
              title={option.label}
            >
              <span className="block truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
