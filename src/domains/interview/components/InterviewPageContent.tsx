"use client";

import { useMemo } from "react";
import {
  InterviewTable,
  useInterviewTable,
  InterviewCalendarView,
} from "@/domains/interview";
import { formatText } from "@/domains/interview/utils/format";
import {
  filterInterviewsForCalendar,
  hasActiveFilters,
} from "@/domains/interview/utils/filter";
import { useInterviewFilters } from "@/domains/interview/hooks/useInterviewFilters";
import Pagination from "@/components/Pagination";
import { DashboardShell } from "@/layouts/dashboard";
import { Funnel, Calendar, Table as TableIcon } from "lucide-react";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import type { InterviewPageContentProps } from "../types/page.types";

const InterviewPageContent = ({
  data,
  statuses,
}: InterviewPageContentProps) => {
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
    [data, searchQuery, filters],
  );

  const hasFilters = hasActiveFilters(filters);

  return (
    <DashboardShell>
      {/* Interviews Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex items-center justify-between">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight wrap-break-word">
          Interviews
        </h1>

        {/* View Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-white text-[#00A8FF] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-white text-[#00A8FF] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TableIcon className="w-4 h-4" />
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
          <linearGradient
            id="dateRangeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col gap-3 sm:gap-6 mb-20 dashboard-zoom-mobile">
        {/* Search and Filters Section - Only show in table view */}
        {viewMode === "table" && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center sm:justify-between">
            {/* Search Bar - Full width on mobile */}
            <div className="flex-1 sm:max-w-md w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Buttons - Wrap on mobile */}
            <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
              {/* Date Range Filter */}
              <div className="relative filter-dropdown">
                <DateRangeFilter
                  onApply={handleDateRangeApply}
                  onClear={handleDateRangeClear}
                  isActive={
                    filters.dateRange?.start !== "" ||
                    filters.dateRange?.end !== ""
                  }
                  label="Date Range"
                  value={filters.dateRange || { start: "", end: "" }}
                  className="filter-dropdown"
                />
              </div>

              {/* Status Filter */}
              <div className="relative filter-dropdown">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "status" ? null : "status",
                    )
                  }
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                    filters.status !== "all"
                      ? "border-[#00A8FF] text-[#00A8FF]"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Funnel
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    style={{ stroke: "url(#statusGradient)" }}
                  />
                  <span>
                    {filters.status !== "all"
                      ? formatText(filters.status)
                      : "Status"}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeDropdown === "status" ? "rotate-180" : ""}`}
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
                {activeDropdown === "status" && (
                  <div className="absolute top-full right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange("status", "all");
                        }}
                        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                          filters.status === "all"
                            ? "bg-gray-100 text-[#00A8FF]"
                            : ""
                        }`}
                      >
                        All Statuses
                      </button>
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterChange("status", status);
                          }}
                          className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                            filters.status === status
                              ? "bg-gray-100 text-[#00A8FF]"
                              : ""
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
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-200 rounded-full text-xs sm:text-sm font-poppins text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
        {viewMode === "calendar" ? (
          <InterviewCalendarView data={filteredData} />
        ) : (
          <>
            {/* Interviews Table Card */}
            <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
              <InterviewTable table={table} columns={columns} />
            </div>

            {/* Pagination - Outside the card */}
            <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
              <Pagination table={table} />
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
};

export default InterviewPageContent;
