'use client';

import { useMemo, useEffect, useState } from 'react';
import { matchesSearch } from '@/utils/search';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import type { UseInterviewTableOptions, UseInterviewTableReturn } from '../types/table.types';
import { createColumns } from '../components/columns';
import { formatText, formatDateTime, formatTimeRange } from '../utils/format';

export const useInterviewTable = (props: UseInterviewTableOptions): UseInterviewTableReturn => {
  const { data, searchQuery, filters } = props;

  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      result = result.filter(d => d.status === filters.status);
    }

    // Filter by date range
    if (filters?.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) {
        result = result.filter(d => {
          const interviewDate = new Date(d.startTime);
          const startDate = new Date(start);
          startDate.setHours(0, 0, 0, 0);
          return interviewDate >= startDate;
        });
      }
      if (end) {
        result = result.filter(d => {
          const interviewDate = new Date(d.startTime);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          return interviewDate <= endDate;
        });
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(d =>
        [
          d.examinerName,
          formatDateTime(d.startTime),
          formatTimeRange(d.startTime, d.endTime),
          formatText(d.status),
        ]
          .filter(Boolean)
          .some(v => matchesSearch(searchQuery, v))
      );
    }

    return result;
  }, [data, searchQuery, filters]);

  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return {
    table,
    columns,
  };
};
