'use client';

import React, { useEffect, useState } from 'react';
import { TransporterData } from '@/domains/transporter/types/TransporterData';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import TransporterHeader from './TransporterHeader';
import SearchAndFilters from './SearchAndFilters';
import TransporterTable from './TransporterTable';
import { useTransporterFilters } from '../hooks/useTransporterFilters';
import columns from './columns';
import Pagination from '@/components/Pagination';

interface TransporterPageContentProps {
  data: TransporterData[];
  statuses: string[];
}

export default function TransporterPageContent({ data, statuses }: TransporterPageContentProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20, // Show 20 records per page instead of default 10
  });

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
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: updater => {
      setPagination(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        // Reset to page 0 if page size changed
        if (next.pageSize !== prev.pageSize) {
          return { ...next, pageIndex: 0 };
        }
        return next;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // Client-side pagination
  });

  // Reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [query, statusFilter, table]);

  // Ensure page index is valid when filtered data changes
  useEffect(() => {
    const maxPageIndex = table.getPageCount() - 1;
    if (pagination.pageIndex > maxPageIndex && maxPageIndex >= 0) {
      table.setPageIndex(maxPageIndex);
    }
  }, [filtered.length, pagination.pageIndex, table]);

  return (
    <div className="transporter-page space-y-6">
      <div className="dashboard-zoom-mobile mb-4 sm:mb-6">
        <TransporterHeader />
      </div>

      <div className="dashboard-zoom-mobile mb-20 flex flex-col gap-3 sm:gap-6">
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
        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      </div>
    </div>
  );
}
