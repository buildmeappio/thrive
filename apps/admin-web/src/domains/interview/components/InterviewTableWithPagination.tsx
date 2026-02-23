"use client";

import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { InterviewTableProps, ColumnMeta } from "../types/table.types";

const InterviewTable = ({ table, columns }: InterviewTableProps) => {
  return (
    <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
      <Table className="w-full border-0 table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
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
                      "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
                      header.index === 0 && "rounded-l-2xl",
                      header.index === headerGroup.headers.length - 1 &&
                        "rounded-r-2xl",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-white border-0 border-b"
              >
                {row.getVisibleCells().map((cell) => {
                  const column = cell.column.columnDef;
                  const meta = (column.meta as ColumnMeta) || {};
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: meta.minSize
                          ? `${meta.minSize}px`
                          : undefined,
                        maxWidth: meta.maxSize
                          ? `${meta.maxSize}px`
                          : undefined,
                        width: meta.size ? `${meta.size}px` : undefined,
                      }}
                      className="px-6 py-3 overflow-hidden align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-black font-poppins text-[16px] leading-normal"
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
