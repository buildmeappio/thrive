"use client";

import { useMemo, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  type ColumnDef,
  type Row,
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
import { CaseData } from "@/domains/case/types/CaseData";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { formatDateShort } from "@/utils/date";
import { capitalizeWords } from "@/utils/text";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string) => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface FilterState {
  claimType: string;
  status: string;
  priority: string;
  dateRange: {
    start: string;
    end: string;
  };
}

type useCaseTableOptions = {
  data: CaseData[];
  searchQuery: string;
  filters?: FilterState;
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/cases/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<CaseData, unknown>;
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

const createColumns = (): ColumnDef<CaseData, unknown>[] => [
  {
    accessorKey: "number",
    header: ({ column }) => (
      <SortableHeader column={column}>Case ID</SortableHeader>
    ),
    cell: ({ row }) => {
      const caseNumber = row.getValue("number") as string;
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={caseNumber}
        >
          {caseNumber}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
  },
  {
    accessorKey: "organization",
    header: ({ column }) => (
      <SortableHeader column={column}>Company</SortableHeader>
    ),
    cell: ({ row }) => {
      const organization = row.getValue("organization") as string;
      const capitalizedOrg = capitalizeWords(organization);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={capitalizedOrg}
        >
          {capitalizedOrg}
        </div>
      );
    },
    meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
  },
  {
    accessorKey: "caseType",
    header: ({ column }) => (
      <SortableHeader column={column}>Claim Type</SortableHeader>
    ),
    cell: ({ row }) => {
      const caseType = formatText(row.getValue("caseType") as string);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={caseType}
        >
          {caseType}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 200, size: 150 } as ColumnMeta,
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Date Received</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = formatDateShort(row.getValue("submittedAt"));
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap"
          title={date}
        >
          {date}
        </div>
      );
    },
    meta: { minSize: 140, maxSize: 180, size: 160 } as ColumnMeta,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <SortableHeader column={column}>Due Date</SortableHeader>
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate")
        ? formatDateShort(row.getValue("dueDate"))
        : "N/A";
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap"
          title={dueDate}
        >
          {dueDate}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }) => {
      const status = formatText(row.getValue("status") as string);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={status}
        >
          {status}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: "urgencyLevel",
    header: ({ column }) => (
      <SortableHeader column={column}>Priority</SortableHeader>
    ),
    cell: ({ row }) => {
      const priority = formatText(row.getValue("urgencyLevel") as string);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={priority}
        >
          {priority}
        </div>
      );
    },
    meta: { minSize: 100, maxSize: 150, size: 120 } as ColumnMeta,
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    meta: { minSize: 60, maxSize: 60, size: 60 } as ColumnMeta,
    enableSorting: false,
  },
];

export const useCaseTable = (props: useCaseTableOptions) => {
  const { data, searchQuery, filters } = props;

  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by claim type
    if (filters?.claimType && filters.claimType !== "all") {
      result = result.filter((d) => d.caseType === filters.claimType);
    }

    // Filter by status
    if (filters?.status && filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by priority
    if (filters?.priority && filters.priority !== "all") {
      result = result.filter((d) => d.urgencyLevel === filters.priority);
    }

    // Filter by date range
    if (filters?.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) {
        result = result.filter((d) => {
          if (!d.dueDate) return false; // Exclude cases without due dates
          const dueDate = new Date(d.dueDate);
          const startDate = new Date(start);
          return dueDate >= startDate;
        });
      }
      if (end) {
        result = result.filter((d) => {
          if (!d.dueDate) return false; // Exclude cases without due dates
          const dueDate = new Date(d.dueDate);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          return dueDate <= endDate;
        });
      }
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.number, d.organization, d.caseType, d.status, d.urgencyLevel]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }

    return result;
  }, [data, searchQuery, filters]);

  const columns = useMemo(() => createColumns(), []);

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

type CaseTableProps = {
  table: ReturnType<typeof useCaseTable>["table"];
  columns: ReturnType<typeof useCaseTable>["columns"];
};

const CaseTable: React.FC<CaseTableProps> = ({ table, columns }) => {
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
                      "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
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
                No Cases Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CaseTable;
