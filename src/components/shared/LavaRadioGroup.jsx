import { Label } from '@/components/ui/label';

export const LavaRadioGroup = ({
  name,
  value,
  label,
  options,
  onChange,
  error,
}) => (
  <div className="space-y-2">
    {label ? (
      <Label className="uppercase text-[20px] font-bold">
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
              id={`${name}-${option.id}`}
              name={name}
              type="radio"
              value={option.id}
              onChange={() => onChange(option.id)}
            />
            <div className={`w-5 h-5 rounded-full border-2 ${error ? 'border-main-red' : 'border-white/20'} peer-checked:border-[#FF842C]`} />
            <div
              className="w-2.5 h-2.5 m-[5px] absolute inset-0 rounded-full scale-0 peer-checked:scale-100 transition-transform"
              style={{
                background: 'linear-gradient(to bottom, #FF842C, #FFD012)',
              }}
            />
          </div>
          <span>{option.label}</span>
        </label>
      ))}
    </div>
    {error && (
      <p className="text-main-red text-sm mt-1">{typeof error === 'string' ? error : 'This field is required'}</p>
    )}
  </div>
);
