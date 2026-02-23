'use client';

import * as React from 'react';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, Filter, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { columns } from './ColDefs';
import { Case } from '@/domains/ime-referral/types/Case';

interface ReferralListProps {
  referrals?: Case[];
}

const ReferralList = ({ referrals }: ReferralListProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Use provided referrals data or empty array if none
  const data = referrals || [];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="relative z-10">
          <div className="space-y-3">
            <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
              IME Referrals
            </h2>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-3 lg:flex-1 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              {/* Global Search */}
              <div className="relative max-w-sm flex-1 lg:max-w-md">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search cases, claimants, insurance..."
                  value={globalFilter ?? ''}
                  onChange={event => setGlobalFilter(event.target.value)}
                  className="border-gray-200 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Claimant Name Filter */}
              <div className="relative flex-shrink-0">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Filter by claimant..."
                  value={(table.getColumn('claimantName')?.getFilterValue() as string) ?? ''}
                  onChange={event =>
                    table.getColumn('claimantName')?.setFilterValue(event.target.value)
                  }
                  className="w-full border-gray-200 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 lg:w-48"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-gray-200">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup: { id: any; headers: any[] }) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-100"
                  >
                    {headerGroup.headers.map(
                      (header: {
                        id: any;
                        isPlaceholder: any;
                        column: { columnDef: { header: any } };
                        getContext: () => any;
                      }) => {
                        return (
                          <TableHead
                            key={header.id}
                            className="py-4 text-sm font-semibold text-gray-700"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      }
                    )}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map(
                      (
                        row: { id: any; getIsSelected: () => any; getVisibleCells: () => any[] },
                        index
                      ) => (
                        <TableRow
                          key={row.id}
                          className={`group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} `}
                        >
                          {row
                            .getVisibleCells()
                            .map(
                              (cell: {
                                id: any;
                                column: { columnDef: { cell: any } };
                                getContext: () => any;
                              }) => (
                                <TableCell key={cell.id} className="py-4 text-gray-700">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              )
                            )}
                        </TableRow>
                      )
                    )
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
                        <div className="rounded-full bg-gray-100 p-3">
                          <User className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">No referrals found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium whitespace-nowrap text-gray-700">Rows per page</p>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="h-9 w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing{' '}
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
                to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length
                )}{' '}
                of {data.length} results
              </div>
            </div>

            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6">
              <div className="text-center text-sm font-medium text-gray-600 lg:text-left">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>

              <div className="flex items-center justify-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="border-gray-200 px-2 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="border-gray-200 px-2 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="border-gray-200 px-2 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="border-gray-200 px-2 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralList;
