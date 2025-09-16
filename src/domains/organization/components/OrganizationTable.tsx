"use client";

import React, { useEffect, useMemo, useState } from "react";
import { OrganizationData } from "../types/OrganizationData";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import columns from "./columns";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";

interface OrganizationTableProps {
  data: OrganizationData[];
}

export default function OrganizationTable({ data }: OrganizationTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      [
        d.name,
        d.address,
        d.status,
        d.managerName,
        d.typeName,
        d.website,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, query]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching
  useEffect(() => {
    table.setPageIndex(0);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="overflow-hidden rounded-md o  utline-none">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search Organizations…"
        count={filtered.length}
        className="mb-4"
      />

      <Table className="border-0">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.index === 0 && "rounded-l-xl",
                    header.index === headerGroup.headers.length - 1 &&
                    "rounded-r-xl w-[60px]"
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
                className="h-24 text-center text-black font-poppins text-[16px] leading-none"
              >
                No Cases Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length} className="p-0">
              <Pagination table={table} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
