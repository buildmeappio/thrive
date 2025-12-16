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
import { InterviewData } from "@/domains/interview/types/InterviewData";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { capitalizeWords } from "@/utils/text";
import Link from "next/link";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Utility function to truncate text with ellipsis
const truncateText = (
  text: string | null | undefined,
  maxLength: number = 28
): string => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Utility function to format date and time
const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Utility function to format time range
const formatTimeRange = (
  startTime: string | Date,
  endTime: string | Date
): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startTimeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTimeStr = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${startTimeStr} - ${endTimeStr}`;
};

const ActionButton = ({ applicationId }: { applicationId?: string }) => {
  if (!applicationId) {
    return null;
  }
  return (
    <Link
      href={`/application/${applicationId}`}
      className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

type Props = {
  data: InterviewData[];
  searchQuery?: string;
  filters?: {
    status: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<InterviewData, unknown>;
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
      onClick={handleSort}>
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
    accessorKey: "examinerName",
    header: ({ column }: { column: Column<InterviewData, unknown> }) => (
      <SortableHeader column={column}>Examiner Name</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterviewData> }) => {
      const name = row.getValue("examinerName") as string;
      const capitalizedName = capitalizeWords(name);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={capitalizedName}>
          {truncateText(capitalizedName, 28)}
        </div>
      );
    },
    minSize: 180,
    maxSize: 300,
    size: 240,
  },
  {
    accessorKey: "startTime",
    header: ({ column }: { column: Column<InterviewData, unknown> }) => (
      <SortableHeader column={column}>Date & Time</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterviewData> }) => {
      const startTime = row.getValue("startTime") as string;
      const formatted = formatDateTime(startTime);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={formatted}>
          {truncateText(formatted, 30)}
        </div>
      );
    },
    sortingFn: (rowA: Row<InterviewData>, rowB: Row<InterviewData>) => {
      const dateA = new Date(rowA.getValue("startTime") as string).getTime();
      const dateB = new Date(rowB.getValue("startTime") as string).getTime();
      return dateA - dateB;
    },
    minSize: 180,
    maxSize: 300,
    size: 220,
  },
  {
    accessorKey: "timeRange",
    header: ({ column }: { column: Column<InterviewData, unknown> }) => (
      <SortableHeader column={column}>Time Slot</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterviewData> }) => {
      const startTime = row.original.startTime;
      const endTime = row.original.endTime;
      const timeRange = formatTimeRange(startTime, endTime);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={timeRange}>
          {truncateText(timeRange, 20)}
        </div>
      );
    },
    sortingFn: (rowA: Row<InterviewData>, rowB: Row<InterviewData>) => {
      const dateA = new Date(rowA.original.startTime as string).getTime();
      const dateB = new Date(rowB.original.startTime as string).getTime();
      return dateA - dateB;
    },
    minSize: 150,
    maxSize: 250,
    size: 200,
  },
  {
    accessorKey: "status",
    header: ({ column }: { column: Column<InterviewData, unknown> }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterviewData> }) => {
      const status = row.getValue("status") as string;
      const formattedStatus = formatText(status);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={formattedStatus}>
          {formattedStatus}
        </div>
      );
    },
    minSize: 120,
    maxSize: 180,
    size: 150,
  },
  {
    header: () => <></>,
    accessorKey: "applicationId",
    cell: ({ row }: { row: Row<InterviewData> }) => {
      return <ActionButton applicationId={row.original.applicationId} />;
    },
    minSize: 60,
    maxSize: 60,
    size: 60,
  },
];

export default function InterviewTableWithPagination({
  data,
  searchQuery = "",
  filters = { status: "all" },
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    let result = data;

    // Filter by status
    if (filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) {
        result = result.filter((d) => {
          const interviewDate = new Date(d.startTime);
          const startDate = new Date(start);
          startDate.setHours(0, 0, 0, 0);
          return interviewDate >= startDate;
        });
      }
      if (end) {
        result = result.filter((d) => {
          const interviewDate = new Date(d.startTime);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          return interviewDate <= endDate;
        });
      }
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [
          d.examinerName,
          formatDateTime(d.startTime),
          formatTimeRange(d.startTime, d.endTime),
          formatText(d.status),
        ]
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
        <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
          <Table className="w-full border-0 table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="bg-[#F3F3F3] border-b-0"
                  key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnDef = columnsDef[header.index];
                    const minWidth = columnDef?.minSize || "auto";
                    const maxWidth = columnDef?.maxSize || "auto";
                    const width = columnDef?.size || "auto";
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          minWidth:
                            typeof minWidth === "number"
                              ? `${minWidth}px`
                              : minWidth,
                          maxWidth:
                            typeof maxWidth === "number"
                              ? `${maxWidth}px`
                              : maxWidth,
                          width:
                            typeof width === "number" ? `${width}px` : width,
                        }}
                        className={cn(
                          "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
                          header.index === 0 && "rounded-l-2xl",
                          header.index === headerGroup.headers.length - 1 &&
                            "rounded-r-2xl"
                        )}>
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
                    className="bg-white border-0 border-b">
                    {row.getVisibleCells().map((cell) => {
                      const columnIndex = cell.column.getIndex();
                      const columnDef = columnsDef[columnIndex];
                      const minWidth = columnDef?.minSize || "auto";
                      const maxWidth = columnDef?.maxSize || "auto";
                      const width = columnDef?.size || "auto";
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            minWidth:
                              typeof minWidth === "number"
                                ? `${minWidth}px`
                                : minWidth,
                            maxWidth:
                              typeof maxWidth === "number"
                                ? `${maxWidth}px`
                                : maxWidth,
                            width:
                              typeof width === "number" ? `${width}px` : width,
                          }}
                          className="px-6 py-3 overflow-hidden align-middle">
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
                    className="h-24 text-center text-black font-poppins text-[16px] leading-normal">
                    No Interviews Found
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
