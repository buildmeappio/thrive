'use client';

import { useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InterpreterData } from '@/domains/interpreter/types/InterpreterData';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FilterState {
  languageId: string;
}

type useInterpreterTableOptions = {
  data: InterpreterData[];
  searchQuery: string;
  filters?: FilterState;
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/interpreter/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-white" />
      </div>
    </Link>
  );
};

const createColumns = (): ColumnDef<InterpreterData, unknown>[] => [
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ row }) => (
      <div className="font-poppins whitespace-nowrap text-[16px] leading-none text-[#4D4D4D]">
        {row.getValue('companyName')}
      </div>
    ),
  },
  {
    accessorKey: 'contactPerson',
    header: 'Contact Person',
    cell: ({ row }) => (
      <div className="font-poppins whitespace-nowrap text-[16px] leading-none text-[#4D4D4D]">
        {row.getValue('contactPerson')}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="font-poppins whitespace-nowrap text-[16px] leading-none text-[#4D4D4D]">
        {row.getValue('email')}
      </div>
    ),
  },
  {
    accessorKey: 'languages',
    header: 'Languages',
    cell: ({ row }) => {
      const languages = row.original.languages;
      const displayText =
        languages.length > 2
          ? `${languages
              .slice(0, 2)
              .map(l => l.name)
              .join(', ')} +${languages.length - 2}`
          : languages.map(l => l.name).join(', ');
      return (
        <div className="font-poppins whitespace-nowrap text-[16px] leading-none text-[#4D4D4D]">
          {displayText || 'None'}
        </div>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <div className="font-poppins whitespace-nowrap text-[16px] leading-none text-[#4D4D4D]">
        {row.getValue('phone') || 'N/A'}
      </div>
    ),
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
  },
];

export const useInterpreterTable = (props: useInterpreterTableOptions) => {
  const { data, searchQuery, filters } = props;

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by language
    if (filters?.languageId && filters.languageId !== 'all') {
      result = result.filter(d => d.languages.some(lang => lang.id === filters.languageId));
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(d =>
        [d.companyName, d.contactPerson, d.email, d.phone, ...d.languages.map(l => l.name)]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, searchQuery, filters]);

  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return {
    table,
    columns,
  };
};

type InterpreterTableProps = {
  table: ReturnType<typeof useInterpreterTable>['table'];
  columns: ReturnType<typeof useInterpreterTable>['columns'];
};

const InterpreterTable: React.FC<InterpreterTableProps> = ({ table, columns }) => {
  return (
    <div className="overflow-x-auto rounded-md outline-none">
      <Table className="min-w-[900px] border-0">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'whitespace-nowrap px-6 py-2 text-left text-base font-medium text-black',
                    header.index === 0 && 'rounded-l-2xl',
                    header.index === headerGroup.headers.length - 1 && 'w-[60px] rounded-r-2xl'
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
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
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="px-6 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="font-poppins h-24 text-center text-[16px] leading-none text-black"
              >
                No Interpreters Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InterpreterTable;
