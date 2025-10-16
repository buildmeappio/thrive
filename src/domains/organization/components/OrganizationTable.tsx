"use client";

import React, { useEffect, useMemo, useState } from "react";
import { OrganizationData } from "../types/OrganizationData";
import {
  flexRender, getCoreRowModel, getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import columnsDef from "./columns";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/ui/SearchInput";
import { Filter } from "lucide-react";

type Props = { data: OrganizationData[]; types?: string[] };

const prettyType = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export default function OrganizationTable({ data, types = [] }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = data;

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((d) => d.typeName === typeFilter);
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.name, d.managerName, d.managerEmail, d.typeName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, query, statusFilter, typeFilter]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [query, statusFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="overflow-hidden rounded-md outline-none">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
        {/* Search Input - Left Side */}
        <div className="w-full sm:w-auto sm:flex-1 max-w-md">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by organizations"
            count={filtered.length}
          />
        </div>

        {/* Filters - Right Side */}
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-[44px] rounded-full border border-[#E5E5E5] bg-white px-4 font-poppins text-[14px]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V12M12 8H4" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <SelectValue placeholder="Type">
                  {typeFilter === "all" ? "Type" : prettyType(typeFilter)}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Type</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {prettyType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-[44px] rounded-full border border-[#E5E5E5] bg-white px-4 font-poppins text-[14px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#00D4AA]" />
                <SelectValue placeholder="Status">
                  {statusFilter === "all" ? "Status" : 
                   statusFilter === "PENDING" ? "Pending Approval" :
                   statusFilter === "ACCEPTED" ? "Approved" : 
                   "Rejected"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="PENDING">Pending Approval</SelectItem>
              <SelectItem value="ACCEPTED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
                colSpan={columnsDef.length}
                className="h-24 text-center text-black font-poppins text-[16px] leading-none"
              >
                No Organizations Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={columnsDef.length} className="p-0">
              <Pagination table={table} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
