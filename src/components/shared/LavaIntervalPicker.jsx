import { useState, useEffect } from 'react';
import { ClockIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { msToInterval, intervalToMs } from '@/utils/core.utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const LavaIntervalPicker = ({ value = 0, onChange = () => { } }) => {
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

  const formatInterval = () => {
    const { days: d, hours: h, minutes: m } = interval;
    const parts = [];

    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);

    return parts.length > 0 ? parts.join(' ') : '0m';
  };

  return (
    <div className="flex items-center gap-4 relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'text-[20px] border border-dark-600 w-full h-[60px] bg-input-bg py-5 justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            variant="outline"
          >
            <ClockIcon className="mr-2 h-4 w-4" />
            {value ? (
              formatInterval()
            ) : (
              <span className="text-white/60">Select interval</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-input-bg border border-dark-600">
          <div className="flex">
            <div className="p-4 bg-input-bg">
              <div className="text-sm font-medium mb-2 text-center">Days</div>
              <div className="grid gap-1 max-h-64 overflow-y-auto pr-1">
                {days.map((day) => (
                  <Button
                    key={day}
                    className="w-12 h-12"
                    size="icon"
                    variant={
                      interval.days === day ? 'default' : 'ghost'
                    }
                    onClick={() => handleIntervalChange('days', day.toString())}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-input-bg border-l border-dark-600">
              <div className="text-sm font-medium mb-2 text-center">Hours</div>
              <div className="grid gap-1 max-h-64 overflow-y-auto pr-1">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    className="w-12 h-12"
                    size="icon"
                    variant={
                      interval.hours === hour ? 'default' : 'ghost'
                    }
                    onClick={() => handleIntervalChange('hours', hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-input-bg border-l border-dark-600">
              <div className="text-sm font-medium mb-2 text-center">Minutes</div>
              <div className="grid gap-1 max-h-64 overflow-y-auto pr-1">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    className="w-12 h-12"
                    size="icon"
                    variant={
                      interval.minutes === minute ? 'default' : 'ghost'
                    }
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
  );
};
