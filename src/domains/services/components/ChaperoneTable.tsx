"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { ChaperoneData } from "../types/Chaperone";
import { useRouter } from "next/navigation";

type ChaperoneTableProps = {
  chaperoneList: ChaperoneData[];
};

const ChaperoneTable = ({
  chaperoneList,
}: ChaperoneTableProps) => {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  // No filtering here - handled by parent component
  const filtered = chaperoneList;

  const handleView = useCallback((chaperone: ChaperoneData) => {
    router.push(`/dashboard/chaperones/${chaperone.id}`);
  }, [router]);

  const columns = useMemo(() => createChaperoneColumns(handleView), [handleView]);

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

  // Reset pagination when data changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [chaperoneList.length, table]);

  return (
    <>
      {/* Table Card */}
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
          <Table className="w-full border-0 table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const columnDef = columns[index];
                  const minWidth = columnDef?.minSize || 'auto';
                  const maxWidth = columnDef?.maxSize || 'auto';
                  const width = columnDef?.size || 'auto';
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
                        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
                        width: typeof width === 'number' ? `${width}px` : width,
                      }}
                      className={cn(
                        "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
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
                  {row.getVisibleCells().map((cell) => {
                    const columnIndex = cell.column.getIndex();
                    const columnDef = columns[columnIndex];
                    const minWidth = columnDef?.minSize || 'auto';
                    const maxWidth = columnDef?.maxSize || 'auto';
                    const width = columnDef?.size || 'auto';
                    return (
                      <TableCell 
                        key={cell.id} 
                        style={{
                          minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
                          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
                          width: typeof width === 'number' ? `${width}px` : width,
                        }}
                        className="px-6 py-3 overflow-hidden align-middle"
                      >
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
                  className="h-24 text-center text-black font-poppins text-[16px] leading-normal"
                >
                  No Chaperones Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination - Outside the card */}
      <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
        <Pagination table={table} />
      </div>
    </>
  );
};

export default ChaperoneTable;
