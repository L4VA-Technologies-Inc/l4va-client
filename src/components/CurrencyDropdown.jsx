import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export const CurrencyDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('ADA');

  const options = [
    { value: 'USD', icon: '/assets/icons/flag.svg', label: 'USD' },
    { value: 'ADA', icon: '/assets/icons/ada.svg', label: 'ADA' },
  ];

  return (
    <div className="w-[125px] text-primary-text text-[20px]">
      <button
        className={clsx(
          'w-full rounded-t-lg px-6 py-4 border-2',
          isOpen && 'border-transparent bg-dark-600',
          !isOpen && 'border-white/15 bg-transparent rounded-b-lg',
        )}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span>
            {options.find(option => option.value === selected).label}
          </span>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>
      {isOpen && (
        <div
          className={clsx(
            'absolute w-[125px] backdrop-blur-sm',
            isOpen && 'bg-dark-600',
          )}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className="px-6 py-4 cursor-pointer hover:bg-dark-700"
              onClick={() => {
                setSelected(option.value);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <img alt={option.value} className="h-6 w-6" src={option.icon} />
                <span>
                  {option.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
