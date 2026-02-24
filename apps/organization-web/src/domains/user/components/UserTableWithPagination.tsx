'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { matchesSearch } from '@/utils/search';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
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
import { UserTableRow } from '../types/UserData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';

type useUserTableOptions = {
  data: UserTableRow[];
  searchQuery: string;
  togglingUserId: string | null;
  currentUserId?: string | null;
  onToggleStatus: (id: string, enabled: boolean) => void;
  onViewUser?: (userId: string) => void;
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const textCellClass = 'text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate';

const truncateText = (text: string | null | undefined, max = 30) => {
  if (!text) return 'N/A';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

const createColumns = (
  togglingUserId: string | null,
  currentUserId: string | null | undefined,
  onToggleStatus: (id: string, enabled: boolean) => void
): ColumnDef<UserTableRow, unknown>[] => [
  {
    id: 'name',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Name
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }: { row: Row<UserTableRow> }) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`.trim();
      return (
        <p className={textCellClass} title={fullName}>
          {truncateText(fullName, 30)}
        </p>
      );
    },
    accessorFn: row => `${row.firstName} ${row.lastName}`,
    meta: { minSize: 180, maxSize: 250, size: 220 } as ColumnMeta,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Email
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <p className={textCellClass} title={row.original.email}>
        {truncateText(row.original.email, 32)}
      </p>
    ),
    meta: { minSize: 220, maxSize: 320, size: 260 } as ColumnMeta,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Role
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const formattedRole = role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      return (
        <p className={textCellClass} title={formattedRole}>
          {truncateText(formattedRole, 20)}
        </p>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Added On
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <p className={textCellClass}>{format(new Date(row.original.createdAt), 'MMM dd, yyyy')}</p>
    ),
    meta: { minSize: 150, maxSize: 200, size: 170 } as ColumnMeta,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isToggling = togglingUserId === row.original.id;
      const enabled = row.original.isActive;
      const isCurrentUser = currentUserId === row.original.id;
      return (
        <div className="flex w-full items-center justify-center">
          <button
            type="button"
            className={cn(
              'relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              enabled ? 'bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]' : 'bg-gray-300',
              (isToggling || isCurrentUser) && 'cursor-not-allowed opacity-60'
            )}
            onClick={() => !isCurrentUser && onToggleStatus(row.original.id, !enabled)}
            disabled={isToggling || isCurrentUser}
            aria-pressed={enabled}
            title={isCurrentUser ? 'Cannot disable your own account' : undefined}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      );
    },
    meta: {
      minSize: 110,
      maxSize: 130,
      size: 110,
      align: 'center',
    } as ColumnMeta,
  },
];

export const useUserTable = (props: useUserTableOptions) => {
  const { data, searchQuery, togglingUserId, currentUserId, onToggleStatus } = props;
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        [user.firstName, user.lastName, user.email]
          .filter(Boolean)
          .some(value => matchesSearch(searchQuery, value))
      );
    }

    return filtered;
  }, [data, searchQuery]);

  const columns = useMemo(
    () => createColumns(togglingUserId, currentUserId, onToggleStatus),
    [togglingUserId, currentUserId, onToggleStatus]
  );

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

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, table]);

  return {
    table,
    columns,
  };
};

type UserTableProps = {
  table: ReturnType<typeof useUserTable>['table'];
  columns: ReturnType<typeof useUserTable>['columns'];
};

const UserTable: React.FC<UserTableProps> = ({ table, columns }) => {
  return (
    <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
      <Table className="w-full table-fixed border-0">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const column = header.column.columnDef;
                const meta = (column.meta as ColumnMeta) || {};
                const isStatusColumn = header.column.id === 'status';
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
                      isStatusColumn ? 'px-2 sm:px-4 md:px-6' : 'px-4 sm:px-5 md:px-6',
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
                  const isStatusColumn = cell.column.id === 'status';
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
                        isStatusColumn ? 'px-2 sm:px-4 md:px-6' : 'px-4 sm:px-5 md:px-6',
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
                No Users Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
