import { HelpCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';

export const LavaRadio = ({ name, value, label, options, onChange, error, hint }) => (
  <div className="space-y-2">
    {label ? (
      <Label className="font-bold flex items-center gap-2">
        <span className="uppercase">{label}</span>
        {hint && (
          <HoverHelp hint={hint} />
        )}
      </Label>
    ) : null}
    <div className="space-y-2 mt-4">
      {options.map(option => (
        <label key={option.name} className="flex items-center space-x-2 cursor-pointer">
          <div className="relative">
            <input
              checked={value === option.name}
              className="peer sr-only"
              id={`${name}-${option.name}`}
              name={name}
              type="radio"
              value={option.name}
              onChange={() => onChange(option.name)}
            />
            <div
              className={`w-5 h-5 rounded-full border-2 ${error ? 'border-red-600' : 'border-white/20'} peer-checked:border-[var(--color-orange-500)]`}
            />
            <div
              className="w-2.5 h-2.5 m-[5px] absolute inset-0 rounded-full scale-0 peer-checked:scale-100 transition-transform"
              style={{
                background: 'linear-gradient(to bottom, var(--color-orange-500), #FFD012)',
              }}
            />
          </div>
          <span>{option.label}</span>
        </label>
      ))}
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-1">{typeof error === 'string' ? error : 'This field is required'}</p>
    )}
  </div>
);
