import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { CaseData } from '../../types/CaseData';
import { formatDate } from '@/utils/dateTime';

const Header = ({
  children,
  first,
  sortable,
  onClick,
  sortDirection,
}: {
  children: React.ReactNode;
  first?: boolean;
  sortable?: boolean;
  onClick?: () => void;
  sortDirection?: false | 'asc' | 'desc';
}) => {
  return (
    <div
      className={cn(
        'font-poppins flex items-center gap-2 py-4 text-left text-[15px] leading-none font-normal text-black',
        first && 'pl-4',
        sortable && 'cursor-pointer transition-colors select-none'
      )}
      onClick={sortable ? onClick : undefined}
    >
      <span>{children}</span>
      {sortable && (
        <div className="flex items-center">
          {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
          {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
          {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/dashboard/cases/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] p-0 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-[#000093]" />
      </div>
    </Link>
  );
};

const Content = ({ children, first }: { children: React.ReactNode; first?: boolean }) => {
  return (
    <p
      className={cn(
        'font-poppins font-regular py-2 text-left text-[16px] leading-none text-[#4D4D4D]',
        first && 'pl-4'
      )}
    >
      {children}
    </p>
  );
};

const columns: ColumnDef<CaseData>[] = [
  {
    header: ({ column }) => (
      <Header
        first
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Case No.
      </Header>
    ),
    accessorKey: 'number',
    cell: ({ row }) => {
      return <Content first>{row.original.number}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Claimant
      </Header>
    ),
    accessorKey: 'claimant',
    cell: ({ row }) => {
      return <Content>{row.original.claimant}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Date
      </Header>
    ),
    accessorKey: 'submittedAt',
    cell: ({ row }) => {
      return <Content>{formatDate(row.original.submittedAt)}</Content>;
    },
    sortingFn: 'datetime',
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Claim Type
      </Header>
    ),
    accessorKey: 'claimType',
    cell: ({ row }) => {
      return <Content>{row.original.claimType}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Specialty
      </Header>
    ),
    accessorKey: 'specialty',
    cell: ({ row }) => {
      return <Content>{row.original.specialty}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Status
      </Header>
    ),
    accessorKey: 'status',
    cell: ({ row }) => {
      return <Content>{row.original.status}</Content>;
    },
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
    enableSorting: false,
  },
];

export default columns;
