"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { updateContractReviewDateAction } from "../actions";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Column,
  SortingState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import type { ContractListItem } from "../types/contract.types";
import { formatText } from "@/utils/text";

type Props = {
  contracts: ContractListItem[];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: "left" | "center" | "right";
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link
      href={`/dashboard/contracts/${id}`}
      className="w-full h-full cursor-pointer"
    >
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const ReviewDateCell = ({ contract }: { contract: ContractListItem }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    // Create date at midnight UTC to avoid timezone issues
    // When user selects "2025-01-15", we want to store it as that date, not the previous day
    const newDate = dateValue ? new Date(dateValue + "T00:00:00.000Z") : null;
    setIsUpdating(true);
    try {
      const result = await updateContractReviewDateAction(contract.id, newDate);
      if ("error" in result) {
        toast.error(result.error ?? "Failed to update review date");
        return;
      }
      toast.success(
        newDate ? "Review date updated successfully" : "Review date cleared",
      );
      setShowDatePicker(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update review date");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {showDatePicker ? (
        <input
          type="date"
          defaultValue={
            contract.reviewedAt
              ? new Date(contract.reviewedAt).toISOString().split("T")[0]
              : ""
          }
          onBlur={() => setShowDatePicker(false)}
          onChange={handleDateChange}
          disabled={isUpdating}
          className="text-[#4D4D4D] font-poppins text-[16px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/30"
          autoFocus
        />
      ) : (
        <div className="flex items-center gap-2 group">
          <span className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap">
            {contract.reviewedAt
              ? formatDate(contract.reviewedAt)
              : "Not reviewed"}
          </span>
          <button
            onClick={() => setShowDatePicker(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            title="Set review date"
          >
            <Calendar className="w-4 h-4 text-[#7B8B91]" />
          </button>
        </div>
      )}
    </div>
  );
};

const SortableHeader = ({
  column,
  children,
  align,
}: {
  column: Column<ContractListItem, unknown>;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
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
      className={cn(
        "flex items-center gap-2 cursor-pointer select-none hover:text-[#000093] transition-colors",
        align === "center"
          ? "justify-center"
          : align === "right"
            ? "justify-end"
            : "justify-start",
      )}
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

export default function ContractsTable({ contracts }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/dashboard/contracts/${id}`);
    },
    [router],
  );

  const columns = useMemo<ColumnDef<ContractListItem>[]>(
    () => [
      {
        accessorKey: "examinerName",
        header: ({ column }) => (
          <SortableHeader column={column}>Examiner</SortableHeader>
        ),
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={row.original.examinerName || "N/A"}
          >
            {row.original.examinerName || "N/A"}
          </div>
        ),
        meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: "templateName",
        header: ({ column }) => (
          <SortableHeader column={column}>Template</SortableHeader>
        ),
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={row.original.templateName || "N/A"}
          >
            {row.original.templateName || "N/A"}
          </div>
        ),
        meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          const meta = (column.columnDef.meta as ColumnMeta) || {};
          return (
            <SortableHeader column={column} align={meta.align}>
              Status
            </SortableHeader>
          );
        },
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap min-w-[80px]">
              {formatText(row.original.status)}
            </span>
          </div>
        ),
        meta: {
          minSize: 120,
          maxSize: 180,
          size: 150,
          align: "center",
        } as ColumnMeta,
      },
      {
        accessorKey: "reviewedAt",
        header: ({ column }) => (
          <SortableHeader column={column}>Review Date</SortableHeader>
        ),
        cell: ({ row }) => <ReviewDateCell contract={row.original} />,
        meta: { minSize: 150, maxSize: 200, size: 180 } as ColumnMeta,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <SortableHeader column={column}>Updated</SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {formatDate(row.original.updatedAt)}
          </div>
        ),
        meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
      },
      {
        id: "actions",
        header: () => <></>,
        cell: ({ row }) => {
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-end"
            >
              <ActionButton id={row.original.id} />
            </div>
          );
        },
        meta: {
          minSize: 60,
          maxSize: 60,
          size: 60,
          align: "right",
        } as ColumnMeta,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  const table = useReactTable({
    data: contracts,
    columns,
    state: { sorting },
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
  }, [contracts.length, table]);

  return (
    <>
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="dashboard-zoom-mobile">
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7B8B91] font-poppins text-[16px]">
                No contracts found
              </p>
              <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                Try adjusting filters or create a new contract.
              </p>
            </div>
          ) : (
            <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
              <Table className="w-full border-0 table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-[#F3F3F3] border-b-0"
                    >
                      {headerGroup.headers.map((header) => {
                        const column = header.column.columnDef;
                        const meta = (column.meta as ColumnMeta) || {};
                        return (
                          <TableHead
                            key={header.id}
                            style={{
                              minWidth: meta.minSize
                                ? `${meta.minSize}px`
                                : undefined,
                              maxWidth: meta.maxSize
                                ? `${meta.maxSize}px`
                                : undefined,
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
                        className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => handleRowClick(row.original.id)}
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
                              className={cn(
                                "px-6 py-3 overflow-hidden align-middle",
                                meta.align === "center"
                                  ? "text-center"
                                  : meta.align === "right"
                                    ? "text-right"
                                    : "text-left",
                              )}
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
                        <p className="text-[#7B8B91] font-poppins text-[16px]">
                          No contracts found
                        </p>
                        <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                          Try adjusting filters or create a new contract.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      {contracts.length > 0 && <Pagination table={table} />}
    </>
  );
}
