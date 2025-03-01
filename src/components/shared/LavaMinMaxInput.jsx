import { Input } from '@/components/ui/input';

export const LavaMinMaxInput = ({
  label = 'Collection ABC',
  minValue = 1,
  maxValue = 5,
  onMinChange,
  onMaxChange,
}) => {
  const handleMinChange = (e) => {
    if (e.target.value === '') {
      onMinChange('');
      return;
    }

    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onMinChange(value);
    }
  };

  const handleMaxChange = (e) => {
    if (e.target.value === '') {
      onMaxChange('');
      return;
    }

    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onMaxChange(value);
    }
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
              className="bg-input-bg py-4 pl-5 pr-12 text-[20px] font-medium w-[150px] focus:outline-none border border-dark-600 h-[60px]"
              style={{ fontSize: '20px' }}
              type="number"
              value={minValue === undefined || minValue === null ? '' : minValue}
              onChange={handleMinChange}
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-dark-100">
              Min
            </div>
          </div>
          <div className="relative">
            <Input
              className="bg-input-bg py-4 pl-5 pr-12 text-[20px] font-medium w-[150px] focus:outline-none border border-dark-600 h-[60px]"
              style={{ fontSize: '20px' }}
              type="number"
              value={maxValue === undefined || maxValue === null ? '' : maxValue}
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
