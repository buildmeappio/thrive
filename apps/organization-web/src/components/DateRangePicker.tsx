'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  value?: { from: Date | undefined; to: Date | undefined };
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
}

const DateRangePicker = ({ value, onChange, className }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: value?.from,
    to: value?.to,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTempRange({ from: value?.from, to: value?.to });
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveInput(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (currentMonth: Date) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    if (activeInput === 'from') {
      setTempRange({ ...tempRange, from: newDate });
      setActiveInput('to');
    } else if (activeInput === 'to') {
      setTempRange({ ...tempRange, to: newDate });
      setActiveInput(null);
    }
  };

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
    setActiveInput(null);
  };

  const handleCancel = () => {
    setTempRange({ from: value?.from, to: value?.to });
    setIsOpen(false);
    setActiveInput(null);
  };

  const monthYearString = (date: Date) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const prevMonth = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateInRange = (date: Date) => {
    if (!tempRange.from || !tempRange.to) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= tempRange.from && checkDate <= tempRange.to;
  };

  const isDateSelected = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return (
      (tempRange.from && checkDate.getTime() === tempRange.from.getTime()) ||
      (tempRange.to && checkDate.getTime() === tempRange.to.getTime())
    );
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDays = generateCalendarDays(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={`relative ${className || ''}`}>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="font-poppins flex h-[45px] w-44 justify-between gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-[#000093]" />
          <span className="text-sm font-normal leading-relaxed">Date</span>
        </div>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown className="h-4 w-4 text-[#A4A4A4]" />
        </div>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-[320px] rounded-3xl border border-gray-200 bg-white p-4 shadow-lg"
        >
          <div className="space-y-3">
            {/* From Date Input */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="text"
                readOnly
                value={formatDisplayDate(tempRange.from)}
                onClick={() => setActiveInput(activeInput === 'from' ? null : 'from')}
                placeholder="Select start date"
                className={`w-full cursor-pointer rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000093] ${
                  activeInput === 'from'
                    ? 'border-[#000093] ring-2 ring-[#000093]'
                    : 'border-gray-200'
                }`}
              />
            </div>

            {/* To Date Input */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="text"
                readOnly
                value={formatDisplayDate(tempRange.to)}
                onClick={() => setActiveInput(activeInput === 'to' ? null : 'to')}
                placeholder="Select end date"
                className={`w-full cursor-pointer rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000093] ${
                  activeInput === 'to'
                    ? 'border-[#000093] ring-2 ring-[#000093]'
                    : 'border-gray-200'
                }`}
              />
            </div>

            {/* Calendar */}
            {activeInput && (
              <div className="rounded-2xl bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="rounded p-1 text-gray-600 hover:bg-gray-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-poppins text-center text-sm font-bold text-black">
                    {monthYearString(currentMonth)}
                  </h3>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="rounded p-1 text-gray-600 hover:bg-gray-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekdays.map(day => (
                    <div
                      key={day}
                      className="font-poppins text-center text-xs font-normal text-gray-600"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="h-8 w-8" />;
                    }

                    const isToday = day.toDateString() === today.toDateString();
                    const isSelected = isDateSelected(day);
                    const isInRange = isDateInRange(day);

                    return (
                      <div
                        key={index}
                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#000093] font-semibold text-white'
                            : isInRange
                              ? 'bg-blue-100 text-[#000093]'
                              : isToday
                                ? 'bg-gray-200 font-semibold'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => handleDateSelect(day)}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-lg bg-[#000093] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0080FF]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
