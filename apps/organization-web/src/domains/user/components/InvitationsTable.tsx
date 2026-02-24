'use client';

import React, { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvitationRow } from '../actions/listInvitations';

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const textCellClass = 'text-[#4D4D4D] font-poppins text-[16px] leading-normal';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const createColumns = (): ColumnDef<InvitationRow, unknown>[] => [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        Email
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => (
      <p className={textCellClass} title={row.original.email}>
        {row.original.email}
      </p>
    ),
    meta: { minSize: 200, maxSize: 300, size: 250 } as ColumnMeta,
  },
  {
    accessorKey: 'roleName',
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        Role
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-[16px] font-medium text-gray-700">
        {row.original.roleName}
      </span>
    ),
    meta: { minSize: 150, maxSize: 200, size: 170 } as ColumnMeta,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex w-full items-center justify-center gap-2 transition-opacity hover:opacity-70"
      >
        Status
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        accepted: 'bg-green-100 text-green-800 border-green-200',
        expired: 'bg-red-100 text-red-800 border-red-200',
      };
      return (
        <div className="flex items-center justify-center">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium capitalize',
              statusColors[status]
            )}
          >
            {status}
          </span>
        </div>
      );
    },
    meta: { minSize: 100, maxSize: 150, size: 120, align: 'center' } as ColumnMeta,
  },
  {
    accessorKey: 'invitedBy',
    header: 'Invited By',
    cell: ({ row }) => <p className={textCellClass}>{row.original.invitedBy || 'N/A'}</p>,
    meta: { minSize: 150, maxSize: 200, size: 170 } as ColumnMeta,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        Sent Date
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <p className={textCellClass}>{formatDate(row.original.createdAt)}</p>,
    meta: { minSize: 120, maxSize: 160, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires',
    cell: ({ row }) => <p className={textCellClass}>{formatDate(row.original.expiresAt)}</p>,
    meta: { minSize: 120, maxSize: 160, size: 140 } as ColumnMeta,
  },
];

type useInvitationsTableOptions = {
  data: InvitationRow[];
  searchQuery: string;
};

export const useInvitationsTable = (props: useInvitationsTableOptions) => {
  const { data, searchQuery } = props;
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      invitation =>
        invitation.email.toLowerCase().includes(query) ||
        invitation.roleName.toLowerCase().includes(query) ||
        invitation.invitedBy?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return {
    table,
    columns,
  };
};

type InvitationsTableProps = {
  table: ReturnType<typeof useInvitationsTable>['table'];
  columns: ReturnType<typeof useInvitationsTable>['columns'];
};

const InvitationsTable: React.FC<InvitationsTableProps> = ({ table, columns }) => {
  return (
    <>
      <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
        <Table className="w-full table-fixed border-0">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
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
                        'overflow-hidden whitespace-nowrap py-2 text-left text-base font-medium text-black',
                        'px-4 sm:px-5 md:px-6',
                        index === 0 && 'rounded-l-2xl',
                        index === headerGroup.headers.length - 1 && 'rounded-r-2xl',
                        meta.align === 'center' && 'text-center',
                        meta.align === 'right' && 'text-right'
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
                  className="border-0 border-b bg-white"
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
                          'overflow-hidden py-3 align-middle',
                          'px-4 sm:px-5 md:px-6',
                          meta.align === 'center' && 'text-center',
                          meta.align === 'right' && 'text-right'
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
                  className="font-poppins h-24 text-center text-[16px] text-[#4D4D4D]"
                >
                  No Invitations Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default InvitationsTable;
