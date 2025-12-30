"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FeeStructureStatus } from "@prisma/client";
import { Pencil, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Pagination from "@/components/Pagination";
import { FeeStructureListItem } from "../types/feeStructure.types";
import {
  duplicateFeeStructureAction,
  archiveFeeStructureAction,
  updateFeeStructureStatusAction,
  deleteFeeStructureAction,
} from "../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  column: Column<FeeStructureListItem, unknown>;
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

type FeeStructuresTableProps = {
  feeStructures: FeeStructureListItem[];
  showPaginationOnly?: boolean;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function FeeStructuresTable({
  feeStructures,
  showPaginationOnly = false,
}: FeeStructuresTableProps) {
  const router = useRouter();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [structureToArchive, setStructureToArchive] =
    useState<FeeStructureListItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] =
    useState<FeeStructureListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [feeStructuresData, setFeeStructuresData] = useState(feeStructures);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Update local state when feeStructures prop changes
  useEffect(() => {
    setFeeStructuresData(feeStructures);
  }, [feeStructures]);

  const handleStatusChange = useCallback(
    async (feeStructureId: string, newStatus: FeeStructureStatus) => {
      setUpdatingStatus(feeStructureId);
      try {
        const result = await updateFeeStructureStatusAction(
          feeStructureId,
          newStatus,
        );

        if ("error" in result) {
          const errorMessage = result.error ?? "Failed to update status";
          toast.error(errorMessage);
          // Revert optimistic update
          setFeeStructuresData(feeStructures);
          return;
        }
        // Update local state optimistically
        setFeeStructuresData((prev) =>
          prev.map((fs) =>
            fs.id === feeStructureId ? { ...fs, status: newStatus } : fs,
          ),
        );
        toast.success(
          `Fee structure ${newStatus === FeeStructureStatus.ACTIVE ? "activated" : "set to draft"} successfully`,
        );
        router.refresh();
      } catch (error) {
        console.error("Error updating fee structure status:", error);
        toast.error("An error occurred while updating status");
        // Revert optimistic update
        setFeeStructuresData(feeStructures);
      } finally {
        setUpdatingStatus(null);
      }
    },
    [router, feeStructures],
  );

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/dashboard/fee-structures/${id}`);
    },
    [router],
  );

  const handleDuplicate = useCallback(
    async (e: React.MouseEvent, feeStructure: FeeStructureListItem) => {
      e.stopPropagation();
      setIsDuplicating(feeStructure.id);

      try {
        const result = await duplicateFeeStructureAction(feeStructure.id);

        if ("error" in result) {
          toast.error(result.error ?? "Failed to duplicate fee structure");
          return;
        }
        toast.success("Fee structure duplicated successfully");
        router.push(`/dashboard/fee-structures/${result.data.id}`);
      } catch {
        toast.error("An error occurred");
      } finally {
        setIsDuplicating(null);
      }
    },
    [router],
  );

  const handleArchiveClick = useCallback(
    (e: React.MouseEvent, feeStructure: FeeStructureListItem) => {
      e.stopPropagation();
      setStructureToArchive(feeStructure);
      setArchiveDialogOpen(true);
    },
    [],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, feeStructure: FeeStructureListItem) => {
      e.stopPropagation();
      setStructureToDelete(feeStructure);
      setDeleteDialogOpen(true);
    },
    [],
  );

  // Define columns
  const columns = useMemo<ColumnDef<FeeStructureListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column}>Name</SortableHeader>
        ),
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={row.getValue("name") as string}
          >
            {row.getValue("name")}
          </div>
        ),
        meta: { minSize: 150, maxSize: 300, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: "variableCount",
        header: ({ column }) => (
          <SortableHeader column={column}>Variables</SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {row.getValue("variableCount")}
          </div>
        ),
        meta: {
          minSize: 100,
          maxSize: 150,
          size: 120,
          align: "center",
        } as ColumnMeta,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <SortableHeader column={column}>Last Updated</SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {formatDate(row.getValue("updatedAt") as string)}
          </div>
        ),
        meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column}>Status</SortableHeader>
        ),
        cell: ({ row }) => {
          const feeStructure = row.original;
          const isUpdating = updatingStatus === feeStructure.id;
          const currentStatus = feeStructure.status;

          // Don't show dropdown for archived structures
          if (currentStatus === FeeStructureStatus.ARCHIVED) {
            return (
              <div className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                {formatText(currentStatus)}
              </div>
            );
          }

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Select
                value={currentStatus}
                onValueChange={(value) => {
                  const newStatus = value as FeeStructureStatus;
                  if (newStatus !== currentStatus) {
                    handleStatusChange(feeStructure.id, newStatus);
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
                    {isUpdating ? "Updating..." : formatText(currentStatus)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FeeStructureStatus.ACTIVE}>
                    Active
                  </SelectItem>
                  <SelectItem value={FeeStructureStatus.DRAFT}>
                    Draft
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
        meta: { minSize: 120, maxSize: 150, size: 130 } as ColumnMeta,
      },
      {
        id: "actions",
        header: () => (
          <div className="text-base font-medium text-black">Actions</div>
        ),
        cell: ({ row }) => {
          const feeStructure = row.original;
          return (
            <div
              className="flex items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(feeStructure.id);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Edit fee structure"
              >
                <Pencil className="w-4 h-4 text-[#7B8B91]" />
              </button>
              <button
                onClick={(e) => handleDuplicate(e, feeStructure)}
                disabled={isDuplicating === feeStructure.id}
                className="font-poppins text-sm text-[#7B8B91] hover:text-[#000000] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDuplicating === feeStructure.id
                  ? "Duplicating..."
                  : "Duplicate"}
              </button>
              {feeStructure.status !== FeeStructureStatus.ARCHIVED && (
                <>
                  <button
                    onClick={(e) => handleArchiveClick(e, feeStructure)}
                    className="font-poppins text-sm text-[#7B8B91] hover:text-[#000000] transition-colors cursor-pointer"
                  >
                    Archive
                  </button>
                  {feeStructure.contractCount === 0 &&
                    feeStructure.templateCount === 0 && (
                      <button
                        onClick={(e) => handleDeleteClick(e, feeStructure)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        aria-label="Delete fee structure"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                </>
              )}
            </div>
          );
        },
        meta: { minSize: 200, maxSize: 300, size: 250 } as ColumnMeta,
      },
    ],
    [
      handleRowClick,
      handleDuplicate,
      handleArchiveClick,
      isDuplicating,
      handleStatusChange,
      updatingStatus,
    ],
  );

  const table = useReactTable({
    data: feeStructuresData,
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
  }, [feeStructuresData.length, table]);

  // If only showing pagination, return just that
  if (showPaginationOnly) {
    return <Pagination table={table} />;
  }

  const handleArchive = async () => {
    if (!structureToArchive) return;

    setIsArchiving(true);

    try {
      const result = await archiveFeeStructureAction(structureToArchive.id);

      if ("error" in result) {
        toast.error(result.error ?? "Failed to archive fee structure");
        return;
      }
      toast.success("Fee structure archived successfully");
      router.refresh();
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
      setStructureToArchive(null);
    }
  };

  const handleDelete = async () => {
    if (!structureToDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteFeeStructureAction(structureToDelete.id);

      if ("error" in result) {
        toast.error(result.error ?? "Failed to delete fee structure");
        return;
      }
      toast.success("Fee structure deleted successfully");
      router.refresh();
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setStructureToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="dashboard-zoom-mobile">
          {feeStructuresData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7B8B91] font-poppins text-[16px]">
                No fee structures found
              </p>
              <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                Try adjusting filters or create a new fee structure.
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
                        onClick={() => handleRowClick(row.original.id)}
                        className="bg-white border-0 border-b transition-colors hover:bg-muted/50 cursor-pointer"
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
                          No fee structures found
                        </p>
                        <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                          Try adjusting filters or create a new fee structure.
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

      {/* Pagination - Outside the card */}
      {!showPaginationOnly && feeStructuresData.length > 0 && (
        <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
          <Pagination table={table} />
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong>{structureToArchive?.name}</strong>? Archived fee
              structures cannot be edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-gray-600 hover:bg-gray-700"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{structureToDelete?.name}</strong>? This action cannot be
              undone. The fee structure will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
