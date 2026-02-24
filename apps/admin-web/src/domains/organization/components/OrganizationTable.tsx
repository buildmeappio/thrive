'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { OrganizationData } from '../types/OrganizationData';
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
import columnsDef from './columns';
import { cn } from '@/lib/utils';

type Props = { data: OrganizationData[]; types?: string[] };

export default function OrganizationTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    return data;
  }, [data]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [table]);

  return (
    <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none">
      <Table className="min-w-[1000px] border-0">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-medium text-gray-700',
                    header.index === 0 && 'rounded-l-xl',
                    header.index === headerGroup.headers.length - 1 && 'rounded-r-xl'
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
                  <TableCell key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnsDef.length}
                className="font-poppins h-24 text-center text-[16px] leading-none text-black"
              >
                No Organizations Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
