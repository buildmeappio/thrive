'use client';

import { useState, useMemo, useEffect } from 'react';
import { matchesSearch } from '@/utils/search';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  type Row,
  type Column,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrganizationData } from '@/domains/organization/types/OrganizationData';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { capitalizeWords } from '@/utils/text';

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string) => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Utility function to truncate text with ellipsis
const truncateText = (text: string | null | undefined, maxLength: number = 28): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

type Props = {
  data: OrganizationData[];
  types?: string[];
  searchQuery?: string;
  filters?: {
    type: string;
  };
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/organization/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-white" />
      </div>
    </Link>
  );
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<OrganizationData, unknown>;
  children: React.ReactNode;
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
      className="flex cursor-pointer select-none items-center gap-2 transition-colors hover:text-[#000093]"
      onClick={handleSort}
    >
      <span>{children}</span>
      {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
      {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
      {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
    </div>
  );
};

const columnsDef = [
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Organization</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => {
      const name = row.getValue('name') as string;
      const capitalizedName = capitalizeWords(name);
      return (
        <div
          className="font-poppins truncate text-[16px] leading-normal text-[#4D4D4D]"
          title={capitalizedName}
        >
          {truncateText(capitalizedName, 28)}
        </div>
      );
    },
    minSize: 180,
    maxSize: 300,
    size: 240,
  },
  {
    accessorKey: 'typeName',
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => {
      const typeName = row.getValue('typeName') as string;
      const formattedType = typeName ? formatText(typeName) : 'N/A';
      return (
        <div
          className="font-poppins truncate text-[16px] leading-normal text-[#4D4D4D]"
          title={formattedType}
        >
          {truncateText(formattedType, 20)}
        </div>
      );
    },
    minSize: 120,
    maxSize: 200,
    size: 150,
  },
  {
    accessorKey: 'managerName',
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Representative</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => {
      const managerName = (row.getValue('managerName') as string) || 'N/A';
      const capitalizedManagerName = managerName === 'N/A' ? 'N/A' : capitalizeWords(managerName);
      return (
        <div
          className="font-poppins truncate text-[16px] leading-normal text-[#4D4D4D]"
          title={capitalizedManagerName}
        >
          {truncateText(capitalizedManagerName, 28)}
        </div>
      );
    },
    minSize: 150,
    maxSize: 250,
    size: 200,
  },
  {
    accessorKey: 'managerEmail',
    header: ({ column }: { column: Column<OrganizationData, unknown> }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    cell: ({ row }: { row: Row<OrganizationData> }) => {
      const email = (row.getValue('managerEmail') as string) || 'N/A';
      return (
        <div
          className="font-poppins truncate text-[16px] leading-normal text-[#4D4D4D]"
          title={email}
        >
          {truncateText(email, 30)}
        </div>
      );
    },
    minSize: 180,
    maxSize: 300,
    size: 220,
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }: { row: Row<OrganizationData> }) => {
      return <ActionButton id={row.original.id} />;
    },
    minSize: 60,
    maxSize: 60,
    size: 60,
    enableSorting: false,
  },
];

export default function OrganizationTableWithPagination({
  data,
  searchQuery = '',
  filters = { type: 'all' },
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    let result = data;

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter(d => d.typeName === filters.type);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(d =>
        [d.name, d.managerName, d.managerEmail, d.typeName]
          .filter(Boolean)
          .some(v => matchesSearch(searchQuery, v))
      );
    }

    return result;
  }, [data, searchQuery, filters]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // reset to first page when searching or filtering
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return {
    table,
    tableElement: (
      <>
        {/* Table */}
        <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
          <Table className="w-full table-fixed border-0">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const columnDef = columnsDef[header.index];
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
                            minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
                            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
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
                    No Organizations Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </>
    ),
  };
}
