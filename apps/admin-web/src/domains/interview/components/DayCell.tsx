'use client';

import { useState } from 'react';
import type { DayCellProps } from '../types/calendar.types';
import InterviewSlot from './InterviewSlot';

const DayCell = ({ day, interviews, isToday, isCurrentMonth }: DayCellProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 3;
  const hasMore = interviews.length > displayLimit;
  const displayedInterviews = showAll ? interviews : interviews.slice(0, displayLimit);

  if (day === null) {
    return <div className="min-h-[80px] border border-gray-200 bg-gray-50 sm:min-h-[120px]" />;
  }

  return (
    <div
      className={`min-h-[80px] border border-gray-200 p-1 sm:min-h-[120px] sm:p-2 ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div
        className={`mb-1 text-xs font-semibold sm:mb-2 sm:text-sm ${
          isToday
            ? 'flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white sm:h-6 sm:w-6'
            : 'text-gray-900'
        }`}
      >
        {day}
      </div>
      <div className="max-h-[120px] space-y-1 overflow-y-auto sm:max-h-[200px]">
        {displayedInterviews.map(interview => (
          <InterviewSlot key={interview.id} interview={interview} />
        ))}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 sm:text-xs"
          >
            +{interviews.length - displayLimit} more
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="text-[10px] font-medium text-gray-600 hover:text-gray-800 sm:text-xs"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

export default DayCell;
