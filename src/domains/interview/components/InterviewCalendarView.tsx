"use client";

import { useMemo, useState } from "react";
import { InterviewData } from "@/domains/interview/types/InterviewData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface InterviewCalendarViewProps {
  data: InterviewData[];
}

// Status color mapping - using distinct gradients with app theme
const STATUS_COLORS: Record<
  string,
  { gradient: string; text: string; legendColor: string }
> = {
  booked: {
    gradient: "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]",
    text: "text-white",
    legendColor: "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]",
  },
  completed: {
    gradient: "bg-gradient-to-r from-[#01F4C8] to-[#00F4A8]",
    text: "text-white",
    legendColor: "bg-gradient-to-r from-[#01F4C8] to-[#00F4A8]",
  },
};

// Utility function to format text from database
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Format time only
const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Get calendar grid data
const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Adjust to Monday = 0
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: (number | null)[] = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

// Group interviews by date
const groupInterviewsByDate = (interviews: InterviewData[]) => {
  const grouped: Record<string, InterviewData[]> = {};

  interviews.forEach((interview) => {
    const date = new Date(interview.startTime);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(interview);
  });

  // Sort interviews within each day by start time
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  });

  return grouped;
};

const InterviewSlot = ({ interview }: { interview: InterviewData }) => {
  const statusColors = STATUS_COLORS[interview.status.toLowerCase()] || {
    gradient: "bg-gray-500",
    text: "text-white",
    legendColor: "bg-gray-500",
  };
  const timeRange = `${formatTime(interview.startTime)} - ${formatTime(interview.endTime)}`;

  const content = (
    <div
      className={`group relative rounded-lg p-1.5 sm:p-2 mb-1 sm:mb-2 hover:opacity-90 transition-opacity cursor-pointer ${statusColors.gradient} ${statusColors.text}`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="text-[10px] sm:text-xs font-medium truncate">
          {interview.examinerName}
        </div>
        <div className="text-[9px] sm:text-[10px] opacity-90 truncate">
          {timeRange}
        </div>
      </div>
    </div>
  );

  if (interview.applicationId) {
    return (
      <Link href={`/application/${interview.applicationId}`}>{content}</Link>
    );
  }

  return content;
};

const DayCell = ({
  day,
  interviews,
  isToday,
  isCurrentMonth,
}: {
  day: number | null;
  interviews: InterviewData[];
  isToday: boolean;
  isCurrentMonth: boolean;
}) => {
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

export default function InterviewCalendarView({
  data,
}: InterviewCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const groupedInterviews = useMemo(() => groupInterviewsByDate(data), [data]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number | null) => {
    if (day === null) return false;
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getInterviewsForDay = (day: number | null) => {
    if (day === null) return [];
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return groupedInterviews[dateKey] || [];
  };

  return (
    <div className="bg-white rounded-[28px] shadow-sm p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {monthNames[currentMonth]}, {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
          <span className="text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded-full bg-gradient-to-r from-[#01F4C8] to-[#00F4A8]" />
          <span className="text-gray-700">Completed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[600px] sm:min-w-[700px]">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-0 mb-0">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-xs sm:text-sm text-gray-700 py-2 sm:py-3 bg-gray-100 border border-gray-200"
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
}
