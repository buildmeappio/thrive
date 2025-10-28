"use client";

import { useState, useEffect, useMemo } from "react";
import { TransporterData } from "../types/TransporterData";

export function useTransporterFilters(data: TransporterData[]) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
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

  // Get unique vehicle types from data
  const uniqueVehicleTypes = useMemo(() => {
    const vehicleTypesSet = new Set<string>();
    data.forEach((d) => {
      if (Array.isArray(d.vehicleTypes)) {
        d.vehicleTypes.forEach((v) => vehicleTypesSet.add(v));
      }
    });
    return Array.from(vehicleTypesSet).sort();
  }, [data]);

  // Filter data based on current filters
  const filtered = useMemo(() => {
    let result = data;

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Filter by vehicle type
    if (vehicleTypeFilter !== "all") {
      result = result.filter((d) => {
        if (Array.isArray(d.vehicleTypes)) {
          return d.vehicleTypes.includes(vehicleTypeFilter);
        }
        return d.vehicleTypes === vehicleTypeFilter;
      });
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.companyName, d.contactPerson, d.email, d.vehicleTypes]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, query, statusFilter, vehicleTypeFilter]);

  const handleFilterChange = (
    filterType: "vehicleType" | "status",
    value: string
  ) => {
    if (filterType === "vehicleType") {
      setVehicleTypeFilter(value);
    } else {
      setStatusFilter(value);
    }
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setVehicleTypeFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    vehicleTypeFilter !== "all" || statusFilter !== "all";

  return {
    query,
    setQuery,
    statusFilter,
    vehicleTypeFilter,
    activeDropdown,
    setActiveDropdown,
    uniqueVehicleTypes,
    filtered,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  };
}
