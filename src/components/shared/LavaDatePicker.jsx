import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { getTimeDifference } from '@/utils/core.utils';

export const LavaDatePicker = () => {
  const [date, setDate] = useState();
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (type, value) => {
    if (date) {
      const newDate = new Date(date);
      if (type === 'hour') {
        newDate.setHours(
          (Number.parseInt(value, 10) % 12) + (newDate.getHours() >= 12 ? 12 : 0),
        );
      } else if (type === 'minute') {
        newDate.setMinutes(Number.parseInt(value, 10));
      } else if (type === 'ampm') {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === 'PM' ? currentHours + 12 : currentHours - 12,
        );
      }
      setDate(newDate);
    }
  };

  const formatCurrentTime = (dt) => {
    const h = dt.getHours().toString().padStart(2, '0');
    const m = dt.getMinutes().toString().padStart(2, '0');

    const timezoneOffset = -dt.getTimezoneOffset() / 60;
    const timezoneString = `GMT${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

    return `${h}:${m} (${timezoneString})`;
  };

  const formatDate = (dt) => {
    const day = dt.getDate().toString().padStart(2, '0');
    const month = (dt.getMonth() + 1).toString().padStart(2, '0');
    const year = dt.getFullYear();

    return `${day}.${month}.${year}`;
  };

  return (
    <div className="flex items-center gap-4 relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'text-[20px] border border-dark-600 w-full h-[60px] bg-input-bg py-5 justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              getTimeDifference(date)
            ) : (
              <span className="text-white/60">DD:HH:MM</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-input-bg border border-dark-600">
          <div className="sm:flex">
            <Calendar
              initialFocus
              className="bg-input-bg rounded-[10px]"
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
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
                        date && date.getHours() % 12 === hour % 12
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
                        date && date.getMinutes() === minute
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
                        date
                        && ((ampm === 'AM' && date.getHours() < 12)
                          || (ampm === 'PM' && date.getHours() >= 12))
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
      {date ? (
        <div className="flex-shrink-0 flex flex-col text-right absolute right-2 top-0 bottom-0 justify-center">
          <div className="text-sm text-dark-100">
            {formatCurrentTime(date)}
          </div>
          <div className="text-sm">
            {formatDate(date)}
          </div>
        </div>
      ) : null}
    </div>
  );
};
