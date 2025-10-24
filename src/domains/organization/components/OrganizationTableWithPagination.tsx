"use client";

import { useState, useMemo, useEffect } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, flexRender, type Row, type Column } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrganizationData } from "@/domains/organization/types/OrganizationData";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string) => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ')  // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0)  // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

type Props = {
  data: OrganizationData[];
  types?: string[];
  statuses?: string[];
  searchQuery?: string;
  filters?: {
    type: string;
    status: string;
  };
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/organization/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const SortableHeader = ({ column, children }: { column: Column<OrganizationData, unknown>; children: React.ReactNode }) => {
  const sortDirection = column.getIsSorted();
  
  const handleSort = () => {
    if (sortDirection === false) {
      column.toggleSorting(false); // Set to ascending
    } else if (sortDirection === 'asc') {
      column.toggleSorting(true); // Set to descending
    } else {
      column.clearSorting(); // Clear sorting (back to original)
    }
  };
  
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none hover:text-[#000093] transition-colors"
      onClick={handleSort}
    >
      <span>{children}</span>
      {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
      {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
      {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
    </div>
  );
};

const columnsDef = [
  {
    accessorKey: "name",
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Organization</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "typeName",
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("typeName") ? formatText(row.getValue("typeName")) : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "managerName",
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Representative</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("managerName") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "managerEmail",
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("managerEmail") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {formatText(row.getValue("status"))}
      </div>
    ),
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: Row<OrganizationData> }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
    enableSorting: false,
  },
];

export default function OrganizationTableWithPagination({
  data,
  searchQuery = "",
  filters = { type: "all", status: "all" }
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    let result = data;

    // Filter by status
    if (filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by type
    if (filters.type !== "all") {
      result = result.filter((d) => d.typeName === filters.type);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.name, d.managerName, d.managerEmail, d.typeName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, searchQuery, filters]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return {
    table,
    tableElement: (
      <>
        {/* Table */}
        <div className="overflow-x-auto rounded-md outline-none max-h-[60vh] lg:max-h-none">
          <Table className="min-w-[1000px] border-0">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-6 py-2 text-left text-base font-medium text-black",
                        header.index === 0 && "rounded-l-2xl",
                        header.index === headerGroup.headers.length - 1 &&
                        "rounded-r-2xl w-[60px]"
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
                      <TableCell key={cell.id} className="px-6 py-3">
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
      </>
    )
  };
}
