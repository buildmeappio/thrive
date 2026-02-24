import type { InterviewData } from '../types/InterviewData';

/**
 * Format time only (without date)
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get calendar grid data for a given year and month
 */
export const getCalendarDays = (year: number, month: number): (number | null)[] => {
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

/**
 * Group interviews by date
 */
export const groupInterviewsByDate = (
  interviews: InterviewData[]
): Record<string, InterviewData[]> => {
  const grouped: Record<string, InterviewData[]> = {};

  interviews.forEach(interview => {
    const date = new Date(interview.startTime);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(interview);
  });

  // Sort interviews within each day by start time
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  return grouped;
};

/**
 * Generate date key for a given year, month, and day
 */
export const getDateKey = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
