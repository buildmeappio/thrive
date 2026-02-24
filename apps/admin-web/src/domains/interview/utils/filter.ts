import type { InterviewData } from '../types/InterviewData';
import type { FilterState } from '../types/table.types';
import { matchesSearch } from '@/utils/search';

/**
 * Filter interviews for calendar view
 */
export const filterInterviewsForCalendar = (
  data: InterviewData[],
  searchQuery: string,
  filters: FilterState
): InterviewData[] => {
  let result = data;

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    result = result.filter(d => d.status === filters.status);
  }

  // Filter by date range
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    if (start) {
      result = result.filter(d => {
        const interviewDate = new Date(d.startTime);
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        return interviewDate >= startDate;
      });
    }
    if (end) {
      result = result.filter(d => {
        const interviewDate = new Date(d.startTime);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        return interviewDate <= endDate;
      });
    }
  }

  // Filter by search query
  if (searchQuery.trim()) {
    result = result.filter(d =>
      [d.examinerName, d.status].filter(Boolean).some(v => matchesSearch(searchQuery, v))
    );
  }

  return result;
};

/**
 * Check if filters are active
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.status !== 'all' || filters.dateRange?.start !== '' || filters.dateRange?.end !== ''
  );
};
