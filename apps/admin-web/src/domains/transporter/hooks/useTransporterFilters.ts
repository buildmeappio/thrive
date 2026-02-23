"use client";

import { useState, useEffect, useMemo } from "react";
import { TransporterData } from "../types/TransporterData";
import { matchesSearch } from "@/utils/search";

export function useTransporterFilters(data: TransporterData[]) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  // Filter data based on current filters
  const filtered = useMemo(() => {
    let result = data;

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Filter by search query
    if (query.trim()) {
      result = result.filter((d) =>
        [d.companyName, d.contactPerson, d.email]
          .filter(Boolean)
          .some((v) => matchesSearch(query, v)),
      );
    }

    return result;
  }, [data, query, statusFilter]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setStatusFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all";

  return {
    query,
    setQuery,
    statusFilter,
    activeDropdown,
    setActiveDropdown,
    filtered,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  };
}
