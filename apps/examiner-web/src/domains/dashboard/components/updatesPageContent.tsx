'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { RecentUpdate, UpdateType } from '@/domains/dashboard/types';
import { formatRelativeTime, formatDateTime } from '@/utils/date';
import Link from 'next/link';
import { ArrowLeft, Bell, X, Plus, Square, ChevronDown } from 'lucide-react';
import DateRangeFilter from '@/components/DateRangeFilter';

type UpdatesPageContentProps = {
  updates: RecentUpdate[];
};

const updateTypeLabels: Record<UpdateType | 'all', string> = {
  all: 'All Types',
  APPOINTMENT_SCHEDULED: 'Appointment Scheduled',
  APPOINTMENT_ACCEPTED: 'Appointment Accepted',
  APPOINTMENT_DECLINED: 'Appointment Declined',
  REPORT_SUBMITTED: 'Report Submitted',
  REPORT_OVERDUE: 'Report Overdue',
  REPORT_DRAFT_CREATED: 'Draft Created',
};

type DateFilterOption = 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';

const dateFilterLabels: Record<DateFilterOption, string> = {
  all: 'All Dates',
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  last30days: 'Last 30 Days',
  custom: 'Custom Range',
};

export default function UpdatesPageContent({ updates }: UpdatesPageContentProps) {
  const [selectedType, setSelectedType] = useState<UpdateType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // Store date range as strings for DateRangeFilter component
  const [dateRangeValue, setDateRangeValue] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on filter option
  const getDateRange = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case 'today': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { start: today, end: now };
      }
      case 'yesterday': {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return { start: yesterday, end: yesterdayEnd };
      }
      case 'last7days': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return { start: sevenDaysAgo, end: now };
      }
      case 'last30days': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return { start: thirtyDaysAgo, end: now };
      }
      case 'custom': {
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          // Validate that start <= end
          if (start <= end) {
            return { start, end };
          }
        }
        return null;
      }
      default:
        return null;
    }
  }, [dateFilter, startDate, endDate]);

  // Filter updates based on selected filters
  const filteredUpdates = useMemo(() => {
    return updates.filter(update => {
      // Filter by type
      if (selectedType !== 'all' && update.type !== selectedType) {
        return false;
      }

      // Filter by date range
      if (getDateRange) {
        const updateDate = new Date(update.timestamp);
        if (updateDate < getDateRange.start || updateDate > getDateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [updates, selectedType, getDateRange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setDateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clearFilters = () => {
    setSelectedType('all');
    setDateFilter('all');
    setStartDate(null);
    setEndDate(null);
    setDateRangeValue(null);
  };

  const handleDateRangeApply = (dateRange: { start: string; end: string }) => {
    setDateRangeValue(dateRange);
    // Convert string dates to Date objects, set to start/end of day
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    setStartDate(start);
    setEndDate(end);
  };

  const handleDateRangeClear = () => {
    setDateRangeValue(null);
    setStartDate(null);
    setEndDate(null);
  };

  const hasActiveFilters =
    selectedType !== 'all' ||
    (dateFilter !== 'all' && dateFilter !== 'custom') ||
    (dateFilter === 'custom' && (startDate !== null || endDate !== null));

  // Get display text for date filter button
  const getDateFilterDisplayText = () => {
    // When custom is selected, just show "Custom Range" in the main filter
    if (dateFilter === 'custom') {
      return 'Custom Range';
    }
    return dateFilterLabels[dateFilter];
  };

  return (
    <div className="px-6 pb-6 pt-4 sm:px-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F6FF] transition-colors hover:bg-[#D8F0FF]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5 text-[#00A8FF]" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEEFFF]">
            <Bell className="h-5 w-5" style={{ color: '#00A8FF' }} />
          </span>
          <h1 className="text-3xl font-medium tracking-[-0.02em] text-black sm:text-2xl">
            Recent Updates
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Type Filter */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            className={`font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
              selectedType !== 'all'
                ? 'border-[#00A8FF] text-[#00A8FF]'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-[#00A8FF] sm:h-4 sm:w-4" />
            <span>{updateTypeLabels[selectedType]}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${
                typeDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Type Dropdown Menu */}
          {typeDropdownOpen && (
            <div className="absolute z-50 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                {Object.entries(updateTypeLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedType(value as UpdateType | 'all');
                      setTypeDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                      selectedType === value ? 'bg-[#E6F6FF] text-[#00A8FF]' : 'text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative" ref={dateDropdownRef}>
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className={`font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
              dateFilter !== 'all'
                ? 'border-[#00A8FF] text-[#00A8FF]'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Square className="h-3.5 w-3.5 text-[#00A8FF] sm:h-4 sm:w-4" />
            <span>{getDateFilterDisplayText()}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${
                dateDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Date Dropdown Menu */}
          {dateDropdownOpen && (
            <div className="absolute z-50 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                {Object.entries(dateFilterLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setDateFilter(value as DateFilterOption);
                      if (value !== 'custom') {
                        setStartDate(null);
                        setEndDate(null);
                        setDateDropdownOpen(false);
                      } else {
                        // Close dropdown when selecting custom - will show separate filter button
                        setDateDropdownOpen(false);
                      }
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                      dateFilter === value ? 'bg-[#E6F6FF] text-[#00A8FF]' : 'text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Range Filter Button - Shows when custom is selected */}
        {dateFilter === 'custom' && (
          <DateRangeFilter
            onApply={handleDateRangeApply}
            onClear={handleDateRangeClear}
            isActive={!!(startDate && endDate)}
            label="Select Date Range"
            value={
              dateRangeValue ||
              (startDate && endDate
                ? {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0],
                  }
                : undefined)
            }
          />
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100 sm:gap-2 sm:px-6 sm:py-3 sm:text-sm"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Updates List */}
      <div className="rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)] sm:p-4">
        {filteredUpdates.length > 0 ? (
          <div className="space-y-3">
            {filteredUpdates.map(update => (
              <div
                key={update.id}
                className="flex items-start gap-4 rounded-lg bg-[#F2F2F2] p-4 transition-colors hover:bg-[#E8E8E8]"
              >
                {/* Gradient dot */}
                <span className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-lg tracking-[-0.02em] text-[#444] sm:text-base">
                        {update.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[#888]">
                          {formatRelativeTime(update.timestamp)}
                        </span>
                        <span className="text-[#888]">•</span>
                        <span className="text-sm text-[#888]">
                          {formatDateTime(update.timestamp)}
                        </span>
                        {update.caseNumber && (
                          <>
                            <span className="text-[#888]">•</span>
                            <span className="text-sm font-medium text-[#00A8FF]">
                              {update.caseNumber}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {update.bookingId && (
                      <Link
                        href={`/appointments/${update.bookingId}`}
                        className="whitespace-nowrap text-sm font-medium text-[#00A8FF] transition-colors hover:text-[#0099E6]"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Bell className="mx-auto mb-4 h-16 w-16 text-[#CCC]" />
            <p className="mb-2 text-lg text-[#888]">No updates found</p>
            {hasActiveFilters && (
              <p className="text-sm text-[#AAA]">Try adjusting your filters to see more results</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
