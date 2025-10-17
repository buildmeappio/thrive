"use client";

import React, { useEffect, useMemo } from "react";
import { OrganizationData } from "../types/OrganizationData";
import {
  flexRender, getCoreRowModel, getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import columnsDef from "./columns";
import { cn } from "@/lib/utils";

type Props = { data: OrganizationData[]; types?: string[] };


export default function OrganizationTable({ data }: Props) {
  const filtered = useMemo(() => {
    return data;
  }, [data]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [table]);

  return (
    <div className="overflow-hidden rounded-md outline-none">
      <Table className="border-0">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "px-6 py-4 text-left text-sm font-medium text-gray-700",
                    header.index === 0 && "rounded-l-xl",
                    header.index === headerGroup.headers.length - 1 &&
                    "rounded-r-xl"
                  )}
                >
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
                className="bg-white border-0 border-b-1"
              >
                {row.getVisibleCells().map((cell) => (
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
                className="h-24 text-center text-black font-poppins text-[16px] leading-none"
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

