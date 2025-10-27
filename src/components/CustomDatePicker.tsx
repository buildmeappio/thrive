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
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  datePickLoading,
  onDateChange,
  dateRestriction = 'future',
  className = '',
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    const message =
      dateRestriction === 'future'
        ? 'Cannot select dates in the past'
        : dateRestriction === 'past'
          ? 'Cannot select dates in the future'
          : '';

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

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const toggleCalendar = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setShowCalendar(!showCalendar);
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDays = generateCalendarDays(currentMonth);

  const renderCalendar = () => {
    return (
      <div className="bg-opacity-50 w-[250px] rounded-3xl border-[1px] bg-white p-4 shadow-lg backdrop-blur-md">
        <div className="mb-2 flex w-[100%] items-center justify-between">
          <button onClick={prevMonth} className="rounded p-1 text-gray-600 hover:bg-gray-100">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h3 className="font-poppins text-center text-[13.9px] leading-[16.68px] font-bold tracking-[0.26px] text-[#000000]">
            {monthYearString(currentMonth)}
          </h3>
          <button onClick={nextMonth} className="rounded p-1 text-gray-600 hover:bg-gray-100">
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
