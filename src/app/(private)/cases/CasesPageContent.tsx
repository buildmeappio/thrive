"use client";

import { useState, useEffect } from "react";
import CaseTable, {
  useCaseTable,
} from "@/domains/case/components/CaseTableWithPagination";
import Pagination from "@/components/Pagination";
import { CaseData } from "@/domains/case/types/CaseData";
import { DashboardShell } from "@/layouts/dashboard";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CasesPageContentProps {
  data: CaseData[];
  types: string[];
  statuses: string[];
  priorityLevels: string[];
}

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface FilterState {
  claimType: string;
  status: string;
  priority: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function CasesPageContent({
  data,
  types,
  statuses,
  priorityLevels,
}: CasesPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    claimType: "all",
    status: "all",
    priority: "all",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    if (filterType === "dateRange") {
      // Handle date range separately
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const handleDateApply = () => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        start: fromDate ? format(fromDate, "yyyy-MM-dd") : "",
        end: toDate ? format(toDate, "yyyy-MM-dd") : "",
      },
    }));
    // Close any open popovers and the date dropdown after applying
    setFromDateOpen(false);
    setToDateOpen(false);
    setActiveDropdown(null);
  };

  const handleDateClear = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        start: "",
        end: "",
      },
    }));
    // Close any open popovers and the date dropdown after clearing
    setFromDateOpen(false);
    setToDateOpen(false);
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setFilters({
      claimType: "all",
      status: "all",
      priority: "all",
      dateRange: {
        start: "",
        end: "",
      },
    });
  };

  const hasActiveFilters =
    filters.claimType !== "all" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.dateRange.start ||
    filters.dateRange.end;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        // Check if the click is outside any dropdown container or calendar popover (rendered in a portal)
        const isInsideDropdown = target.closest(
          ".filter-dropdown, .date-popover-content",
        );
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Get table and columns from the hook
  const { table, columns } = useCaseTable({
    data,
    searchQuery,
    filters,
  });

  return (
    <DashboardShell>
      {/* Cases Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          New Cases
        </h1>
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="typeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="dateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient
            id="priorityGradient"
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
        {/* Search and Filters Section - Separate Elements */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          {/* Search Bar - Separate */}
          <div className="w-full sm:w-auto sm:flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5"
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
                placeholder="Search by cases"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full bg-white text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons - Separate with wrap */}
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Date Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === "date" ? null : "date")
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                  filters.dateRange.start || filters.dateRange.end
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="url(#dateGradient)"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16 2v4M8 2v4M3 10h18"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Date</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "date" ? "rotate-180" : ""
                  }`}
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
              {activeDropdown === "date" && (
                <div className="absolute top-full left-0 mt-2 w-[280px] sm:w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 sm:p-4">
                  <div className="space-y-2.5 sm:space-y-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">
                      Date
                    </div>

                    {/* From Date */}
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <Label
                        htmlFor="from-date"
                        className="px-1 text-xs sm:text-sm"
                      >
                        From Date
                      </Label>
                      <Popover
                        open={fromDateOpen}
                        onOpenChange={setFromDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="from-date"
                            className="w-full justify-between font-normal text-xs sm:text-sm h-9 sm:h-10"
                          >
                            {fromDate
                              ? fromDate.toLocaleDateString()
                              : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="date-popover-content w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            captionLayout="dropdown"
                            className="w-full"
                            classNames={{ root: "w-full" }}
                            onSelect={(date) => {
                              setFromDate(date);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <Label
                        htmlFor="to-date"
                        className="px-1 text-xs sm:text-sm"
                      >
                        To Date
                      </Label>
                      <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="to-date"
                            className="w-full justify-between font-normal text-xs sm:text-sm h-9 sm:h-10"
                          >
                            {toDate
                              ? toDate.toLocaleDateString()
                              : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="date-popover-content w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={toDate}
                            captionLayout="dropdown"
                            className="w-full"
                            classNames={{ root: "w-full" }}
                            onSelect={(date) => {
                              setToDate(date);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Apply Button */}
                    <Button
                      onClick={handleDateApply}
                      disabled={!fromDate && !toDate}
                      className="w-full bg-[#00A8FF] hover:bg-[#0099E6] text-white text-xs sm:text-sm h-9 sm:h-10"
                    >
                      Apply
                    </Button>

                    {/* Clear Button */}
                    {(fromDate || toDate) && (
                      <Button
                        onClick={handleDateClear}
                        variant="outline"
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm h-9 sm:h-10"
                      >
                        Clear Date Filter
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Claim Type Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "claimType" ? null : "claimType",
                  )
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                  filters.claimType !== "all"
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="url(#typeGradient)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4V8M8 12H8.01"
                    stroke="url(#typeGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  {filters.claimType !== "all"
                    ? formatText(filters.claimType)
                    : "Claim Type"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "claimType" ? "rotate-180" : ""
                  }`}
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
              {activeDropdown === "claimType" && (
                <div className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("claimType", "all");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.claimType === "all"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      All Types
                    </button>
                    {types
                      .filter((type) => type && type.trim() !== "")
                      .map((type) => (
                        <button
                          key={type}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterChange("claimType", type);
                          }}
                          className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                            filters.claimType === type
                              ? "bg-gray-100 text-[#00A8FF]"
                              : ""
                          }`}
                        >
                          {formatText(type)}
                        </button>
                      ))}
                  </div>
                </div>
              )}
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="url(#statusGradient)"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>
                  {filters.status !== "all"
                    ? formatText(filters.status)
                    : "Status"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "status" ? "rotate-180" : ""
                  }`}
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
                <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
                    {statuses
                      .filter((status) => status && status.trim() !== "")
                      .map((status) => (
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

            {/* Priority Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "priority" ? null : "priority",
                  )
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                  filters.priority !== "all"
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="url(#priorityGradient)"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>
                  {filters.priority !== "all"
                    ? formatText(filters.priority)
                    : "Priority"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "priority" ? "rotate-180" : ""
                  }`}
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
              {activeDropdown === "priority" && (
                <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("priority", "all");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.priority === "all"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      All Priorities
                    </button>
                    {priorityLevels
                      .filter((priority) => priority && priority.trim() !== "")
                      .map((priority) => (
                        <button
                          key={priority}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterChange("priority", priority);
                          }}
                          className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                            filters.priority === priority
                              ? "bg-gray-100 text-[#00A8FF]"
                              : ""
                          }`}
                        >
                          {formatText(priority)}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-200 rounded-full text-xs sm:text-sm font-poppins text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4"
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

        {/* Cases Table Card */}
        <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
          <CaseTable table={table} columns={columns} />
        </div>

        {/* Pagination - Outside the card */}
        <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
          <Pagination table={table} />
        </div>
      </div>
    </DashboardShell>
  );
}
