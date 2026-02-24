'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BenefitData } from '../types/Benefit';
import { deleteBenefitAction } from '../actions';
import { toast } from 'sonner';
import { Plus, List, Grid, Table, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import BenefitCard from './BenefitCard';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type Row,
} from '@tanstack/react-table';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/Pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type BenefitsListProps = {
  benefits: BenefitData[];
  examinationTypes: { label: string; value: string }[];
};

type ViewMode = 'list' | 'grid' | 'table';
type SortOption = 'name' | 'examType' | 'date';

export default function BenefitsList({ benefits, examinationTypes }: BenefitsListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
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
        case 'name':
          return a.benefit.localeCompare(b.benefit);
        case 'examType':
          return a.examinationTypeName.localeCompare(b.examinationTypeName);
        case 'date':
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
        toast.success('Benefit deleted successfully');
        router.refresh();
      } else {
        toast.error(response.error || 'Failed to delete benefit');
      }
    } catch {
      toast.error('Failed to delete benefit');
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
      accessorKey: 'examinationTypeName',
      header: 'Exam Type',
      cell: ({ row }: { row: Row<BenefitData> }) => {
        const examType = row.getValue('examinationTypeName') as string;
        return (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
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
      accessorKey: 'benefit',
      header: 'Benefit Name',
      cell: ({ row }: { row: Row<BenefitData> }) => {
        const benefit = row.getValue('benefit') as string;
        return (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: { row: Row<BenefitData> }) => {
        const description = row.original.description;
        return (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
            title={description || undefined}
          >
            {description ? description : <span className="italic text-gray-400">N/A</span>}
          </div>
        );
      },
      minSize: 300,
      maxSize: 500,
      size: 400,
    },
    {
      header: '',
      accessorKey: 'id',
      cell: ({ row }: { row: Row<BenefitData> }) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.original)}
            className="rounded-lg p-2 transition-colors hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
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
    if (viewMode === 'table') {
      table.setPageIndex(0);
    }
  }, [selectedExamType, sortBy, table, viewMode]);

  return (
    <div className="benefits-page space-y-6">
      {/* Header */}
      <div className="dashboard-zoom-mobile">
        {/* Heading with Add Button on Mobile */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h1 className="font-degular text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            All Benefits Type
          </h1>
          {/* Add New Benefit Button - Visible on Mobile, Hidden on Desktop (will show in control bar) */}
          <Button
            onClick={() => router.push('/dashboard/benefits/new')}
            className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:hidden"
          >
            <Plus className="h-3.5 w-3.5" />
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
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* View Mode Buttons */}
          <div className="flex w-full items-center gap-0 rounded-lg border border-gray-300 bg-white p-1 sm:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 transition-all sm:flex-initial sm:gap-2 sm:px-3',
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] font-semibold text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title="List View"
            >
              <List className="h-4 w-4" />
              <span className="text-xs sm:text-sm">List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 transition-all sm:flex-initial sm:gap-2 sm:px-3',
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] font-semibold text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 transition-all sm:flex-initial sm:gap-2 sm:px-3',
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] font-semibold text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title="Table View"
            >
              <Table className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Table</span>
            </button>
          </div>

          {/* Add New Benefit Button - Hidden on Mobile, Visible on Desktop */}
          <Button
            onClick={() => router.push('/dashboard/benefits/new')}
            className="hidden items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:flex sm:px-4 sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Add New Benefits</span>
          </Button>
        </div>

        {/* Sort and Filter Row */}
        <div className="mb-4 flex flex-row items-center justify-between gap-2 sm:mb-6 sm:gap-4">
          {/* Sort Dropdown - Left */}
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:flex-initial sm:gap-2">
            <span className="whitespace-nowrap text-xs font-normal text-gray-600 sm:text-sm">
              Sort
            </span>
            <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-7 w-[90px] rounded-lg border-gray-300 bg-white px-2 text-xs sm:h-9 sm:w-[120px] sm:px-3 sm:text-sm">
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
          <div className="flex min-w-0 flex-shrink-0 items-center gap-1 sm:gap-2">
            <Select
              value={selectedExamType || 'all'}
              onValueChange={value => setSelectedExamType(value === 'all' ? null : value)}
            >
              <SelectTrigger
                className={cn(
                  'font-poppins h-7 w-[130px] min-w-[130px] rounded-full border bg-white pl-2 pr-3 text-xs sm:h-9 sm:w-auto sm:min-w-[150px] sm:px-6 sm:text-sm [&>svg]:hidden',
                  selectedExamType !== null
                    ? 'border-[#00A8FF] text-[#00A8FF]'
                    : 'border-gray-200 text-gray-700'
                )}
              >
                <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
                  <svg
                    className="h-3.5 w-3.5 flex-shrink-0 self-center align-middle sm:h-4 sm:w-4"
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
                    className="ml-auto h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4"
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
                {examTypesForFilter.map(examType => (
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
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredAndSortedBenefits.map(benefit => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredAndSortedBenefits.map(benefit => (
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
            <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
              {/* Table */}
              <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
                <UITable className="w-full table-fixed border-0">
                  <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
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
                                'overflow-hidden whitespace-nowrap px-6 py-2 text-left text-base font-medium text-black',
                                header.index === 0 && 'rounded-l-2xl',
                                header.index === headerGroup.headers.length - 1 && 'rounded-r-2xl'
                              )}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map(row => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className="border-b-1 border-0 bg-white"
                        >
                          {row.getVisibleCells().map(cell => {
                            const columnIndex = cell.column.getIndex();
                            const columnDef = columnsDef[columnIndex];
                            const minWidth = columnDef?.minSize || 'auto';
                            const maxWidth = columnDef?.maxSize || 'auto';
                            const width = columnDef?.size || 'auto';
                            return (
                              <TableCell
                                key={cell.id}
                                style={{
                                  minWidth:
                                    typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
                                  maxWidth:
                                    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
                                  width: typeof width === 'number' ? `${width}px` : width,
                                }}
                                className="overflow-hidden px-6 py-3 align-middle"
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
                          className="font-poppins h-24 text-center text-[16px] leading-normal text-black"
                        >
                          {selectedExamType
                            ? 'No benefits found for selected exam type'
                            : 'No benefits found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </UITable>
              </div>
            </div>

            {/* Pagination - Outside the card */}
            <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
              <Pagination table={table} />
            </div>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <p className="text-lg text-gray-500">
            {selectedExamType ? 'No benefits found for selected exam type' : 'No benefits found'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the benefit <strong>{benefitToDelete?.benefit}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
