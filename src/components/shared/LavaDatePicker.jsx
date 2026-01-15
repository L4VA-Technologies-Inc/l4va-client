import { useEffect, useId, useState } from 'react';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { addHours, getHours, getMinutes, isToday as isTodayFn, setHours, setMinutes, startOfToday } from 'date-fns';

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
  error = false,
  id,
  name,
}) => {
  const generatedId = useId();
  const datePickerId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (value) {
      setDateValue(typeof value === 'number' ? new Date(value) : value);
    } else {
      setDateValue(null);
    }
  }, [value]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const isToday = dateValue && isTodayFn(dateValue);
  const currentHour = getHours(now);
  const currentMinute = getMinutes(now);

  const getValidTime = date => {
    if (!isTodayFn(date)) return date;
    const nowLocal = new Date();
    const dateMs = date.getTime();
    const nowMs = nowLocal.getTime();

    if (dateMs < nowMs) {
      const roundedMinutes = Math.ceil(getMinutes(nowLocal) / 5) * 5;
      return roundedMinutes === 60 ? addHours(setMinutes(nowLocal, 0), 1) : setMinutes(nowLocal, roundedMinutes);
    }
    return date;
  };

  const handleDateSelect = selectedDate => {
    if (selectedDate) {
      let newDate = selectedDate;
      if (dateValue) {
        newDate = setHours(newDate, getHours(dateValue));
        newDate = setMinutes(newDate, getMinutes(dateValue));
      } else {
        const nowLocal = new Date();
        const roundedMinutes = Math.ceil(getMinutes(nowLocal) / 5) * 5;
        const roundedNow =
          roundedMinutes === 60 ? addHours(setMinutes(nowLocal, 0), 1) : setMinutes(nowLocal, roundedMinutes);
        newDate = setHours(newDate, getHours(roundedNow));
        newDate = setMinutes(newDate, getMinutes(roundedNow));
      }
      onChange(getValidTime(newDate).getTime());
    }
  };

  const handleTimeChange = (type, val) => {
    if (dateValue) {
      let newDate = new Date(dateValue);
      if (type === 'hour') {
        const isPM = getHours(newDate) >= 12;
        const h = Number.parseInt(val, 10);
        const newHour24 = isPM ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
        newDate = setHours(newDate, newHour24);
      } else if (type === 'minute') {
        newDate = setMinutes(newDate, Number.parseInt(val, 10));
      } else if (type === 'ampm') {
        const h12 = getHours(newDate) % 12;
        const newHour24 = val === 'PM' ? h12 + 12 : h12;
        newDate = setHours(newDate, newHour24);
      }
      onChange(getValidTime(newDate).getTime());
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const styles = variants[variant];

  return (
    <>
      {label && (
        <label htmlFor={datePickerId} className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required && '*'}
            {label}
          </span>
          {hint && (
            <div className="group relative inline-flex">
              <HelpCircle className="w-5 h-5 text-white/60 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-[360px] min-w-[200px] w-max z-10 whitespace-pre-wrap break-words text-left pointer-events-none">
                {hint}
              </div>
            </div>
          )}
        </label>
      )}
      <div className="mt-1">
        <div className="relative flex items-center">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                id={datePickerId}
                name={name}
                className={cn(
                  styles.button,
                  'justify-start text-left',
                  !dateValue && 'text-white/60',
                  error ? 'border border-red-600' : 'border border-steel-750',
                  className
                )}
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
            <PopoverContent className={cn('w-auto p-0 z-[9999]', styles.popover)}>
              <div className="sm:flex">
                <Calendar
                  initialFocus
                  className={cn(styles.calendar, 'p-3')}
                  classNames={{
                    root: 'w-fit',
                    months: 'flex gap-4 flex-col md:flex-row relative',
                    month: 'flex flex-col w-full gap-4',
                    nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
                    button_previous:
                      'size-8 aria-disabled:opacity-50 p-0 select-none hover:bg-accent hover:text-accent-foreground',
                    button_next:
                      'size-8 aria-disabled:opacity-50 p-0 select-none hover:bg-accent hover:text-accent-foreground',
                    month_caption: 'flex items-center justify-center h-8 w-full px-8',
                    caption_label: 'select-none font-medium text-sm',
                    table: 'w-full border-collapse',
                    weekdays: 'flex',
                    weekday: 'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
                    week: 'flex w-full mt-2',
                    day: cn(
                      'relative w-full h-full p-0 text-center aspect-square select-none hover:bg-accent hover:text-accent-foreground rounded-md'
                    ),
                    today: 'bg-accent text-accent-foreground rounded-md',
                    outside: 'text-muted-foreground aria-selected:text-muted-foreground',
                    disabled: 'text-muted-foreground opacity-50',
                    selected:
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  }}
                  disabled={date => {
                    const minimumDate = minDate || startOfToday();
                    return date < minimumDate;
                  }}
                  mode="single"
                  selected={dateValue}
                  onSelect={handleDateSelect}
                />
                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                  <ScrollArea className={cn('w-64 sm:w-auto', styles.scrollArea)}>
                    <div className="flex sm:flex-col p-2">
                      {hours.map(hour => {
                        const hour24AM = hour === 12 ? 0 : hour;
                        const hour24PM = hour === 12 ? 12 : hour + 12;
                        const isHourDisabled = isToday && hour24AM < currentHour && hour24PM < currentHour;
                        return (
                          <Button
                            key={hour}
                            className="sm:w-full shrink-0 aspect-square"
                            size="icon"
                            disabled={!dateValue || isHourDisabled}
                            variant={dateValue && getHours(dateValue) % 12 === hour % 12 ? 'default' : 'ghost'}
                            onClick={() => handleTimeChange('hour', hour.toString())}
                          >
                            {hour}
                          </Button>
                        );
                      })}
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
                          disabled={
                            !dateValue || (isToday && getHours(dateValue) === currentHour && minute < currentMinute)
                          }
                          variant={dateValue && getMinutes(dateValue) === minute ? 'default' : 'ghost'}
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
                          disabled={!dateValue || (isToday && ampm === 'AM' && currentHour >= 12)}
                          variant={
                            dateValue &&
                            ((ampm === 'AM' && getHours(dateValue) < 12) ||
                              (ampm === 'PM' && getHours(dateValue) >= 12))
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
