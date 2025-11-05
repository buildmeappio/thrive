"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  onApply: (dateRange: { start: string; end: string }) => void;
  onClear: () => void;
  isActive: boolean;
  className?: string;
  label?: string; // Optional custom label
}

export default function DateRangeFilter({ 
  onApply, 
  onClear, 
  isActive, 
  className,
  label = "Select Date Range"
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);

  const handleApply = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onApply({
        start: format(tempDateRange.from, "yyyy-MM-dd"),
        end: format(tempDateRange.to, "yyyy-MM-dd")
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
    if (!tempDateRange) return label;
    
    if (tempDateRange.from && tempDateRange.to) {
      return `${format(tempDateRange.from, "MMM dd")} - ${format(tempDateRange.to, "MMM dd")}`;
    }
    if (tempDateRange.from) {
      return `From ${format(tempDateRange.from, "MMM dd")}`;
    }
    return label;
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-6 py-3 bg-white border rounded-full text-sm font-poppins transition-colors",
          isActive
            ? "border-[#00A8FF] text-[#00A8FF]"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        )}
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{formatDateRange()}</span>
        <svg 
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-6">
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700">{label}</div>
            
            <div className="flex justify-center">
              <Calendar
                mode="range"
                defaultMonth={tempDateRange?.from}
                selected={tempDateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                className="rounded-md border-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  day_range_end: "day-range-end",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={!tempDateRange?.from || !tempDateRange?.to}
                className="flex-1 bg-[#00A8FF] hover:bg-[#0099E6] text-white"
                size="sm"
              >
                Apply Filter
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
