"use client";

import { useState, useEffect } from "react";
import CaseTableWrapper, { CasePagination } from "@/domains/case/components/CaseTableWrapper";
import { CaseData } from "@/domains/case/types/CaseData";
import { DashboardShell } from "@/layouts/dashboard";

interface CasesPageContentProps {
  data: CaseData[];
  types: string[];
  statuses: string[];
  priorityLevels: string[];
}

// Utility function to capitalize first letter of every word
const capitalizeFirstLetter = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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

export default function CasesPageContent({ data, types, statuses, priorityLevels }: CasesPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    claimType: "all",
    status: "all", 
    priority: "all",
    dateRange: {
      start: "",
      end: ""
    }
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    if (filterType === "dateRange") {
      // Handle date range separately
      return;
    }
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setActiveDropdown(null);
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      claimType: "all",
      status: "all",
      priority: "all", 
      dateRange: {
        start: "",
        end: ""
      }
    });
  };

  const hasActiveFilters = filters.claimType !== "all" || 
                          filters.status !== "all" || 
                          filters.priority !== "all" ||
                          filters.dateRange.start || 
                          filters.dateRange.end;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        // Check if the click is outside any dropdown container
        const isInsideDropdown = target.closest('.filter-dropdown');
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <DashboardShell
      title={
        <span className="font-semibold text-[36px] font-degular leading-none tracking-0">
          New Cases
        </span>
      }
    >
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
          <linearGradient id="priorityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col gap-6 mb-20">
        {/* Search and Filters Section - Separate Elements */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar - Separate */}
          <div className="w-full sm:w-auto sm:flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5" fill="none" stroke="url(#searchGradient)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

          {/* Filter Buttons - Separate */}
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Claim Type Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "claimType" ? null : "claimType")}
                className={`flex items-center gap-2 px-6 py-3 bg-white border rounded-full text-sm font-poppins transition-colors ${
                  filters.claimType !== "all" 
                    ? "border-[#00A8FF] text-[#00A8FF]" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" stroke="url(#typeGradient)" strokeWidth="1.5"/>
                  <path d="M8 4V8M8 12H8.01" stroke="url(#typeGradient)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{filters.claimType !== "all" ? capitalizeFirstLetter(filters.claimType) : "Claim Type"}</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === "claimType" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "claimType" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("claimType", "all");
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        filters.claimType === "all" ? "bg-gray-100 text-[#00A8FF]" : ""
                      }`}
                    >
                      All Types
                    </button>
                    {types.map((type) => (
                      <button
                        key={type}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange("claimType", type);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.claimType === type ? "bg-gray-100 text-[#00A8FF]" : ""
                        }`}
                      >
                        {capitalizeFirstLetter(type)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
                className={`flex items-center gap-2 px-6 py-3 bg-white border rounded-full text-sm font-poppins transition-colors ${
                  filters.dateRange.start || filters.dateRange.end
                    ? "border-[#00A8FF] text-[#00A8FF]" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="12" height="10" rx="1" stroke="url(#dateGradient)" strokeWidth="1.5"/>
                  <path d="M5 1V3M11 1V3M2 6H14" stroke="url(#dateGradient)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Date</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === "date" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "date" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => handleDateRangeChange("start", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => handleDateRangeChange("end", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateRangeChange("start", "");
                        handleDateRangeChange("end", "");
                        setActiveDropdown(null);
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      Clear Date Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                className={`flex items-center gap-2 px-6 py-3 bg-white border rounded-full text-sm font-poppins transition-colors ${
                  filters.status !== "all" 
                    ? "border-[#00A8FF] text-[#00A8FF]" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="url(#statusGradient)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{filters.status !== "all" ? capitalizeFirstLetter(filters.status) : "Status"}</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === "status" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "status" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "all");
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        filters.status === "all" ? "bg-gray-100 text-[#00A8FF]" : ""
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
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.status === status ? "bg-gray-100 text-[#00A8FF]" : ""
                        }`}
                      >
                        {capitalizeFirstLetter(status)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Priority Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")}
                className={`flex items-center gap-2 px-6 py-3 bg-white border rounded-full text-sm font-poppins transition-colors ${
                  filters.priority !== "all" 
                    ? "border-[#00A8FF] text-[#00A8FF]" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="url(#priorityGradient)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>{filters.priority !== "all" ? capitalizeFirstLetter(filters.priority) : "Priority"}</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === "priority" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === "priority" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("priority", "all");
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        filters.priority === "all" ? "bg-gray-100 text-[#00A8FF]" : ""
                      }`}
                    >
                      All Priorities
                    </button>
                    {priorityLevels.map((priority) => (
                      <button
                        key={priority}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange("priority", priority);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.priority === priority ? "bg-gray-100 text-[#00A8FF]" : ""
                        }`}
                      >
                        {capitalizeFirstLetter(priority)}
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
                className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-full text-sm font-poppins text-red-600 hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Cases Table Card */}
        <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
          <CaseTableWrapper 
            data={data} 
            types={types} 
            statuses={statuses} 
            searchQuery={searchQuery}
            filters={filters}
            priorityLevels={priorityLevels}
          />
        </div>

        {/* Pagination - Outside the table card */}
        <CasePagination 
          data={data} 
          types={types} 
          statuses={statuses} 
          searchQuery={searchQuery}
          filters={filters}
          priorityLevels={priorityLevels}
        />
      </div>
    </DashboardShell>
  );
}
