// domains/case/components/CaseTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CaseData } from "../types/CaseData";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import columns from "./columns";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import FilterBar, { FilterConfig, FilterOption } from "@/components/ui/FilterBar";

type Props = {
  data: CaseData[];
  statuses: string[];     // e.g. ["New","In Review","Closed"] or your CaseStatus names
  types: string[];        // CaseType names from DB
  urgencies?: string[];   // default to ["HIGH","MEDIUM","LOW"]
};

const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, m => m.toUpperCase());

export default function CaseTable({ data, statuses, types, urgencies = ["HIGH", "MEDIUM", "LOW"] }: Props) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // fixed options from DB + enum
  const statusOptions: FilterOption[] = useMemo(
    () => [{ label: "All Statuses", value: "ALL" }, ...statuses.map(s => ({ label: s, value: s }))],
    [statuses]
  );
  const typeOptions: FilterOption[] = useMemo(
    () => [{ label: "All Types", value: "ALL" }, ...types.map(t => ({ label: pretty(t), value: t }))],
    [types]
  );
  const urgencyOptions: FilterOption[] = useMemo(
    () => [{ label: "All Urgencies", value: "ALL" }, ...urgencies.map(u => ({ label: pretty(u), value: u }))],
    [urgencies]
  );

  // pending vs applied
  const [pending, setPending] = useState<Record<string, string>>({
    status: "ALL",
    type: "ALL",
    urgency: "ALL",
  });
  const [applied, setApplied] = useState<Record<string, string>>(pending);

  const applyAll = () => setApplied({ ...pending });
  const clearAll = () => {
    const cleared = { status: "ALL", type: "ALL", urgency: "ALL" };
    setPending(cleared);
    setApplied(cleared);
    setQuery("");
  };

  const configs: FilterConfig[] = [
    { key: "status", label: "Status", options: statusOptions },
    { key: "type", label: "Type", options: typeOptions },
    { key: "urgency", label: "Urgency", options: urgencyOptions },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      const statusOk = applied.status === "ALL" || d.status === applied.status;
      const typeOk = applied.type === "ALL" || d.caseType === applied.type;
      const urgentOk = applied.urgency === "ALL" || d.urgencyLevel === applied.urgency;

      if (!q) return statusOk && typeOk && urgentOk;

      const hit = [
        d.number, d.claimant, d.organization, d.caseType,
        d.status, d.urgencyLevel, d.reason, d.examinerId,
        new Date(d.submittedAt).toLocaleString(),
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));

      return statusOk && typeOk && urgentOk && hit;
    });
  }, [data, query, applied]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => { table.setPageIndex(0); }, [query, applied]); // reset page

  return (
    <div className="overflow-hidden rounded-md outline-none">
      {/* Row 1: Search */}
      <div className="mb-3 flex">
        <div className="ml-auto w-full sm:w-[26rem]">
          <SearchInput value={query} onChange={setQuery} placeholder="Search cases…" />
        </div>
      </div>

      {/* Row 2: Filters with single Apply + Clear */}
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
                const sort = h.column.getIsSorted(); // false | 'asc' | 'desc'
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
                        <span className="text-xs text-gray-500">{sort === "asc" ? "▲" : sort === "desc" ? "▼" : ""}</span>
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
              <TableCell colSpan={columns.length} className="h-24 text-center text-black font-poppins text-[16px] leading-none">
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
