import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, formatISO } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const LavaDatePicker = ({ value, onChange = () => {}, minDate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      if (value) {
        selectedDate.setHours(value.getHours());
        selectedDate.setMinutes(value.getMinutes());
      }
      onChange(selectedDate);
    }
  };

  const handleTimeChange = (type, val) => {
    if (value) {
      const newDate = new Date(value);
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
      onChange(newDate);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return null;

    const formattedDate = format(dt, 'dd.MM.yyyy HH:mm');

    const timezoneOffset = formatISO(dt).slice(19, 25);
    const timezoneString = `GMT${timezoneOffset.slice(0, 3)}`;

    return `${formattedDate} (${timezoneString})`;
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
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDateTime(value) : (
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
              selected={value}
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
                        value && value.getHours() % 12 === hour % 12
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
                        value && value.getMinutes() === minute
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
                        value
                          && ((ampm === 'AM' && value.getHours() < 12)
                            || (ampm === 'PM' && value.getHours() >= 12))
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
