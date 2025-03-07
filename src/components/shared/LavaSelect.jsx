import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const LavaSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
}) => (
  <div className="w-full">
    {label && (
      <div className="text-dark-100 text-[20px] font-medium mb-2">
        {required && '*'}{label}
      </div>
    )}
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="bg-input-bg py-4 pl-5 pr-5 text-[20px] font-medium border border-dark-600 h-[60px] focus:ring-0 focus:ring-offset-0"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-input-bg border border-dark-600">
        {options.map((option) => (
          <SelectItem
            key={option.id || option.value}
            className="text-dark-100 hover:text-white hover:bg-dark-700 cursor-pointer py-3"
            value={option.id || option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && (
      <p className="text-main-red mt-1">{error}</p>
    )}
  </div>
);
