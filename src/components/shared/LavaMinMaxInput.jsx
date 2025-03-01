import { Input } from '@/components/ui/input';

export const LavaMinMaxInput = ({
  label = 'Collection ABC',
  minValue = 1,
  maxValue = 5,
  onChange = () => {},
}) => {
  const handleMinChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onChange({ min: value, max: maxValue });
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onChange({ min: minValue, max: value });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="text-dark-100 text-[20px] font-medium">
          {label}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              className="bg-input-bg py-4 px-5 text-[20px] font-medium w-[150px] focus:outline-none border border-dark-600 h-[60px]"
              style={{ fontSize: '20px' }}
              type="number"
              value={minValue}
              onChange={handleMinChange}
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-dark-100">
              Min
            </div>
          </div>
          <div className="relative">
            <Input
              className="bg-input-bg py-4 px-5 text-[20px] font-medium w-[150px] focus:outline-none border border-dark-600 h-[60px]"
              style={{ fontSize: '20px' }}
              type="number"
              value={maxValue}
              onChange={handleMaxChange}
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-dark-100">
              Max
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
