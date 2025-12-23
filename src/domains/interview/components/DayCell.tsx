"use client";

import { useState } from "react";
import type { DayCellProps } from "../types/calendar.types";
import InterviewSlot from "./InterviewSlot";

const DayCell = ({
  day,
  interviews,
  isToday,
  isCurrentMonth,
}: DayCellProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 3;
  const hasMore = interviews.length > displayLimit;
  const displayedInterviews = showAll
    ? interviews
    : interviews.slice(0, displayLimit);

  if (day === null) {
    return (
      <div className="min-h-[80px] sm:min-h-[120px] bg-gray-50 border border-gray-200" />
    );
  }

  return (
    <div
      className={`min-h-[80px] sm:min-h-[120px] border border-gray-200 p-1 sm:p-2 ${
        isCurrentMonth ? "bg-white" : "bg-gray-50"
      } ${isToday ? "ring-2 ring-blue-400" : ""}`}
    >
      <div
        className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
          isToday
            ? "bg-blue-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs"
            : "text-gray-900"
        }`}
      >
        {day}
      </div>
      <div className="space-y-1 overflow-y-auto max-h-[120px] sm:max-h-[200px]">
        {displayedInterviews.map((interview) => (
          <InterviewSlot key={interview.id} interview={interview} />
        ))}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            +{interviews.length - displayLimit} more
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={() => setShowAll(false)}
            className="text-[10px] sm:text-xs text-gray-600 hover:text-gray-800 font-medium"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

export default DayCell;
