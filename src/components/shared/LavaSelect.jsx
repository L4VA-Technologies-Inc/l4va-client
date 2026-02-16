import { useState, useRef, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClickOutside } from '@/hooks/useClickOutside';
import { LavaSearchInput } from '@/components/shared/LavaInput';

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
    const option = options.find(opt => opt.value === optionValue);
    if (option?.disabled) {
      return;
    }
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
          <div className="overflow-y-auto max-h-60">
            {options.map(option => (
              <button
                key={option.value}
                className={`
                  block w-full px-4 py-2 text-left first:rounded-t-lg last:rounded-b-lg
                  ${option.disabled ? 'opacity-50 cursor-not-allowed text-white/40' : 'hover:bg-white/5 cursor-pointer'}
                `}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                disabled={option.disabled}
                title={option.label}
              >
                <span className="block truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const LavaMultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options',
  className,
  searchPlaceholder = 'Search...',
  showSearch = true,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleOptionClick = optionValue => {
    const newValue = value.includes(optionValue) ? value.filter(v => v !== optionValue) : [...value, optionValue];

    if (onChange) {
      onChange(newValue);
    }
  };

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setSearchQuery('');
  });

  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className={`
          flex items-center justify-center gap-2 bg-steel-850 hover:bg-steel-850/70 text-white/60 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto border border-steel-750
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        type="button"
        onClick={toggleDropdown}
        disabled={isDisabled}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1 mr-2">
          {selectedOptions.length > 0 ? (
            <span className={selectedOptions.length === 0 ? 'text-white/60' : ''}>
              {selectedOptions.length} Selected
            </span>
          ) : (
            <span className={selectedOptions.length === 0 ? 'text-white/60' : ''}>{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 z-10 mt-1 w-full rounded-lg bg-steel-850 shadow-lg border border-steel-750 max-h-80 overflow-hidden flex flex-col`}
        >
          {showSearch && (
            <div className="p-2 border-b border-steel-750" onClick={e => e.stopPropagation()}>
              <LavaSearchInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={setSearchQuery}
                className="!h-9 bg-steel-850 !border-steel-750"
                debounceTime={300}
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-white/60">No assets found</div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    className="w-full px-4 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors"
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                  >
                    <div
                      className={`w-5 h-5 flex items-center justify-center border ${isSelected ? 'border-white bg-white' : 'border-steel-750 bg-steel-850'} rounded`}
                    >
                      {isSelected && <Check size={16} strokeWidth={3} className="text-steel-900" />}
                    </div>
                    <span className="flex-1 truncate" title={option.label}>
                      {option.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
