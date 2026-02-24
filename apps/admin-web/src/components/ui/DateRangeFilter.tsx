'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  onApply: (dateRange: { start: string; end: string }) => void;
  onClear: () => void;
  isActive: boolean;
  className?: string;
  label?: string; // Optional custom label
  value?: { start: string; end: string }; // Current selected date range
}

export default function DateRangeFilter({
  onApply,
  onClear,
  isActive,
  className,
  label = 'Select Date Range',
  value,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    value?.start ? new Date(value.start) : new Date()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize tempDateRange when opening if value exists
  useEffect(() => {
    if (isOpen && value?.start && value?.end) {
      setTempDateRange({
        from: new Date(value.start),
        to: new Date(value.end),
      });
      setCurrentMonth(new Date(value.start));
    } else if (!isOpen) {
      // Reset tempDateRange when closing
      setTempDateRange(undefined);
      setCurrentMonth(value?.start ? new Date(value.start) : new Date());
    }
  }, [isOpen, value?.start, value?.end]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleApply = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onApply({
        start: format(tempDateRange.from, 'yyyy-MM-dd'),
        end: format(tempDateRange.to, 'yyyy-MM-dd'),
      });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempDateRange(undefined);
    onClear();
    setIsOpen(false);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setTempDateRange(range);
  };

  const formatDateRange = () => {
    // Show current value if available, otherwise show temp selection
    const displayRange =
      tempDateRange ||
      (value?.start && value?.end
        ? {
            from: new Date(value.start),
            to: new Date(value.end),
          }
        : undefined);

    if (!displayRange) return label;

    if (displayRange.from && displayRange.to) {
      return `${format(displayRange.from, 'MMM dd')} - ${format(displayRange.to, 'MMM dd')}`;
    }
    if (displayRange.from) {
      return `From ${format(displayRange.from, 'MMM dd')}`;
    }
    return label;
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm',
          isActive
            ? 'border-[#00A8FF] text-[#00A8FF]'
            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        )}
      >
        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            strokeWidth="1.5"
            stroke="url(#dateRangeGradient)"
          />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="url(#dateRangeGradient)"
          />
        </svg>
        <span>{formatDateRange()}</span>
        <svg
          className={cn('h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-[90vw] max-w-[600px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg sm:w-[600px] sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Header with label and navigation */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-700 sm:text-sm">{label}</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setCurrentMonth(prevMonth);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
                  aria-label="Previous month"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentMonth(nextMonth);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
                  aria-label="Next month"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="-mx-2 flex justify-center overflow-x-auto sm:mx-0">
              <Calendar
                mode="range"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                selected={tempDateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                className="rounded-md border-0"
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'hidden', // Hide default caption since we have custom header
                  caption_label: 'text-sm font-medium',
                  nav: 'hidden', // Hide default nav since we have custom navigation
                  nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 [&>button[data-selected-single=true]]:!bg-[#00A8FF] [&>button[data-selected-single=true]]:!text-white [&>button[data-selected-single=true]]:hover:!bg-[#0099E6] [&>button[data-selected-single=true]]:hover:!text-white [&>button[data-range-start=true]]:!bg-[#00A8FF] [&>button[data-range-start=true]]:!text-white [&>button[data-range-start=true]]:hover:!bg-[#0099E6] [&>button[data-range-start=true]]:hover:!text-white [&>button[data-range-end=true]]:!bg-[#00A8FF] [&>button[data-range-end=true]]:!text-white [&>button[data-range-end=true]]:hover:!bg-[#0099E6] [&>button[data-range-end=true]]:hover:!text-white',
                  day_range_end: 'day-range-end',
                  day_selected:
                    'bg-[#00A8FF] text-white hover:bg-[#0099E6] hover:text-white focus:bg-[#00A8FF] focus:text-white',
                  range_start: 'bg-[#00A8FF] text-white hover:bg-[#0099E6] hover:text-white',
                  range_end: 'bg-[#00A8FF] text-white hover:bg-[#0099E6] hover:text-white',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside:
                    'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle:
                    'aria-selected:bg-[#E8F1FF] aria-selected:text-[#00A8FF] hover:aria-selected:bg-[#D0E3FF] [&>button[data-range-middle=true]]:!bg-[#E8F1FF] [&>button[data-range-middle=true]]:!text-[#00A8FF] [&>button[data-range-middle=true]]:hover:!bg-[#D0E3FF]',
                  day_hidden: 'invisible',
                }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={!tempDateRange?.from || !tempDateRange?.to}
                className="flex-1 bg-[#00A8FF] text-white hover:bg-[#0099E6]"
                size="sm"
              >
                Apply Filter
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm" className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
