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
import Pagination from "@/components/Pagination";

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
    activeDropdown,
    setActiveDropdown,
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
  }, [query, statusFilter, table]);

  return (
    <div className="space-y-6">
      <TransporterHeader />

      <SearchAndFilters
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusChange={handleFilterChange}
        statuses={statuses}
        activeDropdown={activeDropdown}
        onDropdownToggle={setActiveDropdown}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <TransporterTable table={table} />

      {/* Pagination - Outside the table card */}
      <div className="mt-4 px-6">
        <Pagination table={table} />
      </div>
    </div>
  );
}
