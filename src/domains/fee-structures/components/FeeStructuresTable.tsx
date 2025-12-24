"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FeeStructureStatus } from "@prisma/client";
import { Copy, Archive, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "../actions";

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
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

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

        if (result.success) {
          toast.success("Fee structure duplicated successfully");
          router.push(`/dashboard/fee-structures/${result.data.id}`);
        } else {
          const errorResult = result as { success: false; error: string };
          toast.error(errorResult.error || "Failed to duplicate fee structure");
        }
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

  // Define columns
  const columns = useMemo<ColumnDef<FeeStructureListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
            title={row.getValue("name")}
          >
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={formatText(row.getValue("status"))}
          >
            {formatText(row.getValue("status"))}
          </div>
        ),
      },
      {
        accessorKey: "variableCount",
        header: "Variables",
        cell: ({ row }) => (
          <span className="text-[#4D4D4D] font-poppins text-[16px] leading-normal">
            {row.getValue("variableCount")}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => (
          <span className="text-[#4D4D4D] font-poppins text-[16px] leading-normal">
            {formatDate(row.getValue("updatedAt"))}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const feeStructure = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(feeStructure.id);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleDuplicate(e, feeStructure)}
                  disabled={isDuplicating === feeStructure.id}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {isDuplicating === feeStructure.id
                    ? "Duplicating..."
                    : "Duplicate"}
                </DropdownMenuItem>
                {feeStructure.status !== FeeStructureStatus.ARCHIVED && (
                  <DropdownMenuItem
                    onClick={(e) => handleArchiveClick(e, feeStructure)}
                    className="text-red-600"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleRowClick, handleDuplicate, handleArchiveClick, isDuplicating],
  );

  const table = useReactTable({
    data: feeStructures,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
  }, [feeStructures.length, table]);

  // If only showing pagination, return just that
  if (showPaginationOnly) {
    return <Pagination table={table} />;
  }

  const handleArchive = async () => {
    if (!structureToArchive) return;

    setIsArchiving(true);

    try {
      const result = await archiveFeeStructureAction(structureToArchive.id);

      if (result.success) {
        toast.success("Fee structure archived successfully");
        router.refresh();
      } else {
        const errorResult = result as { success: false; error: string };
        toast.error(errorResult.error || "Failed to archive fee structure");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
      setStructureToArchive(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="dashboard-zoom-mobile">
          {feeStructures.length === 0 ? (
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
                      {headerGroup.headers.map((header, index) => (
                        <TableHead
                          key={header.id}
                          className={`px-6 py-2 text-base font-medium text-black whitespace-nowrap overflow-hidden ${
                            index === 0 ? "rounded-l-2xl text-left" : ""
                          } ${
                            index === headerGroup.headers.length - 1
                              ? "rounded-r-2xl text-right"
                              : ""
                          } ${
                            header.id === "variableCount"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
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
                        onClick={() => handleRowClick(row.original.id)}
                        className="bg-white border-0 border-b transition-colors hover:bg-muted/50 cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell
                            key={cell.id}
                            className={`px-6 py-3 overflow-hidden align-middle ${
                              index === row.getVisibleCells().length - 1
                                ? "text-right"
                                : ""
                            } ${
                              cell.column.id === "variableCount"
                                ? "text-center"
                                : ""
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
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
      {!showPaginationOnly && feeStructures.length > 0 && (
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
    </>
  );
}
