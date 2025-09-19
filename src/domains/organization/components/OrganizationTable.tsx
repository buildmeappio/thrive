"use client";

import React, { useEffect, useMemo, useState } from "react";
import { OrganizationData } from "../types/OrganizationData";
import {
  flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
  SortingState, useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import columnsDef from "./columns";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import FilterBar, { FilterConfig, FilterOption } from "@/components/ui/FilterBar";

type Props = { data: OrganizationData[]; types?: string[] };

const STATUS_OPTIONS: FilterOption[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

const prettyType = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export default function OrganizationTable({ data, types = [] }: Props) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const typeOptions: FilterOption[] = useMemo(
    () => [{ label: "All Types", value: "ALL" }, ...types.map((t) => ({ label: prettyType(t), value: t }))],
    [types]
  );

  const [pending, setPending] = useState<Record<string, string>>({ status: "ALL", type: "ALL" });
  const [applied, setApplied] = useState<Record<string, string>>({ status: "ALL", type: "ALL" });

  const applyAll = () => setApplied({ ...pending });
  const clearAll = () => {
    setPending({ status: "ALL", type: "ALL" });
    setApplied({ status: "ALL", type: "ALL" });
    setQuery("");
  };

  const configs: FilterConfig[] = [
    { key: "status", label: "Status", options: STATUS_OPTIONS },
    { key: "type", label: "Type", options: typeOptions },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      const statusOk = applied.status === "ALL" || d.status === applied.status;
      const typeOk = applied.type === "ALL" || d.typeName === applied.type;
      if (!q) return statusOk && typeOk;
      const hit = [d.name, d.address, d.status, d.typeName, d.managerName, d.website]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      return statusOk && typeOk && hit;
    });
  }, [data, query, applied]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => { table.setPageIndex(0); }, [query, applied]); // eslint-disable-line

  return (
    <div className="overflow-hidden rounded-md outline-none">
      {/* Row 1: search */}
      <div className="mb-3 flex">
        <div className="ml-auto w-full sm:w-[26rem]">
          <SearchInput value={query} onChange={setQuery} placeholder="Search organizations…" />
        </div>
      </div>

      {/* Row 2: filters */}
      <FilterBar
        configs={configs}
        pending={pending}
        setPending={setPending}
        onApply={applyAll}
        onClear={clearAll}
        className="mb-4"
      />

      <Table className="border-0">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={hg.id}>
              {hg.headers.map((h) => {
                const isSortable = h.column.getCanSort();
                const sort = h.column.getIsSorted();
                return (
                  <TableHead
                    key={h.id}
                    onClick={isSortable ? h.column.getToggleSortingHandler() : undefined}
                    className={cn(
                      "select-none",
                      h.index === 0 && "rounded-l-xl",
                      h.index === hg.headers.length - 1 && "rounded-r-xl w-[60px]",
                      isSortable && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      {isSortable && (
                        <span className="text-xs text-gray-500">
                          {sort === "asc" ? "▲" : sort === "desc" ? "▼" : ""}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="bg-white border-0 border-b-1">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-black font-poppins text-[16px] leading-none">
                No Organizations Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className="p-0">
              <Pagination table={table} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
