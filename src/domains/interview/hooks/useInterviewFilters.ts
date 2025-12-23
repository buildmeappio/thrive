"use client";

import { useState, useEffect } from "react";
import type { FilterState } from "../types/table.types";

export type ViewMode = "table" | "calendar";

const initialFilters: FilterState = {
  status: "all",
  dateRange: {
    start: "",
    end: "",
  },
};

export const useInterviewFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const handleDateRangeApply = (dateRange: { start: string; end: string }) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
    }));
  };

  const handleDateRangeClear = () => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        start: "",
        end: "",
      },
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

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

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    activeDropdown,
    setActiveDropdown,
    viewMode,
    setViewMode,
    handleFilterChange,
    handleDateRangeApply,
    handleDateRangeClear,
    clearFilters,
  };
};
