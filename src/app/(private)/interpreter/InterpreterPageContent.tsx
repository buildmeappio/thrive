"use client";

import { useState, useEffect, useMemo } from "react";
import InterpreterTable, {
  useInterpreterTable,
} from "@/domains/interpreter/components/InterpreterTableWrapper";
import Pagination from "@/components/Pagination";
import { InterpreterData } from "@/domains/interpreter/types/InterpreterData";
import { DashboardShell } from "@/layouts/dashboard";
import { Funnel } from "lucide-react";
import type { Language } from "@prisma/client";
import Link from "next/link";
import { filterUUIDLanguages } from "@/utils/languageUtils";

interface InterpreterPageContentProps {
  data: InterpreterData[];
  languages: Language[];
}

interface FilterState {
  languageId: string;
}

export default function InterpreterPageContent({
  data,
  languages,
}: InterpreterPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    languageId: "all",
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter out UUID languages - only show languages with valid names
  const validLanguages = useMemo(() => {
    return filterUUIDLanguages(languages).filter(
      (lang) => lang.name && lang.name.trim() !== "",
    );
  }, [languages]);

  // Reset filter if selected language is not in valid languages
  useEffect(() => {
    if (
      filters.languageId !== "all" &&
      !validLanguages.find((l) => l.id === filters.languageId)
    ) {
      setFilters((prev) => ({ ...prev, languageId: "all" }));
    }
  }, [validLanguages, filters.languageId]);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      languageId: "all",
    });
  };

  const hasActiveFilters = filters.languageId !== "all";

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

  // Get table and columns from the hook
  const { table, columns } = useInterpreterTable({
    data,
    searchQuery,
    filters,
  });

  return (
    <DashboardShell>
      {/* Interpreters Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex justify-between items-center">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Interpreters
        </h1>
        <Link
          href="/interpreter/new"
          className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 transition-opacity"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-xs sm:text-sm lg:text-base font-medium">
            Add Interpreter
          </span>
        </Link>
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient
            id="languageGradient"
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
        {/* Search and Filters Section */}
        <div className="flex flex-row gap-2 sm:gap-4 items-center sm:justify-between">
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
                placeholder="Search by company, contact, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            {/* Language Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "language" ? null : "language",
                  )
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                  filters.languageId !== "all"
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Funnel
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  stroke="url(#languageGradient)"
                />
                <span>
                  {filters.languageId !== "all"
                    ? validLanguages.find((l) => l.id === filters.languageId)
                        ?.name || "Language"
                    : "Language"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeDropdown === "language" ? "rotate-180" : ""}`}
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
              {activeDropdown === "language" && (
                <div className="absolute top-full right-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("languageId", "all");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.languageId === "all"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      All Languages
                    </button>
                    {validLanguages.map((language) => (
                      <button
                        key={language.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange("languageId", language.id);
                        }}
                        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                          filters.languageId === language.id
                            ? "bg-gray-100 text-[#00A8FF]"
                            : ""
                        }`}
                      >
                        {language.name}
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

        {/* Interpreters Table Card */}
        <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
          <InterpreterTable table={table} columns={columns} />
        </div>

        {/* Pagination */}
        <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
          <Pagination table={table} />
        </div>
      </div>
    </DashboardShell>
  );
}
