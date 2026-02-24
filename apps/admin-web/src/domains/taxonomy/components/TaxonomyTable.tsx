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
import { createTaxonomyColumns } from './TaxonomyColumns';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import { TaxonomyData, TaxonomyType } from '../types/Taxonomy';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TaxonomyTableProps = {
  taxonomyList: TaxonomyData[];
  displayFields: string[];
  searchFields: string[];
  onEdit: (taxonomy: TaxonomyData) => void;
  onDelete: (taxonomy: TaxonomyData) => void;
  onCreate: () => void;
  singularName: string;
  type: TaxonomyType;
};

const TaxonomyTable = ({
  taxonomyList,
  displayFields,
  searchFields,
  onEdit,
  onDelete,
  onCreate,
  singularName,
  type,
}: TaxonomyTableProps) => {
  const [query, setQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return taxonomyList.filter(taxonomy => {
      if (!q) return true;

      const hit = searchFields
        .map(field => taxonomy[field])
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));

      return hit;
    });
  }, [taxonomyList, query, searchFields]);

  const columns = useMemo(
    () => createTaxonomyColumns(displayFields, onEdit, onDelete, type),
    [displayFields, onEdit, onDelete, type]
  );

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
  }, [query, table]);

  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 md:max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5"
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
              placeholder={`Search ${singularName.toLowerCase()}s...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="font-poppins w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
          </div>
        </div>

        {/* Add Button */}
        <Button
          onClick={onCreate}
          className="hidden h-[50px] min-w-[100px] cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] sm:flex"
        >
          <Plus size={20} />
          <span className="text-[16px]">Add {singularName}</span>
        </Button>
      </div>

      <div className="mt-6 w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
        <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none lg:max-h-none">
          <Table className="min-w-[1000px] border-0">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      style={{
                        maxWidth: header.column.columnDef.maxSize
                          ? `${header.column.columnDef.maxSize}px`
                          : undefined,
                        width: header.column.columnDef.size
                          ? `${header.column.columnDef.size}px`
                          : undefined,
                      }}
                      className={cn(
                        'whitespace-nowrap px-6 text-left text-base font-medium text-black',
                        index === 0 && 'rounded-l-2xl',
                        index === headerGroup.headers.length - 1 && 'rounded-r-2xl'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-b-1 border-0 bg-white"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{
                          maxWidth: cell.column.columnDef.maxSize
                            ? `${cell.column.columnDef.maxSize}px`
                            : undefined,
                          width: cell.column.columnDef.size
                            ? `${cell.column.columnDef.size}px`
                            : undefined,
                        }}
                        className="px-6"
                      >
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
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p>No {singularName.toLowerCase()}s found</p>
                      {query && (
                        <button
                          onClick={() => setQuery('')}
                          className="text-sm text-[#000093] hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      )}
    </>
  );
};

export default TaxonomyTable;
