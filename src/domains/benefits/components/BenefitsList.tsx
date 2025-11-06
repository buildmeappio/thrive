"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BenefitData } from "../types/Benefit";
import { deleteBenefitAction } from "../actions";
import { toast } from "sonner";
import { Plus, List, Grid, Table, ChevronDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BenefitCard from "./BenefitCard";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type Row,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
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

type BenefitsListProps = {
  benefits: BenefitData[];
  examinationTypes: { label: string; value: string }[];
};

type ViewMode = "list" | "grid" | "table";
type SortOption = "name" | "examType" | "date";

export default function BenefitsList({ benefits, examinationTypes }: BenefitsListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [benefitToDelete, setBenefitToDelete] = useState<BenefitData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique exam types from benefits
  const examTypesForFilter = useMemo(() => {
    const uniqueTypes = new Set(benefits.map(b => b.examinationTypeId));
    return examinationTypes.filter(et => uniqueTypes.has(et.value));
  }, [benefits, examinationTypes]);

  // Filter and sort benefits
  const filteredAndSortedBenefits = useMemo(() => {
    let filtered = benefits;

    // Filter by exam type
    if (selectedExamType) {
      filtered = filtered.filter(b => b.examinationTypeId === selectedExamType);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.benefit.localeCompare(b.benefit);
        case "examType":
          return a.examinationTypeName.localeCompare(b.examinationTypeName);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [benefits, selectedExamType, sortBy]);

  const handleDelete = async () => {
    if (!benefitToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteBenefitAction(benefitToDelete.id);
      if (response.success) {
        toast.success("Benefit deleted successfully");
        router.refresh();
      } else {
        toast.error(response.error || "Failed to delete benefit");
      }
    } catch {
      toast.error("Failed to delete benefit");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBenefitToDelete(null);
    }
  };

  const handleEdit = (benefit: BenefitData) => {
    router.push(`/dashboard/benefits/${benefit.id}/edit`);
  };

  const handleDeleteClick = (benefit: BenefitData) => {
    setBenefitToDelete(benefit);
    setDeleteDialogOpen(true);
  };

  // Table columns definition
  const columnsDef = [
    {
      accessorKey: "examinationTypeName",
      header: "Exam Type",
      cell: ({ row }: { row: Row<BenefitData> }) => {
        const examType = row.getValue("examinationTypeName") as string;
        return (
          <div 
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={examType}
          >
            {examType}
          </div>
        );
      },
      minSize: 180,
      maxSize: 250,
      size: 220,
    },
    {
      accessorKey: "benefit",
      header: "Benefit Name",
      cell: ({ row }: { row: Row<BenefitData> }) => {
        const benefit = row.getValue("benefit") as string;
        return (
          <div 
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={benefit}
          >
            {benefit}
          </div>
        );
      },
      minSize: 200,
      maxSize: 300,
      size: 250,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: Row<BenefitData> }) => {
        const description = row.original.description;
        return (
          <div 
            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
            title={description || undefined}
          >
            {description ? description : <span className="text-gray-400 italic">N/A</span>}
          </div>
        );
      },
      minSize: 300,
      maxSize: 500,
      size: 400,
    },
    {
      header: "",
      accessorKey: "id",
      cell: ({ row }: { row: Row<BenefitData> }) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.original)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
      minSize: 100,
      maxSize: 120,
      size: 120,
    },
  ];

  // Create table instance for table view
  const table = useReactTable({
    data: filteredAndSortedBenefits,
    columns: columnsDef,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Reset to first page when filtering changes
  useEffect(() => {
    if (viewMode === "table") {
      table.setPageIndex(0);
    }
  }, [selectedExamType, sortBy, table, viewMode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight mb-6">
          All Benefits Type
        </h1>

        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-normal whitespace-nowrap">Sort</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent w-full sm:w-auto"
                >
                  <option value="name">Name</option>
                  <option value="examType">Exam Type</option>
                  <option value="date">Date</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-0 bg-white border border-gray-300 rounded-lg p-1 w-full sm:w-auto">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded transition-all flex-1 sm:flex-initial",
                  viewMode === "list"
                    ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                )}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="text-xs sm:text-sm">List</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded transition-all flex-1 sm:flex-initial",
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                )}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded transition-all flex-1 sm:flex-initial",
                  viewMode === "table"
                    ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                )}
                title="Table View"
              >
                <Table className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Table</span>
              </button>
            </div>
          </div>

          {/* Add New Benefit Button */}
          <Button
            onClick={() => router.push("/dashboard/benefits/new")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full px-3 sm:px-4 py-2 hover:opacity-90 transition-opacity font-semibold w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">Add New Benefits</span>
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setSelectedExamType(null)}
            className={cn(
              "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
              selectedExamType === null
                ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            View All
          </button>
          {examTypesForFilter.map((examType) => (
            <button
              key={examType.value}
              onClick={() => setSelectedExamType(examType.value)}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                selectedExamType === examType.value
                  ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {examType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits Display */}
      {filteredAndSortedBenefits.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {filteredAndSortedBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Table Card */}
            <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
              {/* Table */}
              <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
                <UITable className="w-full border-0 table-fixed">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          const columnIndex = header.index;
                          const columnDef = columnsDef[columnIndex];
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
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                          {selectedExamType ? "No benefits found for selected exam type" : "No benefits found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </UITable>
              </div>
            </div>

            {/* Pagination - Outside the card */}
            <div className="mt-4 px-6">
              <Pagination table={table} />
            </div>
          </>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">
            {selectedExamType ? "No benefits found for selected exam type" : "No benefits found"}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the benefit <strong>{benefitToDelete?.benefit}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

