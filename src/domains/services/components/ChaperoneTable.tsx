"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createChaperoneColumns } from "./ChaperoneColumns";
import { cn } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChaperoneData } from "../types/Chaperone";
import { useRouter } from "next/navigation";

type ChaperoneTableProps = {
  chaperoneList: ChaperoneData[];
};

const ChaperoneTable = ({
  chaperoneList,
}: ChaperoneTableProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return chaperoneList;

    return chaperoneList.filter((chaperone) => {
      const hit = [
        chaperone.fullName,
        chaperone.firstName,
        chaperone.lastName,
        chaperone.email,
        chaperone.phone,
        chaperone.gender,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));

      return hit;
    });
  }, [chaperoneList, query]);

  const handleView = (chaperone: ChaperoneData) => {
    router.push(`/dashboard/chaperones/${chaperone.id}`);
  };

  const handleCreate = () => {
    router.push('/dashboard/chaperones/new');
  };

  const columns = useMemo(() => createChaperoneColumns(handleView), [router]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [query, table]);

  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 md:max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5" fill="none" stroke="url(#searchGradient)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search chaperones..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full bg-white text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
            />
          </div>
        </div>

        <Button
          onClick={handleCreate}
          className="h-[50px] w-[170px] px-4 flex items-center rounded-full gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] cursor-pointer"
        >
          <Plus size={30} />
          <span className='text-[16px]'>Add Chaperone</span>
        </Button>
      </div>

      <div className="mt-6 bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="overflow-x-auto rounded-md outline-none max-h-[60vh] lg:max-h-none">
          <Table className="min-w-[1000px] border-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    style={{ 
                      maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
                      width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined
                    }}
                    className={cn(
                      "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap",
                      index === 0 && "rounded-l-2xl",
                      index === headerGroup.headers.length - 1 && "rounded-r-2xl"
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
                    <TableCell 
                      key={cell.id} 
                      style={{ 
                        maxWidth: cell.column.columnDef.maxSize ? `${cell.column.columnDef.maxSize}px` : undefined,
                        width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : undefined
                      }}
                      className="px-6"
                    >
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
                  className="h-24 text-center text-black font-poppins text-[16px] leading-none"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>
                      {query
                        ? "No chaperones found matching your search"
                        : "No chaperones found"}
                    </p>
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="text-sm text-[#000093] hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="px-6 mt-4">
          <Pagination table={table} />
        </div>
      )}
    </>
  );
};

export default ChaperoneTable;
