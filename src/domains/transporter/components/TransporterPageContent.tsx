"use client";

import React, { useEffect, useState } from "react";
import { TransporterData } from "@/domains/transporter/types/TransporterData";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import TransporterHeader from "./TransporterHeader";
import SearchAndFilters from "./SearchAndFilters";
import TransporterTable from "./TransporterTable";
import { useTransporterFilters } from "../hooks/useTransporterFilters";
import columns from "./columns";

interface TransporterPageContentProps {
  data: TransporterData[];
  statuses: string[];
}

export default function TransporterPageContent({
  data,
  statuses,
}: TransporterPageContentProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Use custom hook for filter management
  const {
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
  } = useTransporterFilters(data);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [query, statusFilter, vehicleTypeFilter, table]);

  return (
    <div className="space-y-6">
      <TransporterHeader />

      <SearchAndFilters
        query={query}
        onQueryChange={setQuery}
        vehicleTypeFilter={vehicleTypeFilter}
        onVehicleTypeChange={(value) =>
          handleFilterChange("vehicleType", value)
        }
        statusFilter={statusFilter}
        onStatusChange={(value) => handleFilterChange("status", value)}
        uniqueVehicleTypes={uniqueVehicleTypes}
        statuses={statuses}
        activeDropdown={activeDropdown}
        onDropdownToggle={setActiveDropdown}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <TransporterTable table={table} />
    </div>
  );
}
