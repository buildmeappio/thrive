"use client";

import { useState, useMemo, useEffect } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, type Row } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FilterState {
  specialty: string;
  status: string;
}

type Props = {
  data: ExaminerData[];
  specialties?: string[];
  statuses?: string[];
  searchQuery?: string;
  filters?: FilterState;
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/examiner/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/[-_]/g, ' ')  // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0)  // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const columnsDef = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: Row<ExaminerData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: { row: Row<ExaminerData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "specialties",
    header: "Specialties",
    cell: ({ row }: { row: Row<ExaminerData> }) => {
      const specialties = row.getValue("specialties") as string | string[];
      return (
        <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
          {Array.isArray(specialties)
            ? specialties.map((specialty: string) => formatText(specialty)).join(", ")
            : formatText(specialties)
          }
        </div>
      );
    },
  },
  {
    accessorKey: "province",
    header: "Province",
    cell: ({ row }: { row: Row<ExaminerData> }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("province")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: Row<ExaminerData> }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
          {formatText(status)}
        </div>
      );
    },
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: Row<ExaminerData> }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
  },
];

export default function ExaminerTableWithPagination({ data, searchQuery = "", filters }: Props) {
  const [query, setQuery] = useState(searchQuery);

  // Update internal query when searchQuery prop changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    let result = data;

    // Filter by specialty
    if (filters?.specialty && filters.specialty !== "all") {
      result = result.filter((d) => {
        if (Array.isArray(d.specialties)) {
          return d.specialties.includes(filters.specialty);
        }
        return d.specialties === filters.specialty;
      });
    }

    // Filter by status
    if (filters?.status && filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.name, d.email, d.specialties, d.province, d.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, query, filters]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [query, filters, table]);

  return {
    table,
    tableElement: (
      <>
        {/* Table */}
        <div className="overflow-x-auto rounded-md outline-none max-h-[60vh] lg:max-h-none">
          <Table className="min-w-[900px] border-0">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap",
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
                    No Examiners Found
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
