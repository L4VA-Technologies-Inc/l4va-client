import { Circle, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const LavaRadioGroup = ({
  name,
  label,
  options,
  value,
  onChange,
}) => (
  <div className="space-y-2">
    {label ? <Label className="text-lg font-semibold">{label}</Label> : null}
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
          <input
            checked={value === option.id}
            className="sr-only"
            id={option.id}
            name={name}
            type="radio"
            value={option.id}
            onChange={(e) => onChange(e.target.value)}
          />
          {value === option.id ? (
            <CheckCircle className="w-6 h-6 text-primary" />
          ) : (
            <Circle className="w-6 h-6 text-dark-100" />
          )}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);
