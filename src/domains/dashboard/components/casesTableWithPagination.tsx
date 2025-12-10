"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaseRowData } from "../types";
import { formatDateShort, formatDateTime } from "@/utils/date";
import { capitalizeWords } from "@/utils/text";
import { cn } from "@/lib/utils";

interface CasesTableWithPaginationProps {
  data: CaseRowData[];
  searchQuery: string;
  filters: {
    status: string;
  };
}

// Utility function to truncate text with ellipsis
const truncateText = (
  text: string | null | undefined,
  maxLength: number = 28
): string => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

type SortField =
  | "caseNumber"
  | "claimant"
  | "company"
  | "appointment"
  | "dueDate"
  | "status"
  | null;
type SortDirection = "asc" | "desc" | null;

const SortableHeader = ({
  field,
  currentSort,
  onSort,
  children,
}: {
  field: SortField;
  currentSort: { field: SortField; direction: SortDirection };
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) => {
  const isActive = currentSort.field === field;
  const direction = isActive ? currentSort.direction : null;

  const handleSort = () => {
    onSort(field);
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none hover:text-[#00A8FF] transition-colors"
      onClick={handleSort}>
      <span>{children}</span>
      {direction === null && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
      {direction === "asc" && <ArrowUp className="h-4 w-4 text-[#00A8FF]" />}
      {direction === "desc" && <ArrowDown className="h-4 w-4 text-[#00A8FF]" />}
    </div>
  );
};

export default function CasesTableWithPagination({
  data,
  searchQuery,
  filters,
}: CasesTableWithPaginationProps) {
  const [sorting, setSorting] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter data based on search query and status filter
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (row) =>
          row.claimant.toLowerCase().includes(query) ||
          row.company.toLowerCase().includes(query) ||
          row.caseNumber.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      result = result.filter((row) => {
        if (filters.status === "pending") {
          return row.status === "PENDING";
        } else if (filters.status === "reportPending") {
          // Show cases that are accepted but have no report yet
          return row.status === "ACCEPT" && !row.reportStatus;
        } else if (filters.status === "reportDraft") {
          // Show cases that are accepted and have a draft report
          return row.status === "ACCEPT" && row.reportStatus === "DRAFT";
        } else if (filters.status === "reportSubmitted") {
          // Show cases that are accepted and have a submitted report
          return row.status === "ACCEPT" && row.reportStatus === "SUBMITTED";
        } else if (filters.status === "reportApproved") {
          // Show cases that are accepted and have an approved report
          return row.status === "ACCEPT" && row.reportStatus === "APPROVED";
        } else if (filters.status === "reportRejected") {
          // Show cases that are accepted and have a rejected report
          return row.status === "ACCEPT" && row.reportStatus === "REJECTED";
        }
        return true;
      });
    }

    return result;
  }, [data, searchQuery, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sorting.field) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue: string | number | Date | null;
      let bValue: string | number | Date | null;

      switch (sorting.field) {
        case "caseNumber":
          aValue = a.caseNumber;
          bValue = b.caseNumber;
          break;
        case "claimant":
          aValue = a.claimant;
          bValue = b.claimant;
          break;
        case "company":
          aValue = a.company;
          bValue = b.company;
          break;
        case "appointment":
          aValue = a.appointment?.getTime() ?? 0;
          bValue = b.appointment?.getTime() ?? 0;
          break;
        case "dueDate":
          aValue = a.dueDate?.getTime() ?? 0;
          bValue = b.dueDate?.getTime() ?? 0;
          break;
        case "status":
          aValue = a.status ?? "";
          bValue = b.status ?? "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sorting.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sorting.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sorting]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sorting.field === field) {
      if (sorting.direction === "asc") {
        setSorting({ field, direction: "desc" });
      } else if (sorting.direction === "desc") {
        setSorting({ field: null, direction: null });
      } else {
        setSorting({ field, direction: "asc" });
      }
    } else {
      setSorting({ field, direction: "asc" });
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Column definitions with fixed widths
  const columns = [
    {
      key: "caseNumber",
      label: "Case Number",
      minSize: 120,
      maxSize: 180,
      size: 150,
    },
    {
      key: "claimant",
      label: "Claimant",
      minSize: 150,
      maxSize: 220,
      size: 180,
    },
    { key: "company", label: "Company", minSize: 150, maxSize: 220, size: 180 },
    {
      key: "appointment",
      label: "Appointment",
      minSize: 180,
      maxSize: 250,
      size: 220,
    },
    {
      key: "dueDate",
      label: "Due Date",
      minSize: 120,
      maxSize: 180,
      size: 150,
    },
    { key: "status", label: "Status", minSize: 150, maxSize: 220, size: 180 },
    { key: "action", label: "", minSize: 60, maxSize: 60, size: 60 },
  ];

  const tableElement = (
    <div className="overflow-x-auto rounded-2xl overflow-hidden">
      <Table className="w-full border-0 table-fixed">
        <TableHeader>
          <TableRow className="bg-[#F3F3F3] border-none hover:bg-[#F3F3F3]">
            {columns.map((col, index) => (
              <TableHead
                key={col.key}
                style={{
                  minWidth: `${col.minSize}px`,
                  maxWidth: `${col.maxSize}px`,
                  width: `${col.size}px`,
                }}
                className={cn(
                  "text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden",
                  index === 0 && "rounded-tl-2xl rounded-bl-2xl",
                  index === columns.length - 1 &&
                    "rounded-tr-2xl rounded-br-2xl"
                )}>
                {col.key === "action" ? (
                  ""
                ) : (
                  <SortableHeader
                    field={col.key as SortField}
                    currentSort={sorting}
                    onSort={handleSort}>
                    {col.label}
                  </SortableHeader>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row) => {
              // Determine status text based on booking status and report status
              let statusText = "N/A";
              let statusColor = "text-[#4D4D4D]";

              if (row.status === "PENDING") {
                statusText = "Pending Review";
                statusColor = "text-[#FFA500]";
              } else if (row.status === "ACCEPT") {
                // When booking is accepted, check report status
                if (row.reportStatus === "DRAFT") {
                  statusText = "Report Draft";
                  statusColor = "text-[#FFA500]";
                } else if (row.reportStatus === "SUBMITTED") {
                  statusText = "Report Submitted";
                  statusColor = "text-[#10B981]";
                } else if (row.reportStatus === "APPROVED") {
                  statusText = "Report Approved";
                  statusColor = "text-[#10B981]";
                } else if (row.reportStatus === "REJECTED") {
                  statusText = "Report Rejected";
                  statusColor = "text-[#DC2626]";
                } else if (row.reportStatus === "REVIEWED") {
                  statusText = "Report Reviewed";
                  statusColor = "text-[#00A8FF]";
                } else {
                  // No report exists yet
                  statusText = "Report Pending";
                  statusColor = "text-[#00A8FF]";
                }
              } else if (row.status === "REQUEST_MORE_INFO") {
                statusText = "Request More Info";
                statusColor = "text-[#FFA500]";
              } else if (row.status === "DECLINE") {
                statusText = "Declined";
                statusColor = "text-[#DC2626]";
              }

              return (
                <TableRow
                  key={row.id}
                  className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]">
                  <TableCell
                    style={{
                      minWidth: `${columns[0].minSize}px`,
                      maxWidth: `${columns[0].maxSize}px`,
                      width: `${columns[0].size}px`,
                    }}
                    className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                    <div
                      className="text-[16px] leading-normal truncate"
                      title={row.caseNumber}>
                      {truncateText(row.caseNumber, 20)}
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: `${columns[1].minSize}px`,
                      maxWidth: `${columns[1].maxSize}px`,
                      width: `${columns[1].size}px`,
                    }}
                    className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                    <div
                      className="text-[16px] leading-normal truncate"
                      title={row.claimant}>
                      {truncateText(row.claimant, 25)}
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: `${columns[2].minSize}px`,
                      maxWidth: `${columns[2].maxSize}px`,
                      width: `${columns[2].size}px`,
                    }}
                    className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                    <div
                      className="text-[16px] leading-normal truncate"
                      title={capitalizeWords(row.company)}>
                      {truncateText(capitalizeWords(row.company), 25)}
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: `${columns[3].minSize}px`,
                      maxWidth: `${columns[3].maxSize}px`,
                      width: `${columns[3].size}px`,
                    }}
                    className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                    <div
                      className="text-[16px] leading-normal truncate"
                      title={
                        row.appointment
                          ? formatDateTime(row.appointment)
                          : "N/A"
                      }>
                      {row.appointment
                        ? truncateText(formatDateTime(row.appointment), 25)
                        : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: `${columns[4].minSize}px`,
                      maxWidth: `${columns[4].maxSize}px`,
                      width: `${columns[4].size}px`,
                    }}
                    className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                    <div
                      className="text-[16px] leading-normal truncate"
                      title={
                        row.dueDate ? formatDateShort(row.dueDate) : "N/A"
                      }>
                      {row.dueDate
                        ? truncateText(formatDateShort(row.dueDate), 15)
                        : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: `${columns[5].minSize}px`,
                      maxWidth: `${columns[5].maxSize}px`,
                      width: `${columns[5].size}px`,
                    }}
                    className="py-5 sm:py-3 overflow-hidden align-middle">
                    <span
                      className={cn(
                        "text-[17px] sm:text-[14px] tracking-[-0.01em] font-poppins leading-normal",
                        statusColor
                      )}>
                      {statusText}
                    </span>
                  </TableCell>
                  <TableCell
                    style={{
                      minWidth: `${columns[6].minSize}px`,
                      maxWidth: `${columns[6].maxSize}px`,
                      width: `${columns[6].size}px`,
                    }}
                    className="py-5 sm:py-3 overflow-hidden align-middle">
                    <Link
                      href={`/appointments/${row.id}`}
                      aria-label={`Open ${row.claimant}`}
                      className="flex-shrink-0 grid h-7 w-7 sm:h-5 sm:w-5 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF] transition-colors">
                      <ChevronRight className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-[#00A8FF]" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-black font-poppins text-[16px] leading-none">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return {
    tableElement,
    pagination: {
      currentPage,
      totalPages,
      pageSize,
      totalRows: sortedData.length,
      setCurrentPage,
      setPageSize,
      canPreviousPage: currentPage > 1,
      canNextPage: currentPage < totalPages,
      previousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
      nextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
      setPageIndex: (index: number) => setCurrentPage(index + 1),
      getPageCount: () => totalPages,
      getState: () => ({
        pagination: {
          pageIndex: currentPage - 1,
          pageSize,
        },
      }),
      getPrePaginationRowModel: () => ({
        rows: sortedData.map((_, i) => ({
          id: i.toString(),
          original: sortedData[i],
        })),
      }),
    },
  };
}
