'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { updateContractReviewDateAction } from '../actions';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Column,
  SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/Pagination';
import type { ContractListItem } from '../types/contract.types';
import { formatText } from '@/utils/text';

type Props = {
  contracts: ContractListItem[];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/dashboard/contracts/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-white" />
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
    const newDate = dateValue ? new Date(dateValue + 'T00:00:00.000Z') : null;
    setIsUpdating(true);
    try {
      const result = await updateContractReviewDateAction(contract.id, newDate);
      if ('error' in result) {
        toast.error(result.error ?? 'Failed to update review date');
        return;
      }
      toast.success(newDate ? 'Review date updated successfully' : 'Review date cleared');
      setShowDatePicker(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update review date');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
      {showDatePicker ? (
        <input
          type="date"
          defaultValue={
            contract.reviewedAt ? new Date(contract.reviewedAt).toISOString().split('T')[0] : ''
          }
          onBlur={() => setShowDatePicker(false)}
          onChange={handleDateChange}
          disabled={isUpdating}
          className="font-poppins rounded border border-gray-300 px-2 py-1 text-[16px] text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/30"
          autoFocus
        />
      ) : (
        <div className="group flex items-center gap-2">
          <span className="font-poppins whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]">
            {contract.reviewedAt ? formatDate(contract.reviewedAt) : 'Not reviewed'}
          </span>
          <button
            onClick={() => setShowDatePicker(true)}
            className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
            title="Set review date"
          >
            <Calendar className="h-4 w-4 text-[#7B8B91]" />
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
  align?: 'left' | 'center' | 'right';
}) => {
  const sortDirection = column.getIsSorted();

  const handleSort = () => {
    if (sortDirection === false) {
      column.toggleSorting(false); // Set to ascending
    } else if (sortDirection === 'asc') {
      column.toggleSorting(true); // Set to descending
    } else {
      column.clearSorting(); // Clear sorting (back to original)
    }
  };

  return (
    <div
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 transition-colors hover:text-[#000093]',
        align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
      )}
      onClick={handleSort}
    >
      <span>{children}</span>
      {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
      {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
      {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
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
    [router]
  );

  const columns = useMemo<ColumnDef<ContractListItem>[]>(
    () => [
      {
        accessorKey: 'examinerName',
        header: ({ column }) => <SortableHeader column={column}>Examiner</SortableHeader>,
        cell: ({ row }) => (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
            title={row.original.examinerName || 'N/A'}
          >
            {row.original.examinerName || 'N/A'}
          </div>
        ),
        meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: 'templateName',
        header: ({ column }) => <SortableHeader column={column}>Template</SortableHeader>,
        cell: ({ row }) => (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
            title={row.original.templateName || 'N/A'}
          >
            {row.original.templateName || 'N/A'}
          </div>
        ),
        meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: 'status',
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
            <span className="inline-flex min-w-[80px] items-center justify-center whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
              {formatText(row.original.status)}
            </span>
          </div>
        ),
        meta: {
          minSize: 120,
          maxSize: 180,
          size: 150,
          align: 'center',
        } as ColumnMeta,
      },
      {
        accessorKey: 'reviewedAt',
        header: ({ column }) => <SortableHeader column={column}>Review Date</SortableHeader>,
        cell: ({ row }) => <ReviewDateCell contract={row.original} />,
        meta: { minSize: 150, maxSize: 200, size: 180 } as ColumnMeta,
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => <SortableHeader column={column}>Updated</SortableHeader>,
        cell: ({ row }) => (
          <div className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]">
            {formatDate(row.original.updatedAt)}
          </div>
        ),
        meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
      },
      {
        id: 'actions',
        header: () => <></>,
        cell: ({ row }) => {
          return (
            <div onClick={e => e.stopPropagation()} className="flex items-center justify-end">
              <ActionButton id={row.original.id} />
            </div>
          );
        },
        meta: {
          minSize: 60,
          maxSize: 60,
          size: 60,
          align: 'right',
        } as ColumnMeta,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
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
      <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
        <div className="dashboard-zoom-mobile">
          {contracts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-poppins text-[16px] text-[#7B8B91]">No contracts found</p>
              <p className="font-poppins mt-1 text-[13px] text-[#A3ADB3]">
                Try adjusting filters or create a new contract.
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
              <Table className="w-full table-fixed border-0">
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="border-b-0 bg-[#F3F3F3]">
                      {headerGroup.headers.map(header => {
                        const column = header.column.columnDef;
                        const meta = (column.meta as ColumnMeta) || {};
                        return (
                          <TableHead
                            key={header.id}
                            style={{
                              minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                              maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                              width: meta.size ? `${meta.size}px` : undefined,
                            }}
                            className={cn(
                              'overflow-hidden whitespace-nowrap px-6 py-2 text-base font-medium text-black',
                              meta.align === 'center'
                                ? 'text-center'
                                : meta.align === 'right'
                                  ? 'text-right'
                                  : 'text-left',
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
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => handleRowClick(row.original.id)}
                      >
                        {row.getVisibleCells().map(cell => {
                          const column = cell.column.columnDef;
                          const meta = (column.meta as ColumnMeta) || {};
                          return (
                            <TableCell
                              key={cell.id}
                              style={{
                                minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                                maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                                width: meta.size ? `${meta.size}px` : undefined,
                              }}
                              className={cn(
                                'overflow-hidden px-6 py-3 align-middle',
                                meta.align === 'center'
                                  ? 'text-center'
                                  : meta.align === 'right'
                                    ? 'text-right'
                                    : 'text-left'
                              )}
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
                        colSpan={columns.length}
                        className="font-poppins h-24 text-center text-[16px] leading-normal text-black"
                      >
                        <p className="font-poppins text-[16px] text-[#7B8B91]">
                          No contracts found
                        </p>
                        <p className="font-poppins mt-1 text-[13px] text-[#A3ADB3]">
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
