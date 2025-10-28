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
  TableFooter,
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
    <div>
      <div className="bg-white rounded-[28px] shadow-sm px-4 sm:px-6 py-4 sm:py-6 w-full">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg">
            <Table className="border-0 shadow-none">
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow className="bg-[#F3F3F3] border-b-0" key={hg.id}>
                    {hg.headers.map((h) => {
                      const isSortable = h.column.getCanSort();
                      const sort = h.column.getIsSorted();
                      return (
                        <TableHead
                          key={h.id}
                          onClick={
                            isSortable
                              ? h.column.getToggleSortingHandler()
                              : undefined
                          }
                          className={cn(
                            "select-none",
                            h.index === 0 && "rounded-l-xl",
                            h.index === hg.headers.length - 1 &&
                              "rounded-r-xl w-[60px]",
                            isSortable && "cursor-pointer"
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {h.isPlaceholder
                              ? null
                              : flexRender(
                                  h.column.columnDef.header,
                                  h.getContext()
                                )}
                            {isSortable && (
                              <span className="text-xs text-gray-500">
                                {sort === "asc"
                                  ? "▲"
                                  : sort === "desc"
                                  ? "▼"
                                  : ""}
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="bg-white border-0 border-b-1"
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
                      className="h-24 text-center text-black font-poppins text-[16px] leading-none"
                    >
                      {query
                        ? "No chaperones found matching your search"
                        : "No Chaperones Found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="mt-6 px-6">
        <Pagination table={table} />
      </div>
    </div>
  );
};

export default ChaperoneTable;
