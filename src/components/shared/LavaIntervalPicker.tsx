import { useState, useEffect } from 'react';
import { ClockIcon } from 'lucide-react';

import { HoverHelp } from './HoverHelp';

import { cn } from '@/lib/utils';
import { msToInterval, intervalToMs, formatInterval } from '@/utils/core.utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const variants = {
  default: {
    button:
      'rounded-[10px] bg-input-bg py-4 pl-5 pr-5 font-medium w-full border border-steel-850 h-[60px] focus:outline-none focus:ring-[1px] focus:ring-white focus:border-white transition-all duration-200',
    popover: 'bg-input-bg border border-steel-850',
    scrollArea: 'bg-input-bg',
  },
  steel: {
    button: 'bg-steel-850 rounded-lg border border-steel-750 w-full h-[40px] py-4 px-5',
    popover: 'bg-steel-850 rounded-lg border border-steel-750',
    scrollArea: 'bg-steel-850',
  },
};

type LavaIntervalPickerProps = {
  label?: string;
  required?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  hint?: string;
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'steel';
  minDays?: number;
  minMs?: number;
};

export const LavaIntervalPicker = ({
  label,
  hint,
  className,
  value = 0,
  minDays = 0,
  minMs = 0,
  placeholder = 'Select interval',
  variant = 'default',
  required = false,
  onChange = () => {},
}: LavaIntervalPickerProps) => {
  const [interval, setIntervalValue] = useState(msToInterval(value));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIntervalValue(msToInterval(value));
  }, [value]);

  const minInterval = minMs > 0 ? msToInterval(minMs) : { days: minDays, hours: 0, minutes: 0 };

  const days = Array.from({ length: 31 - minInterval.days }, (_, i) => i + minInterval.days);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const isValidSelection = (newInterval: { days: number; hours: number; minutes: number }) => {
    const totalMs = intervalToMs(newInterval);
    const minTotalMs = minMs > 0 ? minMs : intervalToMs(minInterval);
    return totalMs >= minTotalMs;
  };

  const handleIntervalChange = (type: keyof typeof interval, val: string) => {
    const newInterval = {
      ...interval,
      [type]: Number.parseInt(val, 10),
    };
    if (isValidSelection(newInterval)) {
      setIntervalValue(newInterval);
      onChange(intervalToMs(newInterval));
    }
  };

  const styles = variants[variant];

  return (
    <>
      {label ? (
        <div className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required ? '*' : ''}
            {label}
          </span>
          {hint && <HoverHelp hint={hint} />}
        </div>
      ) : null}
      <div className="mt-4">
        <div className="relative flex items-center">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                className={cn(styles.button, 'justify-start text-left', !value && 'text-white/60', className)}
                variant="outline"
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {value ? (
                  <span className={variant === 'steel' ? 'text-base' : ''}>{formatInterval(value)}</span>
                ) : (
                  <span className={cn(variant === 'steel' ? 'text-base' : '')}>{placeholder}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn('w-auto p-0', styles.popover)}>
              <div className="flex">
                <ScrollArea className={cn('sm:w-auto ', styles.scrollArea)}>
                  <div className="p-4">
                    <div className="text-sm font-medium mb-2 text-center">Days</div>
                    <div className="grid gap-1 max-h-64 overflow-y-auto w-fit pr-1">
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
                  <ScrollBar className="sm:hidden" orientation="horizontal" />
                </ScrollArea>
                <ScrollArea className={cn(' sm:w-auto ', styles.scrollArea)}>
                  <div className="p-4 border-l border-steel-850">
                    <div className="text-sm font-medium mb-2 text-center">Hours</div>
                    <div className="grid gap-1 max-h-64 overflow-y-auto w-fit pr-1">
                      {hours.map(hour => {
                        const testInterval = { ...interval, hours: hour };
                        const isDisabled = !isValidSelection(testInterval);
                        return (
                          <Button
                            key={hour}
                            className="w-12 h-12"
                            size="icon"
                            variant={interval.hours === hour ? 'default' : 'ghost'}
                            disabled={isDisabled}
                            onClick={() => handleIntervalChange('hours', hour.toString())}
                          >
                            {hour}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <ScrollBar className="sm:hidden" orientation="horizontal" />
                </ScrollArea>
                <ScrollArea className={cn('sm:w-auto', styles.scrollArea)}>
                  <div className="p-4 border-l border-steel-850">
                    <div className="text-sm font-medium mb-2 text-center">Minutes</div>
                    <div className="grid gap-1 max-h-64 w-fit overflow-y-auto pr-1">
                      {minutes.map(minute => {
                        const testInterval = { ...interval, minutes: minute };
                        const isDisabled = !isValidSelection(testInterval);
                        return (
                          <Button
                            key={minute}
                            className="w-12 h-12"
                            size="icon"
                            variant={interval.minutes === minute ? 'default' : 'ghost'}
                            disabled={isDisabled}
                            onClick={() => handleIntervalChange('minutes', minute.toString())}
                          >
                            {minute}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <ScrollBar className="sm:hidden" orientation="horizontal" />
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};
