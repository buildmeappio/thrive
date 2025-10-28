import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { ChaperoneData } from '../types/Chaperone';

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
        'font-poppins flex items-center gap-2 py-4 text-left text-[18px] leading-none font-semibold text-black',
        first && 'pl-4',
        sortable && 'cursor-pointer transition-colors select-none hover:text-[#000093]'
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

const ActionButton = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <button onClick={onEdit} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] p-0 hover:opacity-80">
        <Edit className="h-4 w-4 text-[#000093]" />
      </div>
    </button>
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

export const createChaperoneColumns = (
  onEdit: (chaperone: ChaperoneData) => void
): ColumnDef<ChaperoneData>[] => [
  {
    header: ({ column }) => (
      <Header
        first
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Full Name
      </Header>
    ),
    accessorKey: 'fullName',
    cell: ({ row }) => {
      return <Content first>{row.original.fullName}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Email
      </Header>
    ),
    accessorKey: 'email',
    cell: ({ row }) => {
      return <Content>{row.original.email}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Phone
      </Header>
    ),
    accessorKey: 'phone',
    cell: ({ row }) => {
      return <Content>{row.original.phone || 'N/A'}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Gender
      </Header>
    ),
    accessorKey: 'gender',
    cell: ({ row }) => {
      return <Content>{row.original.gender || 'N/A'}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Date Added
      </Header>
    ),
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      return <Content>{row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'N/A'}</Content>;
    },
    sortingFn: 'datetime',
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return <ActionButton onEdit={() => onEdit(row.original)} />;
    },
    maxSize: 60,
    enableSorting: false,
  },
];

