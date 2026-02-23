"use client";

import { useState, useMemo, useEffect } from "react";
import { matchesSearch } from "@/utils/search";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  type ColumnDef,
  type Column,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { capitalizeWords } from "@/utils/text";

interface FilterState {
  specialty: string;
  status: string;
}

type useExaminerTableOptions = {
  data: ExaminerData[];
  searchQuery: string;
  filters?: FilterState;
  type?: "applications" | "examiners";
  togglingExaminerId?: string | null;
  onToggleStatus?: (id: string) => void;
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: "left" | "center" | "right";
};

const ActionButton = ({
  id,
  type,
}: {
  id: string;
  type?: "applications" | "examiners";
}) => {
  const href =
    type === "applications" ? `/application/${id}` : `/examiner/${id}`;
  return (
    <Link href={href} className="w-full h-full cursor-pointer">
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
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<ExaminerData, unknown>;
  children: React.ReactNode;
}) => {
  const sortDirection = column.getIsSorted();

  const handleSort = () => {
    if (sortDirection === false) {
      column.toggleSorting(false); // Set to ascending
    } else if (sortDirection === "asc") {
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
      {sortDirection === false && (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      )}
      {sortDirection === "asc" && (
        <ArrowUp className="h-4 w-4 text-[#000093]" />
      )}
      {sortDirection === "desc" && (
        <ArrowDown className="h-4 w-4 text-[#000093]" />
      )}
    </div>
  );
};

const createColumns = (
  type?: "applications" | "examiners",
  togglingExaminerId?: string | null,
  onToggleStatus?: (id: string) => void,
): ColumnDef<ExaminerData, unknown>[] => {
  const baseColumns: ColumnDef<ExaminerData, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Name</SortableHeader>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const capitalizedName = capitalizeWords(name);
        return (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={capitalizedName}
          >
            {capitalizedName}
          </div>
        );
      },
      meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <SortableHeader column={column}>Email</SortableHeader>
      ),
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={email}
          >
            {email}
          </div>
        );
      },
      meta: { minSize: 180, maxSize: 300, size: 220 } as ColumnMeta,
    },
    {
      accessorKey: "specialties",
      header: ({ column }) => (
        <SortableHeader column={column}>Specialties</SortableHeader>
      ),
      cell: ({ row }) => {
        const specialties = row.getValue("specialties") as string | string[];
        const formattedText = Array.isArray(specialties)
          ? specialties
              .map((specialty: string) => formatText(specialty))
              .join(", ")
          : formatText(specialties);

        return (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={formattedText}
          >
            {formattedText}
          </div>
        );
      },
      meta: { minSize: 150, maxSize: 300, size: 220 } as ColumnMeta,
    },
    {
      accessorKey: "province",
      header: ({ column }) => (
        <SortableHeader column={column}>Province</SortableHeader>
      ),
      cell: ({ row }) => {
        const province = row.getValue("province") as string;
        return (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={province}
          >
            {province}
          </div>
        );
      },
      meta: { minSize: 100, maxSize: 150, size: 120 } as ColumnMeta,
    },
  ];

  // Add status column for applications (text) or examiners (toggle)
  if (type === "applications") {
    baseColumns.push({
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const formattedStatus = formatText(status);
        return (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={formattedStatus}
          >
            {formattedStatus}
          </div>
        );
      },
      meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
    });
  } else if (type === "examiners" && onToggleStatus) {
    // Add status toggle column for examiners
    baseColumns.push({
      header: () => <span>Status</span>,
      accessorKey: "status",
      cell: ({ row }) => {
        const isToggling = togglingExaminerId === row.original.id;
        const status = row.original.status;
        const isActive = status === "ACTIVE";
        return (
          <div className="flex items-center justify-center w-full">
            <button
              type="button"
              className={cn(
                "relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex-shrink-0",
                isActive
                  ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"
                  : "bg-gray-300",
                isToggling && "cursor-not-allowed opacity-60",
              )}
              onClick={() => onToggleStatus(row.original.id)}
              disabled={isToggling}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                  isActive ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>
        );
      },
      meta: {
        minSize: 110,
        maxSize: 130,
        size: 110,
        align: "center",
      } as ColumnMeta,
    });
  }

  // Add action column
  baseColumns.push({
    header: () => <></>,
    accessorKey: "id",
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} type={type} />;
    },
    meta: { minSize: 60, maxSize: 60, size: 60 } as ColumnMeta,
  });

  return baseColumns;
};

export const useExaminerTable = (props: useExaminerTableOptions) => {
  const {
    data,
    searchQuery,
    filters,
    type,
    togglingExaminerId,
    onToggleStatus,
  } = props;

  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
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

    // Filter by status (only for applications, not examiners)
    if (type !== "examiners" && filters?.status && filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((d) => {
        // For examiners, exclude status from search; for applications, include it
        const searchFields =
          type === "examiners"
            ? [d.name, d.email, d.specialties, d.province]
            : [d.name, d.email, d.specialties, d.province, d.status];
        return searchFields
          .filter(Boolean)
          .some((v) => matchesSearch(searchQuery, v));
      });
    }

    return result;
  }, [data, searchQuery, filters, type]);

  const columns = useMemo(
    () => createColumns(type, togglingExaminerId, onToggleStatus),
    [type, togglingExaminerId, onToggleStatus],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return {
    table,
    columns,
  };
};

type ExaminerTableProps = {
  table: ReturnType<typeof useExaminerTable>["table"];
  columns: ReturnType<typeof useExaminerTable>["columns"];
};

const ExaminerTable: React.FC<ExaminerTableProps> = ({ table, columns }) => {
  return (
    <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
      <Table className="w-full border-0 table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const column = header.column.columnDef;
                const meta = (column.meta as ColumnMeta) || {};
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                      maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                      width: meta.size ? `${meta.size}px` : undefined,
                    }}
                    className={cn(
                      "px-6 py-2 text-base font-medium text-black whitespace-nowrap overflow-hidden",
                      meta.align === "center"
                        ? "text-center"
                        : meta.align === "right"
                          ? "text-right"
                          : "text-left",
                      header.index === 0 && "rounded-l-2xl",
                      header.index === headerGroup.headers.length - 1 &&
                        "rounded-r-2xl",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                  const column = cell.column.columnDef;
                  const meta = (column.meta as ColumnMeta) || {};
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: meta.minSize
                          ? `${meta.minSize}px`
                          : undefined,
                        maxWidth: meta.maxSize
                          ? `${meta.maxSize}px`
                          : undefined,
                        width: meta.size ? `${meta.size}px` : undefined,
                      }}
                      className="px-6 py-3 overflow-hidden align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                No Examiners Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExaminerTable;
