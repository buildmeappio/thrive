'use client';

import { useMemo } from 'react';
import { InterviewTable, useInterviewTable, InterviewCalendarView } from '@/domains/interview';
import { formatText } from '@/domains/interview/utils/format';
import { filterInterviewsForCalendar, hasActiveFilters } from '@/domains/interview/utils/filter';
import { useInterviewFilters } from '@/domains/interview/hooks/useInterviewFilters';
import Pagination from '@/components/Pagination';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';
import { Funnel, Calendar, Table as TableIcon } from 'lucide-react';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { InterviewData } from '../types/InterviewData';

type InterviewPageContentProps = {
  data: InterviewData[];
  statuses: string[];
};

const InterviewPageContent = ({ data, statuses }: InterviewPageContentProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    activeDropdown,
    setActiveDropdown,
    viewMode,
    setViewMode,
    handleFilterChange,
    handleDateRangeApply,
    handleDateRangeClear,
    clearFilters,
  } = useInterviewFilters();

  // Get table and columns from the hook
  const { table, columns } = useInterviewTable({
    data,
    searchQuery,
    filters,
  });

  // Apply filters to data for calendar view
  const filteredData = useMemo(
    () => filterInterviewsForCalendar(data, searchQuery, filters),
    [data, searchQuery, filters]
  );

  const hasFilters = hasActiveFilters(filters);

  return (
    <TenantDashboardShell>
      {/* Interviews Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular wrap-break-word text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Interviews
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              viewMode === 'table'
                ? 'bg-[#00A8FF] text-white'
                : 'bg-white text-[#7B8B91] hover:bg-[#F2F5F6]'
            }`}
          >
            <TableIcon className="h-4 w-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#00A8FF] text-white'
                : 'bg-white text-[#7B8B91] hover:bg-[#F2F5F6]'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search interviews..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="rounded-lg border border-[#E9EDEE] px-3 py-2 text-sm"
        />
        <DateRangeFilter
          onApply={handleDateRangeApply}
          onClear={handleDateRangeClear}
          hasActiveRange={!!filters.dateRange}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 rounded-lg border border-[#E9EDEE] bg-white px-3 py-2 text-sm text-[#7B8B91] hover:bg-[#F2F5F6]"
          >
            <Funnel className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="space-y-4">
          <InterviewTable table={table} columns={columns} />
          <Pagination table={table} />
        </div>
      ) : (
        <InterviewCalendarView data={filteredData} />
      )}
    </TenantDashboardShell>
  );
};

export default InterviewPageContent;
