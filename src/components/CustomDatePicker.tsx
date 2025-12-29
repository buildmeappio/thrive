import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './DateSkeleton';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './ui';

type DateRestriction = 'future' | 'past' | 'all';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  datePickLoading: boolean;
  dateRestriction?: DateRestriction;
  minDate?: Date; // Minimum allowed date
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  datePickLoading,
  onDateChange,
  dateRestriction = 'future',
  minDate,
  className = '',
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showCalendar &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const formatShortDate = (date: Date | null) => {
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

  const isDateDisabled = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Check against minDate if provided
    if (minDate) {
      const minDateNormalized = new Date(minDate);
      minDateNormalized.setHours(0, 0, 0, 0);
      if (checkDate < minDateNormalized) {
        return true;
      }
    }

    switch (dateRestriction) {
      case 'future':
        return checkDate < today;
      case 'past':
        return checkDate > today;
      case 'all':
        return false;
      default:
        return false;
    }
  };

  const showDisabledDateToast = () => {
    let message = '';

    if (minDate) {
      const formattedMinDate = minDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      message = `Cannot select dates before ${formattedMinDate}`;
    } else if (dateRestriction === 'future') {
      message = 'Cannot select dates in the past';
    } else if (dateRestriction === 'past') {
      message = 'Cannot select dates in the future';
    }

    if (message) {
      toast.error(message);
    }
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
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        day: i,
        isToday,
        isDisabled: isDateDisabled(date),
      });
    }

    return days;
  };

  const handleDateSelection = (date: Date) => {
    if (isDateDisabled(date)) {
      showDisabledDateToast();
      return;
    }

    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    newDate.setHours(12, 0, 0, 0);

    onDateChange(newDate);
    setShowCalendar(false);
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

  // Calculate reasonable minimum date (100 years ago from today)
  const getMinAllowedDate = () => {
    if (minDate) {
      return minDate;
    }
    if (dateRestriction === 'past') {
      const minAllowedDate = new Date(today);
      minAllowedDate.setFullYear(today.getFullYear() - 100);
      return minAllowedDate;
    }
    return null;
  };

  const minAllowedDate = getMinAllowedDate();

  const canGoToPreviousMonth = () => {
    if (!minAllowedDate) return true;
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return previousMonth >= minAllowedDate;
  };

  const canGoToNextMonth = () => {
    if (dateRestriction === 'past') {
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      return nextMonth <= today;
    }
    if (dateRestriction === 'future') {
      return true; // Can always go forward for future dates
    }
    return true;
  };

  const prevMonth = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!canGoToPreviousMonth()) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!canGoToNextMonth()) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const toggleCalendar = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setShowCalendar(!showCalendar);
    setShowYearPicker(false);
  };

  const handleYearMonthClick = () => {
    setShowYearPicker(!showYearPicker);
  };

  const selectYear = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearPicker(false);
  };

  const selectMonth = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    setShowYearPicker(false);
  };

  const getAvailableYears = () => {
    const years = [];
    const startYear = minAllowedDate ? minAllowedDate.getFullYear() : today.getFullYear() - 100;
    const endYear = dateRestriction === 'past' ? today.getFullYear() : today.getFullYear() + 10;

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years.reverse(); // Show most recent years first
  };

  const getAvailableMonths = () => {
    const months = [
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

    return months.map((name, index) => ({
      name,
      index,
      isDisabled: false,
    }));
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDays = generateCalendarDays(currentMonth);

  const renderCalendar = () => {
    if (showYearPicker) {
      const availableYears = getAvailableYears();
      const availableMonths = getAvailableMonths();
      const currentYear = currentMonth.getFullYear();
      const currentMonthIndex = currentMonth.getMonth();

      return (
        <div className="bg-opacity-50 w-[250px] rounded-3xl border-[1px] bg-white p-4 shadow-lg backdrop-blur-md">
          <div className="mb-2 flex w-[100%] items-center justify-between">
            <button
              type="button"
              onClick={() => setShowYearPicker(false)}
              className="rounded p-1 text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h3 className="font-poppins text-center text-[13.9px] leading-[16.68px] font-bold tracking-[0.26px] text-[#000000]">
              Select Year
            </h3>
            <div className="w-6"></div>
          </div>

          <div className="mb-2 max-h-[200px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-1">
              {availableYears.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => selectYear(year)}
                  className={`rounded p-2 text-[11.12px] ${
                    year === currentYear
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-2">
            <div className="mb-1 text-[10px] font-semibold text-gray-500">Select Month</div>
            <div className="grid grid-cols-3 gap-1">
              {availableMonths.map(month => (
                <button
                  key={month.index}
                  type="button"
                  onClick={() => selectMonth(month.index)}
                  className={`rounded p-1 text-[10px] ${
                    month.index === currentMonthIndex
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {month.name.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-opacity-50 w-[250px] rounded-3xl border-[1px] bg-white p-4 shadow-lg backdrop-blur-md">
        <div className="mb-2 flex w-[100%] items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoToPreviousMonth()}
            className={`rounded p-1 ${
              canGoToPreviousMonth()
                ? 'text-gray-600 hover:bg-gray-100'
                : 'cursor-not-allowed text-gray-300'
            }`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleYearMonthClick}
            className="font-poppins cursor-pointer text-center text-[13.9px] leading-[16.68px] font-bold tracking-[0.26px] text-[#000000] hover:text-blue-600"
          >
            {monthYearString(currentMonth)}
          </button>
          <button
            type="button"
            onClick={nextMonth}
            disabled={!canGoToNextMonth()}
            className={`rounded p-1 ${
              canGoToNextMonth()
                ? 'text-gray-600 hover:bg-gray-100'
                : 'cursor-not-allowed text-gray-300'
            }`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdays.map(day => (
            <div
              key={day}
              className="font-poppins text-center text-[8.34px] leading-[11.12px] font-normal tracking-[0px]"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const isInvalid = !day || day.isDisabled;

            return (
              <div
                key={index}
                className={`h-6 w-6 rounded-full p-1 text-center text-[11.12px] leading-[14.59px] font-normal tracking-[-0.22px] ${!day ? 'invisible' : ''} ${isInvalid ? 'cursor-not-allowed text-[#808080]' : 'cursor-pointer hover:bg-blue-100'} ${day && day.isToday ? 'bg-blue-100' : ''} ${day && selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'bg-blue-500 text-white' : ''} `}
                onClick={() =>
                  day &&
                  (isInvalid
                    ? day.isDisabled
                      ? showDisabledDateToast()
                      : null
                    : handleDateSelection(day.date))
                }
              >
                {day ? day.day : ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (datePickLoading) {
    return (
      <div className="w-full max-w-xl">
        <Skeleton.TimeSlot />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="-mt-2 mb-6 flex">
        <div className="relative flex w-full items-center gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              className={`rounded-lg pr-10 text-[14.72px] font-normal ${className ? className : ''}`}
              value={formatShortDate(selectedDate)}
              readOnly
              onClick={() => toggleCalendar()}
              placeholder="Select a date"
            />
            <button
              type="button"
              ref={buttonRef}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={toggleCalendar}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showCalendar && (
              <div ref={calendarRef} className="absolute z-10 mt-1 w-64 rounded-3xl">
                {renderCalendar()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDatePicker;
