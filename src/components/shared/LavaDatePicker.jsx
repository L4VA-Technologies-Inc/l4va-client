import { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { formatISO } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const LavaDatePicker = ({ value, onChange = () => { }, minDate }) => {
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

  const handleDateSelect = (selectedDate) => {
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
        newDate.setHours(
          (Number.parseInt(val, 10) % 12) + (newDate.getHours() >= 12 ? 12 : 0),
        );
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

  const formatDateTime = (dt) => {
    if (!dt) return null;

    const date = dt.toLocaleDateString();
    const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timezoneOffset = formatISO(dt).slice(19, 25);
    const timezoneString = `GMT${timezoneOffset.slice(0, 3)}`;

    return `${date} ${time} (${timezoneString})`;
  };

  return (
    <div className="flex items-center gap-4 relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'text-[20px] border border-dark-600 w-full h-[60px] bg-input-bg py-5 justify-start text-left font-normal',
              !dateValue && 'text-muted-foreground',
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? formatDateTime(dateValue) : (
              <span className="text-white/60">Select date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-input-bg border border-dark-600">
          <div className="sm:flex">
            <Calendar
              initialFocus
              className="bg-input-bg rounded-[10px]"
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const minimumDate = minDate || new Date(new Date().setHours(0, 0, 0, 0));
                return date < minimumDate;
              }}
            />
            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
              <ScrollArea className="w-64 sm:w-auto bg-input-bg">
                <div className="flex sm:flex-col p-2">
                  {hours.reverse().map((hour) => (
                    <Button
                      key={hour}
                      className="sm:w-full shrink-0 aspect-square"
                      size="icon"
                      variant={
                        dateValue && dateValue.getHours() % 12 === hour % 12
                          ? 'default'
                          : 'ghost'
                      }
                      onClick={() => handleTimeChange('hour', hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar className="sm:hidden" orientation="horizontal" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto bg-input-bg">
                <div className="flex sm:flex-col p-2">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      className="sm:w-full shrink-0 aspect-square"
                      size="icon"
                      variant={
                        dateValue && dateValue.getMinutes() === minute
                          ? 'default'
                          : 'ghost'
                      }
                      onClick={() =>
                        handleTimeChange('minute', minute.toString())}
                    >
                      {minute}
                    </Button>
                  ))}
                </div>
                <ScrollBar className="sm:hidden" orientation="horizontal" />
              </ScrollArea>
              <ScrollArea className="bg-input-bg rounded-[10px]">
                <div className="flex sm:flex-col p-2">
                  {['AM', 'PM'].map((ampm) => (
                    <Button
                      key={ampm}
                      className="sm:w-full shrink-0 aspect-square"
                      size="icon"
                      variant={
                        dateValue
                          && ((ampm === 'AM' && dateValue.getHours() < 12)
                            || (ampm === 'PM' && dateValue.getHours() >= 12))
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
  );
};
