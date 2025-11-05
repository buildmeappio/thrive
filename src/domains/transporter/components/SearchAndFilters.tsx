"use client";

import React from "react";
import { Filter } from "lucide-react";
import FilterDropdown from "./FilterDropdown";

interface SearchAndFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statuses: string[];
  activeDropdown: string | null;
  onDropdownToggle: (dropdown: string | null) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function SearchAndFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  statuses,
  activeDropdown,
  onDropdownToggle,
  hasActiveFilters,
  onClearFilters,
}: SearchAndFiltersProps) {
  const statusOptions = statuses.map((status) => ({
    value: status,
    label:
      status === "ACTIVE"
        ? "Active"
        : status === "SUSPENDED"
        ? "Suspended"
        : status,
  }));

  return (
    <>
      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
          <linearGradient id="typeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center sm:justify-between">
        {/* Search Bar - Full width on mobile */}
        <div className="flex-1 sm:max-w-md w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="url(#searchGradient)"
                viewBox="0 0 24 24">
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
              placeholder="Search by transporters"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Buttons - Wrap on mobile */}
        <div className="flex flex-wrap gap-2 sm:gap-3 flex-shrink-0">
          {/* Status Filter */}
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={statusOptions}
            isOpen={activeDropdown === "status"}
            onToggle={() =>
              onDropdownToggle(activeDropdown === "status" ? null : "status")
            }
            onChange={onStatusChange}
            icon={
              <Filter
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                style={{ stroke: "url(#statusGradient)" }}
              />
            }
            gradientId="statusGradient"
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-200 rounded-full text-xs sm:text-sm font-poppins text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
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
    </>
  );
}
