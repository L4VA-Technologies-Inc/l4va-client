import { HelpCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { useRef, useState } from 'react';

export const LavaRadio = ({ name, value, label, options, onChange, error, hint }) => {
  const [showHint, setShowHint] = useState(false);
  const tooltipRef = useRef(null);

  const handleFocus = () => setShowHint(true);
  const handleBlur = () => setShowHint(false);

  const handleTouchStart = () => {
    setShowHint(true);
  };

  const handleTouchEnd = () => {
    setShowHint(false);
  };

  return (
    <div className="space-y-2">
      {label ? (
        <Label className="font-bold flex items-center gap-2">
          <span className="uppercase">{label}</span>
          {hint && (
            <div
              className="group relative inline-flex"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <HelpCircle
                className="w-5 h-5 text-white/60 cursor-help focus:outline-none"
                onFocus={handleFocus}
                onBlur={handleBlur}
                tabIndex={0}
              />
              <div
                ref={tooltipRef}
                className={`
                  absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:max-w-[360px] sm:min-w-[200px] w-max z-10
                  whitespace-pre-wrap break-words text-left pointer-events-none
                  ${showHint ? 'opacity-100' : ''}
                  max-w-[250px] min-w-[100px]
                `}
              >
                {hint}
              </div>
            </div>
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
};
