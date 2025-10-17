"use client";

import { useMemo, useEffect } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrganizationData } from "@/domains/organization/types/OrganizationData";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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

const columnsDef = [
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }: { row: any }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "typeName",
    header: "Type",
    cell: ({ row }: { row: any }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("typeName") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "managerName",
    header: "Representative",
    cell: ({ row }: { row: any }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("managerName") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "managerEmail",
    header: "Email",
    cell: ({ row }: { row: any }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("managerEmail") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("status")}
      </div>
    ),
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
  },
];

// Combined component that handles both table and pagination with shared state
export default function OrganizationTableWrapper({ 
  data, 
  types: _types = [], 
  statuses: _statuses = [], 
  searchQuery = "", 
  filters = { type: "all", status: "all" } 
}: Props) {
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return (
    <>
      {/* Table */}
      <div className="overflow-hidden rounded-md outline-none">
        <Table className="border-0">
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
      
      {/* Pagination */}
      <Pagination table={table} />
    </>
  );
}

// Export pagination separately - now it receives the table instance
export function OrganizationPagination({ table }: { table: any }) {
  return <Pagination table={table} />;
}