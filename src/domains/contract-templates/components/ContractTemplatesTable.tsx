"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { ContractTemplateListItem } from "../types/contractTemplate.types";
import { updateContractTemplateAction } from "../actions";

type Props = {
  templates: ContractTemplateListItem[];
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

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<ContractTemplateListItem, unknown>;
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

export default function ContractTemplatesTable({ templates }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [templatesData, setTemplatesData] =
    useState<ContractTemplateListItem[]>(templates);

  // Update local state when templates prop changes
  useEffect(() => {
    setTemplatesData(templates);
  }, [templates]);

  const handleStatusChange = useCallback(
    async (templateId: string, newStatus: boolean) => {
      setUpdatingStatus(templateId);
      try {
        const result = await updateContractTemplateAction({
          id: templateId,
          isActive: newStatus,
        });

        if (result.success) {
          // Update local state optimistically
          setTemplatesData((prev) =>
            prev.map((t) =>
              t.id === templateId ? { ...t, isActive: newStatus } : t,
            ),
          );
          toast.success(
            `Template ${newStatus ? "activated" : "deactivated"} successfully`,
          );
          router.refresh();
        } else {
          const errorMessage =
            "error" in result ? result.error : "Failed to update status";
          toast.error(errorMessage);
          // Revert optimistic update
          setTemplatesData(templates);
        }
      } catch (error) {
        console.error("Error updating template status:", error);
        toast.error("An error occurred while updating status");
        // Revert optimistic update
        setTemplatesData(templates);
      } finally {
        setUpdatingStatus(null);
      }
    },
    [router, templates],
  );

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/dashboard/contract-templates/${id}`);
    },
    [router],
  );

  const columns = useMemo<ColumnDef<ContractTemplateListItem>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: ({ column }) => (
          <SortableHeader column={column}>Name</SortableHeader>
        ),
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={row.original.displayName}
          >
            {row.original.displayName}
          </div>
        ),
        meta: { minSize: 150, maxSize: 300, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: "slug",
        header: ({ column }) => (
          <SortableHeader column={column}>Slug</SortableHeader>
        ),
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis font-mono"
            title={row.original.slug}
          >
            {row.original.slug}
          </div>
        ),
        meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
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
        accessorKey: "isActive",
        header: ({ column }) => (
          <SortableHeader column={column}>Status</SortableHeader>
        ),
        cell: ({ row }) => {
          const template = row.original;
          const isUpdating = updatingStatus === template.id;

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Select
                value={template.isActive ? "active" : "inactive"}
                onValueChange={(value) => {
                  const newStatus = value === "active";
                  if (newStatus !== template.isActive) {
                    handleStatusChange(template.id, newStatus);
                  }
                }}
                disabled={isUpdating}
              >
                <SelectTrigger
                  className={cn(
                    "w-[120px] h-8 text-sm font-poppins border-gray-200",
                    isUpdating && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <SelectValue>
                    {isUpdating
                      ? "Updating..."
                      : template.isActive
                        ? "Active"
                        : "Inactive"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
        meta: { minSize: 120, maxSize: 150, size: 130 } as ColumnMeta,
      },
      {
        id: "actions",
        header: () => <></>,
        cell: ({ row }) => {
          return (
            <div
              className="flex items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/dashboard/contract-templates/${row.original.id}`,
                  );
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Edit template"
              >
                <Pencil className="w-4 h-4 text-[#7B8B91]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement archive
                }}
                className="font-poppins text-sm text-[#7B8B91] hover:text-[#000000] transition-colors cursor-pointer"
              >
                Archive
              </button>
            </div>
          );
        },
        meta: { minSize: 150, maxSize: 200, size: 180 } as ColumnMeta,
      },
    ],
    [router, handleStatusChange, updatingStatus],
  );

  const table = useReactTable({
    data: templatesData,
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
  }, [templatesData.length, table]);

  return (
    <>
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="dashboard-zoom-mobile">
          {templatesData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7B8B91] font-poppins text-[16px]">
                No contract templates found
              </p>
              <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                Try adjusting filters or create a new template.
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
                        <p className="text-[#7B8B91] font-poppins text-[16px]">
                          No contract templates found
                        </p>
                        <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                          Try adjusting filters or create a new template.
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
      {templatesData.length > 0 && <Pagination table={table} />}
    </>
  );
}
