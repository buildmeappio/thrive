'use client';

import { flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { InterviewTableProps, ColumnMeta } from '../types/table.types';

const InterviewTable = ({ table, columns }: InterviewTableProps) => {
  return (
    <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
      <Table className="w-full table-fixed border-0">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const column = header.column.columnDef;
                const meta = (column.meta as ColumnMeta) || {};
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                      maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                      width: meta.size ? `${meta.size}px` : undefined,
                    }}
                    className={cn(
                      'overflow-hidden whitespace-nowrap px-6 py-2 text-left text-base font-medium text-black',
                      header.index === 0 && 'rounded-l-2xl',
                      header.index === headerGroup.headers.length - 1 && 'rounded-r-2xl'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                className="border-0 border-b bg-white"
              >
                {row.getVisibleCells().map(cell => {
                  const column = cell.column.columnDef;
                  const meta = (column.meta as ColumnMeta) || {};
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                        maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                        width: meta.size ? `${meta.size}px` : undefined,
                      }}
                      className="overflow-hidden px-6 py-3 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="font-poppins h-24 text-center text-[16px] leading-normal text-black"
              >
                No Interviews Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InterviewTable;
