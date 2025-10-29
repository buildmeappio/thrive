"use client";

import React from "react";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TransporterData } from "../types/TransporterData";
import columns from "./columns";

interface TransporterTableProps {
  table: ReactTable<TransporterData>;
}

export default function TransporterTable({ table }: TransporterTableProps) {
  return (
    <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
      <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
        <Table className="w-full border-0 table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-[#F3F3F3] border-b-0"
                key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnDef = columns[header.index];
                  const minWidth = columnDef?.minSize || "auto";
                  const maxWidth = columnDef?.maxSize || "auto";
                  const width = columnDef?.size || "auto";
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth:
                          typeof minWidth === "number"
                            ? `${minWidth}px`
                            : minWidth,
                        maxWidth:
                          typeof maxWidth === "number"
                            ? `${maxWidth}px`
                            : maxWidth,
                        width: typeof width === "number" ? `${width}px` : width,
                      }}
                      className={cn(
                        "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
                        header.index === 0 && "rounded-l-2xl",
                        header.index === headerGroup.headers.length - 1 &&
                          "rounded-r-2xl"
                      )}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                  className="bg-white border-0 border-b-1">
                  {row.getVisibleCells().map((cell) => {
                    const columnIndex = cell.column.getIndex();
                    const columnDef = columns[columnIndex];
                    const minWidth = columnDef?.minSize || "auto";
                    const maxWidth = columnDef?.maxSize || "auto";
                    const width = columnDef?.size || "auto";
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          minWidth:
                            typeof minWidth === "number"
                              ? `${minWidth}px`
                              : minWidth,
                          maxWidth:
                            typeof maxWidth === "number"
                              ? `${maxWidth}px`
                              : maxWidth,
                          width:
                            typeof width === "number" ? `${width}px` : width,
                        }}
                        className="px-6 py-3 overflow-hidden align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
                  className="h-24 text-center text-black font-poppins text-[16px] leading-normal">
                  No Transporters Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
