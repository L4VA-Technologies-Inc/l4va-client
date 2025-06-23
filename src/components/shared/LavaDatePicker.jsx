import { useState, useEffect } from 'react';
import { CalendarIcon, HelpCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatDateTime } from '@/utils/core.utils';

const variants = {
  default: {
    button:
      'rounded-[10px] bg-input-bg py-4 pl-5 pr-5 font-medium w-full border border-steel-850 h-[60px] focus:outline-none focus:ring-[1px] focus:ring-white focus:border-white transition-all duration-200',
    popover: 'bg-input-bg border border-steel-850',
    calendar: 'bg-input-bg rounded-[10px]',
    scrollArea: 'bg-input-bg',
  },
  steel: {
    button: 'bg-steel-850 rounded-lg border border-steel-750 w-full h-[40px] py-4 px-5',
    popover: 'bg-steel-850 rounded-lg border border-steel-750',
    calendar: 'bg-steel-850 rounded-[10px]',
    scrollArea: 'bg-steel-850',
  },
};

export const LavaDatePicker = ({
  label,
  required = false,
  value,
  minDate,
  className,
  variant = 'default',
  onChange = () => {},
  hint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateValue, setDateValue] = useState(null);

  useEffect(() => {
    if (value) {
      const date = typeof value === 'number' ? new Date(value) : value;
      setDateValue(date);
    } else {
      setDateValue(null);
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDateSelect = selectedDate => {
    if (selectedDate) {
      if (dateValue) {
        selectedDate.setHours(dateValue.getHours());
        selectedDate.setMinutes(dateValue.getMinutes());
      }
      onChange(selectedDate.getTime());
    }
  };

  const handleTimeChange = (type, val) => {
    if (dateValue) {
      const newDate = new Date(dateValue);
      if (type === 'hour') {
        newDate.setHours((Number.parseInt(val, 10) % 12) + (newDate.getHours() >= 12 ? 12 : 0));
      } else if (type === 'minute') {
        newDate.setMinutes(Number.parseInt(val, 10));
      } else if (type === 'ampm') {
        const currentHours = newDate.getHours();
        const newHours = val === 'PM' ? (currentHours % 12) + 12 : currentHours % 12;
        newDate.setHours(newHours);
      }
      onChange(newDate.getTime());
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
                className={cn(styles.button, 'justify-start text-left', !dateValue && 'text-white/60', className)}
                variant="outline"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? (
                  <span className={variant === 'steel' ? 'text-base' : ''}>{formatDateTime(dateValue)}</span>
                ) : (
                  <span className={cn(variant === 'steel' ? 'text-base' : '')}>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn('w-auto p-0', styles.popover)}>
              <div className="sm:flex">
                <Calendar
                  initialFocus
                  className={styles.calendar}
                  disabled={date => {
                    const minimumDate = minDate || new Date(new Date().setHours(0, 0, 0, 0));
                    return date < minimumDate;
                  }}
                  mode="single"
                  selected={dateValue}
                  onSelect={handleDateSelect}
                />
                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                  <ScrollArea className={cn('w-64 sm:w-auto', styles.scrollArea)}>
                    <div className="flex sm:flex-col p-2">
                      {hours.reverse().map(hour => (
                        <Button
                          key={hour}
                          className="sm:w-full shrink-0 aspect-square"
                          size="icon"
                          variant={dateValue && dateValue.getHours() % 12 === hour % 12 ? 'default' : 'ghost'}
                          onClick={() => handleTimeChange('hour', hour.toString())}
                        >
                          {hour}
                        </Button>
                      ))}
                    </div>
                    <ScrollBar className="sm:hidden" orientation="horizontal" />
                  </ScrollArea>
                  <ScrollArea className={cn('w-64 sm:w-auto', styles.scrollArea)}>
                    <div className="flex sm:flex-col p-2">
                      {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                        <Button
                          key={minute}
                          className="sm:w-full shrink-0 aspect-square"
                          size="icon"
                          variant={dateValue && dateValue.getMinutes() === minute ? 'default' : 'ghost'}
                          onClick={() => handleTimeChange('minute', minute.toString())}
                        >
                          {minute}
                        </Button>
                      ))}
                    </div>
                    <ScrollBar className="sm:hidden" orientation="horizontal" />
                  </ScrollArea>
                  <ScrollArea className={cn(styles.scrollArea, 'rounded-[10px]')}>
                    <div className="flex sm:flex-col p-2">
                      {['AM', 'PM'].map(ampm => (
                        <Button
                          key={ampm}
                          className="sm:w-full shrink-0 aspect-square"
                          size="icon"
                          variant={
                            dateValue &&
                            ((ampm === 'AM' && dateValue.getHours() < 12) ||
                              (ampm === 'PM' && dateValue.getHours() >= 12))
                              ? 'default'
                              : 'ghost'
                          }
                          onClick={() => handleTimeChange('ampm', ampm)}
                        >
                          {ampm}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};
