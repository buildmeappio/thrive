'use client';

import { useMemo } from 'react';
import { InterviewTable, useInterviewTable, InterviewCalendarView } from '@/domains/interview';
import { formatText } from '@/domains/interview/utils/format';
import { filterInterviewsForCalendar, hasActiveFilters } from '@/domains/interview/utils/filter';
import { useInterviewFilters } from '@/domains/interview/hooks/useInterviewFilters';
import Pagination from '@/components/Pagination';
import { DashboardShell } from '@/layouts/dashboard';
import { Funnel, Calendar, Table as TableIcon } from 'lucide-react';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import type { InterviewPageContentProps } from '../types/page.types';

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
    <DashboardShell>
      {/* Interviews Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular wrap-break-word text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Interviews
        </h1>

        {/* View Toggle */}
        <div className="flex gap-2 rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-[#00A8FF] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-[#00A8FF] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="dateRangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="dashboard-zoom-mobile mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search and Filters Section - Only show in table view */}
        {viewMode === 'table' && (
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Search Bar - Full width on mobile */}
            <div className="w-full flex-1 sm:max-w-md">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="url(#searchGradient)"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by examiner name, date, or status"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
                />
              </div>
            </div>

            {/* Filter Buttons - Wrap on mobile */}
            <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
              {/* Date Range Filter */}
              <div className="filter-dropdown relative">
                <DateRangeFilter
                  onApply={handleDateRangeApply}
                  onClear={handleDateRangeClear}
                  isActive={filters.dateRange?.start !== '' || filters.dateRange?.end !== ''}
                  label="Date Range"
                  value={filters.dateRange || { start: '', end: '' }}
                  className="filter-dropdown"
                />
              </div>

              {/* Status Filter */}
              <div className="filter-dropdown relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                  className={`font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                    filters.status !== 'all'
                      ? 'border-[#00A8FF] text-[#00A8FF]'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Funnel
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    style={{ stroke: 'url(#statusGradient)' }}
                  />
                  <span>{filters.status !== 'all' ? formatText(filters.status) : 'Status'}</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${activeDropdown === 'status' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {activeDropdown === 'status' && (
                  <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-56">
                    <div className="max-h-48 overflow-y-auto py-1.5 sm:max-h-64 sm:py-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleFilterChange('status', 'all');
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                          filters.status === 'all' ? 'bg-gray-100 text-[#00A8FF]' : ''
                        }`}
                      >
                        All Statuses
                      </button>
                      {statuses.map(status => (
                        <button
                          key={status}
                          onClick={e => {
                            e.stopPropagation();
                            handleFilterChange('status', status);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                            filters.status === status ? 'bg-gray-100 text-[#00A8FF]' : ''
                          }`}
                        >
                          {formatText(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                >
                  <svg
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Calendar or Table View */}
        {viewMode === 'calendar' ? (
          <InterviewCalendarView data={filteredData} />
        ) : (
          <>
            {/* Interviews Table Card */}
            <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
              <InterviewTable table={table} columns={columns} />
            </div>

            {/* Pagination - Outside the card */}
            <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
              <Pagination table={table} />
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
};

export default InterviewPageContent;
