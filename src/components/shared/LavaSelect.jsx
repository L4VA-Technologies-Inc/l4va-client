import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
}) => (
  <div className="w-full">
    {label && (
      <div className="text-dark-100 text-[20px] font-medium mb-2">
        {required && '*'}{label}
      </div>
    )}
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={
          `
            bg-input-bg py-4 pl-5 pr-5 text-[20px] font-medium border border-steel-850 h-[60px] 
            focus:ring-0 focus:ring-offset-0 mt-4
            ${className}
          `
        }
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-input-bg border border-steel-850">
        {options.map((option) => (
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
    {error && (
      <p className="text-red-600 mt-1">{error}</p>
    )}
  </div>
);

export const LavaSteelSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (optionValue) => {
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
          flex items-center justify-between w-full px-4 py-2 bg-steel-850 rounded-lg 
          border border-steel-750
          ${className}
        `}
        type="button"
        onClick={toggleDropdown}
      >
        <span>{selectedOption}</span>
        <ChevronDown className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-10 mt-1 w-full rounded-lg bg-steel-850 shadow-lg border border-steel-750">
          {options.map((option) => (
            <button
              key={option.value}
              className="
                block w-full px-4 py-2 text-left hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg
              "
              type="button"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
