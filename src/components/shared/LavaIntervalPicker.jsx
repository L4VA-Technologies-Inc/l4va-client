import { useState, useEffect } from 'react';
import { ClockIcon, HelpCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { msToInterval, intervalToMs, formatInterval } from '@/utils/core.utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const LavaIntervalPicker = ({ label, required = false, value = 0, onChange = () => {}, hint, className }) => {
  const [interval, setIntervalValue] = useState(msToInterval(value));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIntervalValue(msToInterval(value));
  }, [value]);

  const days = Array.from({ length: 31 }, (_, i) => i);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleIntervalChange = (type, val) => {
    const newInterval = {
      ...interval,
      [type]: Number.parseInt(val, 10),
    };
    setIntervalValue(newInterval);
    onChange(intervalToMs(newInterval));
  };

  return (
    <>
      {label ? (
        <div className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required ? '*' : ''}
            {label}
          </span>
          {hint && (
            <div className="group relative inline-flex">
              <HelpCircle className="w-5 h-5 text-white/60 cursor-help" />
              <div
                className="
                  absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-[360px] min-w-[200px] w-max z-10 
                  whitespace-pre-wrap break-words text-left pointer-events-none
                "
              >
                {hint}
              </div>
            </div>
          )}
        </div>
      ) : null}
      <div className="mt-4">
        <div className="relative flex items-center">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  'rounded-[10px] bg-input-bg py-4 pl-5 pr-5 font-medium w-full border border-steel-850 h-[60px] justify-start text-left focus:outline-none focus:ring-[1px] focus:ring-white focus:border-white transition-all duration-200',
                  !value && 'text-white/60',
                  className
                )}
                variant="outline"
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {value ? formatInterval(value) : <span>Select interval</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-input-bg border border-steel-850">
              <div className="flex">
                <div className="p-4 bg-input-bg">
                  <div className="text-sm font-medium mb-2 text-center">Days</div>
                  <div className="grid gap-1 max-h-64 overflow-y-auto pr-1">
                    {days.map(day => (
                      <Button
                        key={day}
                        className="w-12 h-12"
                        size="icon"
                        variant={interval.days === day ? 'default' : 'ghost'}
                        onClick={() => handleIntervalChange('days', day.toString())}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-input-bg border-l border-steel-850">
                  <div className="text-sm font-medium mb-2 text-center">Hours</div>
                  <div className="grid gap-1 max-h-64 overflow-y-auto pr-1">
                    {hours.map(hour => (
                      <Button
                        key={hour}
                        className="w-12 h-12"
                        size="icon"
                        variant={interval.hours === hour ? 'default' : 'ghost'}
                        onClick={() => handleIntervalChange('hours', hour.toString())}
                      >
                        {hour}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-input-bg border-l border-steel-850">
                  <div className="text-sm font-medium mb-2 text-center">Minutes</div>
                  <div className="grid gap-1 max-h-64 overflow-y-auto pr-1">
                    {minutes.map(minute => (
                      <Button
                        key={minute}
                        className="w-12 h-12"
                        size="icon"
                        variant={interval.minutes === minute ? 'default' : 'ghost'}
                        onClick={() => handleIntervalChange('minutes', minute.toString())}
                      >
                        {minute}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};
