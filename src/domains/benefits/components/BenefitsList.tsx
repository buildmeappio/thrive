"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BenefitData } from "../types/Benefit";
import { deleteBenefitAction } from "../actions";
import { toast } from "sonner";
import { Plus, List, Grid, Table, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
    <div className="space-y-6 benefits-page">
      {/* Header */}
      <div className="dashboard-zoom-mobile">
        {/* Heading with Add Button on Mobile */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
            All Benefits Type
          </h1>
          {/* Add New Benefit Button - Visible on Mobile, Hidden on Desktop (will show in control bar) */}
          <Button
            onClick={() => router.push("/dashboard/benefits/new")}
            className="flex sm:hidden items-center justify-center gap-1.5 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full px-3 py-1.5 hover:opacity-90 transition-opacity font-semibold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Add</span>
          </Button>
        </div>

        {/* Define SVG gradients */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="examTypeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#01F4C8" />
              <stop offset="100%" stopColor="#00A8FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Control Bar - View Mode and Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
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

          {/* Add New Benefit Button - Hidden on Mobile, Visible on Desktop */}
          <Button
            onClick={() => router.push("/dashboard/benefits/new")}
            className="hidden sm:flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full px-3 sm:px-4 py-2 hover:opacity-90 transition-opacity font-semibold text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">Add New Benefits</span>
          </Button>
        </div>

        {/* Sort and Filter Row */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Sort Dropdown - Left */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial min-w-0">
            <span className="text-xs sm:text-sm text-gray-600 font-normal whitespace-nowrap">Sort</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-7 sm:h-9 w-[90px] sm:w-[120px] text-xs sm:text-sm px-2 sm:px-3 border-gray-300 rounded-lg bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="examType">Exam Type</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Dropdown - Right */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
            <Select
              value={selectedExamType || "all"}
              onValueChange={(value) => setSelectedExamType(value === "all" ? null : value)}
            >
              <SelectTrigger
                className={cn(
                  "h-7 sm:h-9 w-[130px] sm:w-auto min-w-[130px] sm:min-w-[150px] text-xs sm:text-sm pl-2 pr-3 sm:px-6 border rounded-full font-poppins bg-white [&>svg]:hidden",
                  selectedExamType !== null
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700"
                )}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 self-center align-middle"
                    fill="none"
                    stroke="url(#examTypeGradient)"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                  <SelectValue placeholder="Exam Type" className="truncate" />
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" sideOffset={4}>
                <SelectItem value="all">View All</SelectItem>
                {examTypesForFilter.map((examType) => (
                  <SelectItem key={examType.value} value={examType.value}>
                    {examType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="dashboard-zoom-mobile">
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
            <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
              <Pagination table={table} />
            </div>
          </div>
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

