import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/useCurrency';

export const CurrencyDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, updateCurrency } = useCurrency();

  const options = [
    { value: 'ada', label: 'ADA' },
    { value: 'usdt', label: 'USD' },
  ];

  const selectedOption = options.find(option => option.value === currency) || options[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={clsx(
            'w-[125px] rounded-t-lg px-6 py-4 border-2  text-[20px]',
            isOpen && 'border-transparent bg-steel-950',
            !isOpen && 'border-white/15 bg-transparent/5 backdrop-blur-sm rounded-b-lg'
          )}
          type="button"
        >
          <div className="flex items-center justify-between">
            <span>{selectedOption.label}</span>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[125px] p-0 bg-steel-950 backdrop-blur-sm border-0" style={{ marginTop: '0' }}>
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            className="px-6 py-4 cursor-pointer hover:bg-slate-950 focus:bg-slate-950"
            onClick={() => {
              updateCurrency(option.value);
              setIsOpen(false);
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[20px]">{option.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
