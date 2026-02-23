'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import columns from './Columns';
import { cn } from '@/lib/utils';
import { FilterOption } from '@/components/FilterBar';
import LabeledSelect from '@/components/LabeledSelect';
import Pagination from '@/components/Pagination';
import { CaseData } from '../../types/CaseData';
import SearchInput from '@/components/SearchInput';
import DateRangePicker from '@/components/DateRangePicker';
import { ArrowRight, Filter, Info, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/dateTime';
import { getCaseStatuses, getCaseTypes, getClaimTypes } from '../../actions';

type CaseTableProps = {
  caseList: CaseData[];
  caseStatuses: Awaited<ReturnType<typeof getCaseStatuses>>['result'];
  claimTypes: Awaited<ReturnType<typeof getClaimTypes>>['result'];
  caseTypes: Awaited<ReturnType<typeof getCaseTypes>>['result'];
};

const CaseTable = ({ caseList, caseStatuses, claimTypes, caseTypes }: CaseTableProps) => {
  const [query, setQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>();

  const statusOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Status', value: 'ALL' },
      ...(caseStatuses?.map(s => ({ label: s.name, value: s.name })) || []),
    ],
    [caseStatuses]
  );

  const typeOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Claim Types', value: 'ALL' },
      ...(claimTypes?.map(t => ({ label: t.name, value: t.name })) || []),
    ],
    [claimTypes]
  );

  const specialtyOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Specialties', value: 'ALL' },
      ...(caseTypes?.map(s => ({ label: s.name, value: s.name })) || []),
    ],
    [caseTypes]
  );

  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'ALL',
    claimType: 'ALL',
    specialty: 'ALL',
  });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      query !== '' ||
      filters.status !== 'ALL' ||
      filters.claimType !== 'ALL' ||
      filters.specialty !== 'ALL' ||
      dateRange?.from !== undefined
    );
  }, [query, filters, dateRange]);

  // Clear all filters function
  const clearAllFilters = () => {
    setQuery('');
    setFilters({
      status: 'ALL',
      claimType: 'ALL',
      specialty: 'ALL',
    });
    setDateRange(undefined);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return caseList.filter(d => {
      const statusOk = filters.status === 'ALL' || d.status === filters.status;
      const typeOk = filters.claimType === 'ALL' || d.claimType === filters.claimType;
      const specialtyOk = filters.specialty === 'ALL' || d.specialty === filters.specialty;

      let dateOk = true;
      if (dateRange?.from) {
        const submittedDate = new Date(d.submittedAt);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          dateOk = submittedDate >= fromDate && submittedDate <= toDate;
        } else {
          dateOk = submittedDate >= fromDate;
        }
      }

      if (!q) return statusOk && typeOk && specialtyOk && dateOk;

      const hit = [d.number, d.claimant, d.claimType, d.status, d.specialty, d.submittedAt]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));

      return statusOk && typeOk && specialtyOk && dateOk && hit;
    });
  }, [caseList, query, filters, dateRange]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [query, filters, dateRange, table]);

  return (
    <div className="rounded-md outline-none">
      {/* Filters */}
      <div className="mb-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full flex-1 sm:w-auto">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by case" />
        </div>
        <div className="w-full flex-shrink-0 sm:w-auto">
          <LabeledSelect
            label="Specialty"
            value={filters.specialty ?? 'ALL'}
            onChange={v => setFilters({ ...filters, specialty: v })}
            options={specialtyOptions}
            icon={<Plus className="h-4 w-4 flex-shrink-0 text-blue-900" strokeWidth={2} />}
          />
        </div>
        <div className="w-full flex-shrink-0 sm:w-auto">
          <LabeledSelect
            label="Claim Type"
            value={filters.claimType ?? 'ALL'}
            onChange={v => setFilters({ ...filters, claimType: v })}
            options={typeOptions}
            icon={<Info className="h-4 w-4 flex-shrink-0 text-blue-900" strokeWidth={2} />}
          />
        </div>
        <div className="w-full flex-shrink-0 sm:w-auto">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="w-full flex-shrink-0 sm:w-auto">
          <LabeledSelect
            label="Status"
            value={filters.status ?? 'ALL'}
            onChange={v => setFilters({ ...filters, status: v })}
            options={statusOptions}
            icon={<Filter className="h-4 w-4 flex-shrink-0 text-blue-900" strokeWidth={2} />}
          />
        </div>

        {hasActiveFilters && (
          <div className="w-full flex-shrink-0 sm:w-auto">
            <button
              onClick={clearAllFilters}
              className="flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[30px] border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full max-w-full overflow-hidden rounded-[27px] border-[1.18px] border-[#EAEAEA] bg-white p-3 sm:p-6">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <Table className="rounded-3xl border-none">
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow className="border-none bg-[#F3F3F3] hover:bg-[#F3F3F3]" key={hg.id}>
                  {hg.headers.map(h => {
                    return (
                      <TableHead
                        key={h.id}
                        className={cn(
                          'select-none',
                          h.index === 0 && 'rounded-l-[13px]',
                          h.index === hg.headers.length - 1 && 'w-[60px] rounded-r-[13px]'
                        )}
                      >
                        <div className="flex items-center gap-1 text-[#000000]">
                          {!h.isPlaceholder &&
                            flexRender(h.column.columnDef.header, h.getContext())}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-0 border-b-1 bg-white"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="font-poppins h-24 text-center text-[16px] leading-none text-black"
                  >
                    No Cases Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="relative w-full overflow-x-hidden md:hidden">
          <div className="w-full space-y-4 px-3">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => {
                const data = row.original;
                return (
                  <div
                    key={row.id}
                    className="w-full space-y-3 overflow-hidden rounded-[13px] bg-[#F3F3F3] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-poppins mb-1 text-[#000000]">Case No.</p>
                        <p className="font-poppins truncate text-[16px] font-semibold text-black">
                          {data.number}
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/cases/${data.id}`}
                        className="flex-shrink-0 cursor-pointer"
                      >
                        <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] hover:opacity-80">
                          <ArrowRight className="h-4 w-4 text-[#000093]" />
                        </div>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <p className="font-poppins mb-1 text-[12px] text-[#4D4D4D]">Claimant</p>
                        <p className="font-poppins text-[14px] break-words text-black">
                          {data.claimant}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins mb-1 text-[12px] text-[#4D4D4D]">Date</p>
                        <p className="font-poppins text-[14px] break-words text-black">
                          {formatDate(data.submittedAt)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins mb-1 text-[12px] text-[#4D4D4D]">Claim Type</p>
                        <p className="font-poppins text-[14px] break-words text-black">
                          {data.claimType}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins mb-1 text-[12px] text-[#4D4D4D]">Specialty</p>
                        <p className="font-poppins text-[14px] break-words text-black">
                          {data.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="font-poppins mb-1 text-[12px] text-[#4D4D4D]">Status</p>
                      <p className="font-poppins text-[14px] break-words text-black">
                        {data.status}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="font-poppins flex h-24 items-center justify-center text-center text-[16px] leading-none text-black">
                No Cases Found
              </div>
            )}
          </div>
        </div>
      </div>
      <Pagination table={table} />
    </div>
  );
};

export default CaseTable;
