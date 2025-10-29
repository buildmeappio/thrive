"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
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

// Utility function to truncate text with ellipsis
const truncateText = (text: string | null | undefined, maxLength: number = 28): string => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
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

type Props = {
  data: CaseData[];
  types?: string[];
  statuses?: string[];
  priorityLevels?: string[];
  searchQuery?: string;
  filters?: FilterState;
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

const columnsDef = [
  {
    accessorKey: "number",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Case ID</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
      const caseNumber = row.getValue("number") as string;
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={caseNumber}
        >
          {truncateText(caseNumber, 20)}
        </div>
      );
    },
    minSize: 120,
    maxSize: 180,
    size: 150,
  },
  {
    accessorKey: "organization",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Company</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
      const organization = row.getValue("organization") as string;
      const capitalizedOrg = capitalizeWords(organization);
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={capitalizedOrg}
        >
          {truncateText(capitalizedOrg, 28)}
        </div>
      );
    },
    minSize: 150,
    maxSize: 250,
    size: 200,
  },
  {
    accessorKey: "caseType",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Claim Type</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
      const caseType = formatText(row.getValue("caseType") as string);
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={caseType}
        >
          {truncateText(caseType, 25)}
        </div>
      );
    },
    minSize: 120,
    maxSize: 200,
    size: 150,
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Date Received</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
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
    minSize: 140,
    maxSize: 180,
    size: 160,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Due Date</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
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
    minSize: 120,
    maxSize: 180,
    size: 150,
  },
  {
    accessorKey: "status",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
      const status = formatText(row.getValue("status") as string);
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={status}
        >
          {truncateText(status, 20)}
        </div>
      );
    },
    minSize: 120,
    maxSize: 180,
    size: 140,
  },
  {
    accessorKey: "urgencyLevel",
    header: ({ column }: { column: Column<CaseData, unknown> }) => (
      <SortableHeader column={column}>Priority</SortableHeader>
    ),
    cell: ({ row }: { row: Row<CaseData> }) => {
      const priority = formatText(row.getValue("urgencyLevel") as string);
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={priority}
        >
          {truncateText(priority, 15)}
        </div>
      );
    },
    minSize: 100,
    maxSize: 150,
    size: 120,
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: Row<CaseData> }) => {
      return <ActionButton id={row.original.id} />;
    },
    minSize: 60,
    maxSize: 60,
    size: 60,
    enableSorting: false,
  },
];

export default function CaseTableWithPagination({
  data,
  searchQuery = "",
  filters,
}: Props) {
  const [query, setQuery] = useState(searchQuery);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Update internal query when searchQuery prop changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const filtered = useMemo(() => {
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
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.number, d.organization, d.caseType, d.status, d.urgencyLevel]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, query, filters]);

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
  }, [query, filters, table]);

  return {
    table,
    tableElement: (
      <>
        {/* Table */}
        <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
          <Table className="w-full border-0 table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="bg-[#F3F3F3] border-b-0"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    const columnDef = columnsDef[header.index];
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
                          header.index === 0 && "rounded-l-2xl",
                          header.index === headerGroup.headers.length - 1 &&
                          "rounded-r-2xl"
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
                      const columnDef = columnsDef[columnIndex];
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
                    colSpan={columnsDef.length}
                    className="h-24 text-center text-black font-poppins text-[16px] leading-normal"
                  >
                    No Cases Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </>
    ),
  };
}
