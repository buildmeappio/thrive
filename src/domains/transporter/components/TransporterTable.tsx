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
      <div className="overflow-hidden rounded-md outline-none">
        <Table className="border-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-[#F3F3F3] border-b-0"
                key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-6 text-left text-base font-medium text-black whitespace-nowrap",
                      header.index === 0 && "rounded-l-2xl",
                      header.index === headerGroup.headers.length - 1 &&
                        "rounded-r-2xl w-[60px]"
                    )}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-black font-poppins text-[16px] leading-none">
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
