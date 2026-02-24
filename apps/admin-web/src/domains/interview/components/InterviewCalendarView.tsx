'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { InterviewCalendarViewProps } from '../types/calendar.types';
import { MONTH_NAMES, DAY_NAMES } from '../types/calendar.types';
import { getCalendarDays, groupInterviewsByDate, getDateKey } from '../utils/calendar';
import DayCell from './DayCell';

const InterviewCalendarView = ({ data }: InterviewCalendarViewProps) => {
  // Initialize with a fixed date to ensure server and client render the same initially
  // This will be updated to the current date on client mount
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2024, 0, 1));
  const [today, setToday] = useState<Date | null>(null);

  // Update to actual current date on client mount only
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Filter out REQUESTED slots - only show BOOKED and COMPLETED
  const filteredData = useMemo(
    () =>
      data.filter(
        interview =>
          interview.status.toUpperCase() === 'BOOKED' ||
          interview.status.toUpperCase() === 'COMPLETED'
      ),
    [data]
  );

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const groupedInterviews = useMemo(() => groupInterviewsByDate(filteredData), [filteredData]);

  const goToPreviousMonth = () => {
    if (currentDate) {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    }
  };

  const goToNextMonth = () => {
    if (currentDate) {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const isToday = (day: number | null) => {
    if (day === null || !today) return false;
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getInterviewsForDay = (day: number | null) => {
    if (day === null) return [];
    const dateKey = getDateKey(currentYear, currentMonth, day);
    return groupedInterviews[dateKey] || [];
  };

  return (
    <div className="rounded-[28px] bg-white p-4 shadow-sm sm:p-6">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {MONTH_NAMES[currentMonth]}, {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded-full bg-[#00A8FF]" />
          <span className="text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded-full bg-[#000080]" />
          <span className="text-gray-700">Completed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[600px] sm:min-w-[700px]">
          {/* Day Names Header */}
          <div className="mb-0 grid grid-cols-7 gap-0">
            {DAY_NAMES.map(day => (
              <div
                key={day}
                className="border border-gray-200 bg-gray-100 py-2 text-center text-xs font-semibold text-gray-700 sm:py-3 sm:text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, index) => (
              <DayCell
                key={index}
                day={day}
                interviews={getInterviewsForDay(day)}
                isToday={isToday(day)}
                isCurrentMonth={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCalendarView;
