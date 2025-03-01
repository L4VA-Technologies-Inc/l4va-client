import { Label } from '@/components/ui/label';

export const LavaRadioGroup = ({
  field,
  form: { setFieldValue },
  label,
  options,
}) => {
  const handleChange = (optionValue) => {
    setFieldValue(field.name, optionValue);
  };

  const hasError = false;

  return (
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
                checked={field.value === option.id}
                className="peer sr-only"
                id={`${field.name}-${option.id}`}
                name={field.name}
                type="radio"
                value={option.id}
                onBlur={field.onBlur}
                onChange={() => handleChange(option.id)}
              />
              <div className={`w-5 h-5 rounded-full border-2 ${hasError ? 'border-red-500' : 'border-white/20'} peer-checked:border-[#FF842C]`} />
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
    </div>
  );
};
