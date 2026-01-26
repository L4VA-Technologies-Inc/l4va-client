import { Trash } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { HoverHelp } from '@/components/shared/HoverHelp.jsx';

const presetHelpfulHint = {
  simple:
    'Simple vault where Contributors send assets and keep all pro-rata Vault Tokens based on value of assets contributed (floor price for NFTs / spot price for CNTs at end of Contribution window).\n',
  contributors:
    'Contributors send assets and ADA for LP contribution, then keep all pro-rata Vault Tokens based on value of assets contributed (floor price for NFTs / spot price for CNTs at end of Contribution window) MINUS Vault Token LP contribution.',
  acquirers:
    'Simple vault where Contributors send assets to receive ONLY pro-rata of ADA MINUS the LP ADA contribution. Acquirers send ADA to receive pro-rata Vault Tokens MINUS vault token LP contribution.',
  acquirers_50:
    'Simple vault where Contributors send assets to receive 50% pro-rata of Vault Token MINUS LP contribution AND pro-rata of ADA sent by acquirers MINUS ADA LP contribution. Acquirers send ADA to receive 50% of pro-rata vault token MINUS Vault Token LP contribution.',
  advanced: 'Customizable vault based on user settings for all fields.',
};

export const LavaRadio = ({
  name,
  value,
  label,
  options,
  onChange,
  error,
  hint,
  onDeleteOption,
  isOptionDeletable,
  deletingOptionId,
}) => {
  const firstOptionId = options.length > 0 ? `${name}-${options[0].name}` : undefined;

  return (
    <div className="space-y-2">
      {label ? (
        <Label htmlFor={firstOptionId} className="font-bold flex items-center gap-2">
          <span className="uppercase">{label}</span>
          {hint && <HoverHelp hint={hint} />}
        </Label>
      ) : null}
      <div className="space-y-2 mt-4" role="radiogroup" aria-labelledby={label ? `${name}-label` : undefined}>
        {label && (
          <span id={`${name}-label`} className="sr-only">
            {label}
          </span>
        )}
        {options.map(option => {
          const deletable = isOptionDeletable ? isOptionDeletable(option) : false;
          const isDeleting = deletingOptionId && deletingOptionId === option.name;

          return (
            <label key={option.name} className="flex items-center space-x-2 justify-between">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <input
                    checked={value === option.name}
                    className="peer sr-only"
                    id={`${name}-${option.name}`}
                    name={name}
                    type="radio"
                    value={option.name}
                    onChange={() => onChange(option.name)}
                    aria-labelledby={label ? `${name}-label` : undefined}
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
              </div>
              {name === 'preset' && option.type !== 'custom' && <HoverHelp hint={presetHelpfulHint[option.type]} />}
              {deletable && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteOption?.(option);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </label>
          );
        })}
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1">{typeof error === 'string' ? error : 'This field is required'}</p>
      )}
    </div>
  );
};
