'use client';
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
  value?: { from: Date | undefined; to: Date | undefined };
  onChange: (range: { from: Date | undefined; to: Date | undefined } | undefined) => void;
  className?: string;
}

const DateRangePicker = ({ value, onChange, className }: DateRangePickerProps) => {
  const [leftMonth, setLeftMonth] = useState(() => {
    if (value?.from) return value.from;
    return new Date();
  });

  const [rightMonth, setRightMonth] = useState(() => {
    if (value?.to) return value.to;
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSelectLeft = (date: Date | undefined) => {
    if (!date) return;
    onChange({ from: date, to: value?.to });
  };

  const handleSelectRight = (date: Date | undefined) => {
    if (!date) return;
    onChange({ from: value?.from, to: date });
  };

  return (
    <div className={cn('relative w-44', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'flex h-12 w-full items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-4 font-normal hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:bg-transparent',
              !value?.from && 'text-gray-500'
            )}
          >
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 flex-shrink-0 text-blue-900" strokeWidth={2} />
                <span className="text-[14.75px] font-normal text-[#6F6F6F]">
                  {value?.from ? (
                    value.to ? (
                      <>
                        {formatDate(value.from)} - {formatDate(value.to)}
                      </>
                    ) : (
                      formatDate(value.from)
                    )
                  ) : (
                    'Date Range'
                  )}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-[#1E1E1E]" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border bg-white p-0 shadow-lg" align="start">
          <div className="p-4">
            <div className="flex gap-4">
              {/* Left Calendar - Start Date */}
              <div className="flex flex-col">
                <div className="mb-2 text-center text-xs font-medium text-gray-500">Start Date</div>
                <div className="relative">
                  <CalendarComponent
                    mode="single"
                    month={leftMonth}
                    onMonthChange={setLeftMonth}
                    selected={value?.from}
                    onSelect={handleSelectLeft}
                    className="rounded-md"
                    classNames={{
                      months: 'flex',
                      month: 'space-y-4',
                      caption: 'hidden',
                      table: 'w-full border-collapse space-y-1',
                      head_row: 'flex',
                      head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                      row: 'flex w-full mt-2',
                      cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                      day: cn(
                        'h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 transition-colors',
                        'aria-selected:opacity-100'
                      ),
                      day_selected:
                        'bg-[#000093] text-white hover:bg-[#000093]/90 hover:text-white focus:bg-[#000093]/90 focus:text-white',

                      day_today: 'bg-gray-100 text-gray-900 font-semibold',
                      day_outside: 'text-gray-400 opacity-50',
                      day_disabled: 'text-gray-400 opacity-50',
                      day_hidden: 'invisible',
                    }}
                  />
                </div>
              </div>

              {/* Right Calendar - End Date */}
              <div className="flex flex-col">
                <div className="mb-2 text-center text-xs font-medium text-gray-500">End Date</div>
                <div className="relative">
                  <CalendarComponent
                    mode="single"
                    month={rightMonth}
                    onMonthChange={setRightMonth}
                    selected={value?.to}
                    onSelect={handleSelectRight}
                    className="rounded-md"
                    classNames={{
                      months: 'flex',
                      month: 'space-y-4',
                      caption: 'hidden',
                      table: 'w-full border-collapse space-y-1',
                      head_row: 'flex',
                      head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                      row: 'flex w-full mt-2',
                      cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                      day: cn(
                        'h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 transition-colors',
                        'aria-selected:opacity-100'
                      ),
                      day_selected:
                        'bg-[#000093] text-white hover:bg-[#000093]/90 hover:text-white focus:bg-[#000093]/90 focus:text-white',

                      day_today: 'bg-gray-100 text-gray-900 font-semibold',
                      day_outside: 'text-gray-400 opacity-50',
                      day_disabled: 'text-gray-400 opacity-50',
                      day_hidden: 'invisible',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            {(value?.from || value?.to) && (
              <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(undefined)}
                  className="h-8 text-sm hover:bg-gray-100"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
export default DateRangePicker;
