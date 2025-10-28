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
import SearchInput from "@/components/ui/SearchInput";

type ChaperoneTableProps = {
  chaperoneList: ChaperoneData[];
  onEdit: (chaperone: ChaperoneData) => void;
  onCreate: () => void;
};

const ChaperoneTable = ({
  chaperoneList,
  onEdit,
  onCreate,
}: ChaperoneTableProps) => {
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

  const columns = useMemo(() => createChaperoneColumns(onEdit), [onEdit]);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-auto">
          <SearchInput
            placeholder="Search chaperones..."
            value={query}
            onChange={setQuery}
          />
        </div>

        <Button
          onClick={onCreate}
          className="flex items-center rounded-lg gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"
        >
          <Plus size={20} />
          <span>Add Chaperone</span>
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "bg-white",
                      header.column.columnDef.maxSize && "w-[60px]"
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
                  className="border-b last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground text-sm">
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

      {filtered.length > 0 && <Pagination table={table} />}
    </div>
  );
};

export default ChaperoneTable;
