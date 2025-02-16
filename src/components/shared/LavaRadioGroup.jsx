import { Label } from '@/components/ui/label';

export const LavaRadioGroup = ({
  name,
  label,
  options,
  value,
  onBlur = () => {},
  onChange,
}) => (
  <div className="space-y-2">
    {label ? (
      <Label className="text-lg font-semibold">
        {label}
      </Label>
    ) : null}
    <div className="space-y-2 mt-4">
      {options.map((option) => (
        <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
          <div className="relative">
            <input
              checked={value === option.id}
              className="peer sr-only"
              id={option.id}
              name={name}
              type="radio"
              value={option.id}
              onBlur={onBlur}
              onChange={(e) => onChange(e.target.value)}
            />
            <div className="w-6 h-5 rounded-full border-2 border-dark-100 peer-checked:border-main-red" />
            <div className="w-3 h-2 m-1.5 absolute inset-0 rounded-[10px] bg-main-red scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);
