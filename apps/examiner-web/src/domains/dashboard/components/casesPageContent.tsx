"use client";

import { useState, useEffect } from "react";
import CasesTableWithPagination from "./casesTableWithPagination";
import Pagination from "@/components/Pagination";
import { Funnel } from "lucide-react";
import { CaseRowData } from "../types";

interface FilterState {
  status: string;
}

interface CasesPageContentProps {
  initialData: CaseRowData[];
}

export default function CasesPageContent({
  initialData,
}: CasesPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
    });
  };

  const hasActiveFilters = filters.status !== "all";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        const isInsideDropdown = target.closest(".filter-dropdown");
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

  const { tableElement, pagination } = CasesTableWithPagination({
    data: initialData,
    searchQuery,
    filters,
  });

  return (
    // <DashboardShell>
    <>
      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col gap-3 sm:gap-6 mb-20">
        {/* Search and Filters Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center sm:justify-between">
          {/* Search Bar */}
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
                placeholder="Search by case number, claimant, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
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
                  stroke="url(#statusGradient)"
                />
                <span>
                  {filters.status === "pending"
                    ? "Pending Review"
                    : filters.status === "reportPending"
                      ? "Report Pending"
                      : filters.status === "reportDraft"
                        ? "Report Draft"
                        : filters.status === "reportSubmitted"
                          ? "Report Submitted"
                          : filters.status === "reportApproved"
                            ? "Report Approved"
                            : filters.status === "reportRejected"
                              ? "Report Rejected"
                              : "Status"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
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
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1.5 sm:py-2 max-h-64 overflow-y-auto">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "pending");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.status === "pending"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      Pending Review
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "reportPending");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.status === "reportPending"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      Report Pending
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "reportDraft");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.status === "reportDraft"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      Report Draft
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "reportSubmitted");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.status === "reportSubmitted"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      Report Submitted
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "reportApproved");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.status === "reportApproved"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      Report Approved
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("status", "reportRejected");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.status === "reportRejected"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      Report Rejected
                    </button>
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

        {/* Cases Table Card */}
        <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-3 sm:p-4 md:p-6 w-full">
          {tableElement}
        </div>

        {/* Pagination */}
        <div className="mt-4 px-2 sm:px-4 md:px-6">
          <Pagination {...pagination} />
        </div>
      </div>
      {/* </DashboardShell> */}
    </>
  );
}
